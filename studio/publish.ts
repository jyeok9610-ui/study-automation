import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, updateJob } from './repository.ts';
import { LibrarySchema, validateBook } from '../src/shared/schema.ts';
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function run(executable:string,args:string[]):Promise<string>{
 return new Promise((resolve,reject)=>{const child=spawn(executable,args,{cwd:ROOT,windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',s=>output+=s);child.stderr.on('data',s=>output+=s);child.on('error',reject);child.on('close',code=>code===0?resolve(output.trimEnd()):reject(new Error(output.slice(-4000)||'명령 실행에 실패했습니다.')));});
}
export function approvedRepository(value:string|undefined){
 if(!value||!/^[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+$/.test(value))throw new Error('승인된 배포 저장소를 STUDY_PUBLISH_REPO=owner/repository로 설정해주세요.');
 return value;
}
export async function publishJob(jobId?:string){
 const repo=approvedRepository(process.env.STUDY_PUBLISH_REPO);
 const signal=(message:string)=>{if(jobId)updateJob(jobId,'publishing','publish',message);};
 const expected='https://github.com/'+repo;
 const remote=(await run('git',['remote','get-url','origin'])).replace(/\.git$/,'');
 if(remote!==expected&&remote!=='git@github.com:'+repo)throw new Error('코드 원격이 승인된 공개 배포 대상과 다릅니다.');
 if(await run('git',['branch','--show-current'])!=='master')throw new Error('배포는 지정 master 브랜치에서만 실행합니다.');
 const dirty=await run('git',['status','--porcelain']);
 const paths=dirty.split(/\r?\n/).filter(Boolean).map(s=>s.slice(3).replace(/^"|"$/g,''));
 if(paths.some(p=>!p.startsWith('public/content/')))throw new Error('공개 콘텐츠 외에 정리되지 않은 코드 변경이 있습니다. 관련 코드 커밋을 먼저 마쳐주세요.');
 const folder=path.join(ROOT,'public','content'),manifest=LibrarySchema.parse(JSON.parse(fs.readFileSync(path.join(folder,'library.json'),'utf8')));
 for(const b of manifest.books)validateBook(JSON.parse(fs.readFileSync(path.join(folder,'books',b.id+'.json'),'utf8')));
 const npm=process.env.npm_execpath||path.join(path.dirname(process.execPath),'node_modules','npm','bin','npm-cli.js');
 if(!fs.existsSync(npm))throw new Error('npm 실행 경로를 찾지 못했습니다. npm run studio로 실행해주세요.');
 signal('테스트·콘텐츠·공개 빌드와 노출 범위를 확인합니다.');
 await run(process.execPath,[npm,'test']);await run(process.execPath,[npm,'run','validate']);await run(process.execPath,[npm,'run','build']);
 const forbidden=['studio','data','src','AGENTS.md','PRODUCT.md','.env','studio.sqlite'];
 for(const name of forbidden)if(fs.existsSync(path.join(ROOT,'dist',name)))throw new Error('공개 빌드에 제작 파일이 포함됐습니다: '+name);
 await run('git',['add','--','public/content']);
 const staged=(await run('git',['diff','--cached','--name-only'])).split(/\r?\n/).filter(Boolean);
 if(staged.some(p=>!p.startsWith('public/content/')))throw new Error('지정 공개 콘텐츠 외에 스테이징된 파일이 있습니다.');
 if(staged.length)await run('git',['commit','-m','content: publish reviewed learning book']);
 const head=await run('git',['rev-parse','HEAD']);signal('승인된 코드 원격의 master에 반영합니다.');await run('git',['push','origin','master']);
 const site='https://'+repo.split('/')[0]+'.github.io/'+repo.split('/')[1]+'/';
 signal('GitHub Actions 배포와 실제 사이트 판본을 확인합니다.');
 let runUrl='';
 for(let i=0;i<80;i++){
  const response=await fetch('https://api.github.com/repos/'+repo+'/actions/runs?branch=master&per_page=10',{headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok)throw new Error('GitHub 배포 상태를 읽지 못했습니다: '+response.status);
  const data=await response.json() as any;const workflow=data.workflow_runs?.find((r:any)=>r.head_sha===head&&r.path==='.github/workflows/deploy.yml');
  if(workflow){runUrl=workflow.html_url;if(workflow.status==='completed'&&workflow.conclusion!=='success')throw new Error('GitHub Pages 워크플로가 실패했습니다: '+runUrl);if(workflow.conclusion==='success'){
   const live=await fetch(site+'content/library.json?t='+Date.now(),{cache:'no-store'});
   if(live.ok){const published=LibrarySchema.parse(await live.json());if(published.version===manifest.version&&manifest.books.every(b=>published.books.some(p=>p.id===b.id&&p.version===b.version))){signal('실제 공개 사이트 판본을 확인했습니다.');if(jobId)updateJob(jobId,'published','publish',site);return {url:site,commit:head,workflow:runUrl};}}
  }}
  await pause(8000);
 }
 throw new Error('업로드했지만 제한 시간 안에 실제 공개 판본을 확인하지 못했습니다. 배포 완료로 처리하지 않습니다. '+runUrl);
}

