import fs from 'node:fs';
import path from 'node:path';
import { runAgent } from '../studio/codex.ts';
const folder=path.resolve('data/pilot');fs.mkdirSync(folder,{recursive:true});
const result=await runAgent('pilot-connection',folder,'connection','파일·도구·인터넷을 사용하지 마세요. 구조화 출력 연결 확인입니다. artifact_json 필드에 JSON {"ok":true,"message":"연결 확인"}를 문자열로 넣어 반환하세요.',false);
console.log(JSON.stringify({artifact:result.artifact,usage:result.usage}));

