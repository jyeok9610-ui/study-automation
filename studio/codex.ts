import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
export class AgentError extends Error {constructor(public status:string,message:string){super(message);}}
const children=new Map<string,ChildProcess>();
export function stopAgent(jobId:string){const child=children.get(jobId);if(!child?.pid)return;if(process.platform==='win32')spawn('taskkill',['/pid',String(child.pid),'/t','/f'],{windowsHide:true,stdio:'ignore'});else child.kill('SIGTERM');}
export function classifyError(message:string){
  if(/usage limit|quota|rate.limit|exceeded.*limit|insufficient_quota/i.test(message))return 'waiting_quota';
  if(/not logged|unauthorized|authentication|401|refresh token|sign in|login/i.test(message))return 'waiting_auth';
  if(/aside|browser.*connect|MCP.*initializ|MCP.*startup/i.test(message))return 'waiting_browser';
  return 'failed';
}
export async function runAgent(jobId:string,folder:string,role:string,prompt:string,enableBrowser:boolean):Promise<{artifact:unknown;usage:unknown}> {
  const schema={type:'object',properties:{artifact_json:{type:'string'}},required:['artifact_json'],additionalProperties:false};
  const schemaPath=path.join(folder,role+'-envelope.schema.json'),output=path.join(folder,role+'-output.json');
  fs.writeFileSync(schemaPath,JSON.stringify(schema));fs.writeFileSync(path.join(folder,role+'-prompt.txt'),prompt,'utf8');
  const args=['exec','--ephemeral','--ignore-user-config','--sandbox','read-only','--json','--color','never','--cd',folder,'--config','web_search="disabled"','--output-schema',schemaPath,'--output-last-message',output,'-'];
  if(enableBrowser){
    const aside=process.env.ASIDE_EXE||path.join(process.env.LOCALAPPDATA||'','Aside','CLI','current','aside.exe');
    if(!fs.existsSync(aside))throw new AgentError('waiting_browser','Aside 실행 파일을 찾지 못했습니다. 다른 검색 도구로 바꾸지 않고 대기합니다.');
    args.push('--config','mcp_servers.aside.command='+JSON.stringify(aside),'--config','mcp_servers.aside.args=["mcp"]','--config','mcp_servers.aside.required=true');
  }
  const executable=process.env.CODEX_EXE||'codex';
  return new Promise((resolve,reject)=>{
    const child=spawn(executable,args,{cwd:folder,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});children.set(jobId,child);
    const stream=fs.createWriteStream(path.join(folder,role+'-events.jsonl'),{flags:'w'});let tail='',usage:unknown={},settled=false;
    const finish=(error?:Error,result?:{artifact:unknown;usage:unknown})=>{if(settled)return;settled=true;clearTimeout(timer);children.delete(jobId);stream.end();if(error)reject(error);else resolve(result!);};
    const collect=(chunk:Buffer)=>{const s=chunk.toString();tail=(tail+s).slice(-16000);stream.write(s);for(const line of s.split('\n')){try{const value=JSON.parse(line);if(value.type==='turn.completed')usage=value.usage||{};}catch{}}};
    child.stdout?.on('data',collect);child.stderr?.on('data',collect);child.on('error',error=>finish(new AgentError('failed','Codex 실행을 시작하지 못했습니다: '+error.message)));
    child.on('close',code=>{
      if(code!==0){finish(new AgentError(classifyError(tail),'Codex '+role+' 실행을 마치지 못했습니다. '+tail.slice(-2200)));return;}
      try{const envelope=JSON.parse(fs.readFileSync(output,'utf8'));if(typeof envelope.artifact_json!=='string')throw new Error('구조화 출력 필드가 없습니다.');finish(undefined,{artifact:JSON.parse(envelope.artifact_json),usage});}catch(error){finish(new AgentError('failed','역할 출력 JSON을 읽지 못했습니다: '+(error as Error).message));}
    });
    const timer=setTimeout(()=>{stopAgent(jobId);finish(new AgentError('interrupted','역할 실행이 20분을 넘어 중단했습니다. 저장된 단계부터 재개할 수 있습니다.'));},20*60*1000);
    child.stdin?.end(prompt);
  });
}

