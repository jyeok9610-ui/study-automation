import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { backupStudio, createJob, getJob, listJobs, ROOT } from './repository.ts';
import { cancelJob, resumeJob, startWorker } from './pipeline.ts';
import { build } from 'vite';
import { publishJob } from './publish.ts';
const PORT=Number(process.env.STUDIO_PORT||4311);
const stop=process.env.STUDIO_NO_WORKER==='1'?()=>{}:startWorker();
function send(res:http.ServerResponse,code:number,value:unknown){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));}
function allowed(req:http.IncomingMessage){const hosts=new Set(['127.0.0.1:'+PORT,'localhost:'+PORT]);if(!hosts.has(req.headers.host||''))return false;if(req.headers.origin){try{if(!hosts.has(new URL(req.headers.origin).host))return false;}catch{return false;}}return true;}
async function body(req:http.IncomingMessage){let bytes=0,chunks:Buffer[]=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>4*1024*1024)throw new Error('등록 자료는 4MB 이하여야 합니다.');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
const server=http.createServer(async(req,res)=>{
 if(!allowed(req)){send(res,403,{error:'PC 로컬 제작 화면에서만 요청할 수 있습니다.'});return;}
 const url=new URL(req.url||'/','http://127.0.0.1:'+PORT);
 if(req.method==='GET'&&url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'"});res.end(fs.readFileSync(path.join(ROOT,'studio','index.html'),'utf8'));return;}
 try{
  if(req.method==='GET'&&url.pathname==='/api/jobs'){send(res,200,{jobs:listJobs()});return;}
  if(req.method==='GET'&&url.pathname==='/api/health'){send(res,200,{ok:true,localOnly:true,publicBuild:false});return;}
  if(req.method!=='POST'){send(res,404,{error:'요청한 기능이 없습니다.'});return;}
  if(!req.headers['content-type']?.startsWith('application/json')){send(res,415,{error:'JSON 요청만 받을 수 있습니다.'});return;}
  if(url.pathname==='/api/jobs'){const input=await body(req);send(res,201,createJob(input.title,input.subject,input.source,input.context||''));return;}
  if(url.pathname==='/api/presets/japanese-01'){
   await body(req);const folder=path.join(ROOT,'data','imports','japanese-01');if(!fs.existsSync(path.join(folder,'source.md')))throw new Error('지정된 일본어 원자료 복사본이 없습니다.');
   const source=fs.readFileSync(path.join(folder,'source.md'),'utf8'),context=fs.readFileSync(path.join(folder,'corrections.md'),'utf8')+'\n초보자 설명 방식의 예:\n'+fs.readFileSync(path.join(folder,'style-01a.md'),'utf8').slice(0,11000);
   send(res,201,createJob('일본어 원자료01 자동 제작','japanese',source,context));return;
  }
  const match=url.pathname.match(/^\/api\/jobs\/([a-f0-9-]{36})\/(cancel|resume)$/);
  if(match){await body(req);if(!getJob(match[1])){send(res,404,{error:'작업이 없습니다.'});return;}if(match[2]==='cancel')cancelJob(match[1]);else resumeJob(match[1]);send(res,200,{job:getJob(match[1])});return;}
  if(url.pathname==='/api/publish'){const input=await body(req);try{const result=await publishJob(input.jobId);send(res,200,result);}catch(error){if(input.jobId&&getJob(input.jobId)){const current=getJob(input.jobId)!;const {updateJob}=await import('./repository.ts');updateJob(input.jobId,'publish_failed','publish',(error as Error).message);}throw error;}return;}
    if(url.pathname==='/api/backup'){await body(req);send(res,200,backupStudio());return;}
  if(url.pathname==='/api/build'){await body(req);await build({root:ROOT});send(res,200,{message:'정적 빌드를 마쳤습니다. 원격 업로드·Pages 배포 성공은 아직 확인하지 않았습니다.'});return;}
  send(res,404,{error:'요청한 기능이 없습니다.'});
 }catch(error){send(res,400,{error:(error as Error).message});}
});
server.listen(PORT,'127.0.0.1',()=>console.log('제작 스튜디오 http://127.0.0.1:'+PORT+' (이 PC 전용)'));
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{stop();server.close(()=>process.exit());});

