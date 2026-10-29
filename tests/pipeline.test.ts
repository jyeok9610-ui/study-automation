import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.STUDY_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'study-pipeline-test-'));
const {checkProducedBook}=await import('../studio/pipeline.ts');
const {approvedRepository}=await import('../studio/publish.ts');
const book=JSON.parse(fs.readFileSync('public/content/books/first-sentences.json','utf8'));
const research={items:book.coverage.map((c:any)=>({id:c.sourceId}))};
test('검수 전 자동 검사는 누락 출처와 확인 문제 없는 제작물을 막는다',()=>{
 assert.equal(checkProducedBook(book,research).id,'first-sentences');
 const b=structuredClone(book);b.coverage=b.coverage.filter((c:any)=>c.sourceId!=='S010');assert.throws(()=>checkProducedBook(b,research),/원자료/);
 const c=structuredClone(book);c.pages[0].blocks=c.pages[0].blocks.filter((b:any)=>b.type!=='question');assert.throws(()=>checkProducedBook(c,research),/확인 문제/);
});
test('발행 대상은 명시한 owner/repository 형식만 받는다',()=>{
 assert.throws(()=>approvedRepository(undefined));assert.throws(()=>approvedRepository('other/repo;command'));assert.equal(approvedRepository('jyeok9610-ui/study-automation'),'jyeok9610-ui/study-automation');
});

