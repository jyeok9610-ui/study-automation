import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { classifyError } from '../studio/codex.ts';
test('인증·한도·브라우저 문제를 다른 상태로 분리한다',()=>{assert.equal(classifyError('rate limit exceeded'),'waiting_quota');assert.equal(classifyError('authentication failed 401'),'waiting_auth');assert.equal(classifyError('Aside MCP initialization failed'),'waiting_browser');assert.equal(classifyError('invalid JSON'),'failed');});
test('PC API는 중복 작업·원점 제한·중단/재개·일관 백업을 처리한다',async()=>{
 const data=fs.mkdtempSync(path.join(os.tmpdir(),'study-studio-test-')),port=14311;
 const child=spawn(process.execPath,['--import','tsx','studio/server.ts'],{cwd:process.cwd(),env:{...process.env,STUDIO_PORT:String(port),STUDY_DATA_DIR:data,STUDIO_NO_WORKER:'1'},stdio:['ignore','pipe','pipe'],windowsHide:true});let output='';child.stderr.on('data',v=>output+=v);
 const base='http://127.0.0.1:'+port;try{
  let ready=false;for(let i=0;i<70;i++){try{ready=(await fetch(base+'/api/health')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,output);
  const post=(url:string,body:unknown,headers:Record<string,string>={})=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
  assert.equal((await post('/api/jobs',{title:'악성 원점',subject:'japanese',source:'test data'.repeat(10)},{Origin:'https://example.com'})).status,403);
  const input={title:'테스트 학습책',subject:'japanese',source:'これは本です。를 충분히 설명하는 원문입니다. '.repeat(3)};
  const first=await (await post('/api/jobs',input)).json() as any;assert.ok(first.job.id);
  const duplicate=await (await post('/api/jobs',input)).json() as any;assert.equal(duplicate.duplicate,true);assert.equal(duplicate.job.id,first.job.id);
  await post('/api/jobs/'+first.job.id+'/cancel',{});let list=await (await fetch(base+'/api/jobs')).json() as any;assert.equal(list.jobs[0].status,'cancelled');
  await post('/api/jobs/'+first.job.id+'/resume',{});list=await (await fetch(base+'/api/jobs')).json() as any;assert.equal(list.jobs[0].status,'queued');
  const backup=await (await post('/api/backup',{})).json() as any;assert.ok(fs.existsSync(path.join(backup.folder,'studio.sqlite')));assert.ok(fs.existsSync(path.join(backup.folder,'jobs',first.job.id,'source.md')));
  assert.equal((await post('/api/jobs',{title:'짧음',subject:'japanese',source:'짧다'})).status,400);
 }finally{child.kill();}
});

