import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateBook, LibrarySchema } from '../src/shared/schema.ts';
import { searchBooks, validateLibraryLinks } from '../src/lib/search.ts';
import { parseReading } from '../src/lib/storage.ts';
const book=JSON.parse(fs.readFileSync(path.resolve('public/content/books/first-sentences.json'),'utf8'));
const library=LibrarySchema.parse(JSON.parse(fs.readFileSync(path.resolve('public/content/library.json'),'utf8')));
test('실제 원자료01 책의 원문·문항·용어집·연결을 검증한다',()=>{
 const b=validateBook(book);assert.equal(b.pages.length,8);assert.ok(b.pages.flatMap(p=>p.blocks).filter(b=>b.type==='question').length>=20);assert.equal(new Set(b.coverage.map(c=>c.sourceId)).size,10);assert.ok(b.glossary.length>=20);validateLibraryLinks(library,[b]);
 for(const p of b.pages)for(const block of p.blocks)if(block.question)assert.ok(block.question.explanation.length>15);
});
test('없는 출처·정답 번호·중복 ID·경로 유출을 거부한다',()=>{
 let b=structuredClone(book);b.pages[0].blocks[0].sourceIds=['not-a-source'];assert.throws(()=>validateBook(b),/출처/);
 b=structuredClone(book);const q=b.pages.flatMap((p:any)=>p.blocks).find((b:any)=>b.question);q.question.answer=999;assert.throws(()=>validateBook(b));
 b=structuredClone(book);b.pages[1].blocks[0].id=b.pages[0].blocks[0].id;assert.throws(()=>validateBook(b),/중복/);
 b=structuredClone(book);b.summary='C:\\Users\\private\\source.md';assert.throws(()=>validateBook(b),/공개/);
 b=structuredClone(book);b.version='../escape';assert.throws(()=>validateBook(b));
});
test('짧은 한국어·일본어·정규화·빈 결과와 필터가 작동한다',()=>{
 assert.ok(searchBooks([book],'は').length);assert.ok(searchBooks([book],'취미').length);assert.ok(searchBooks([book],'こと').length);assert.equal(searchBooks([book],'없는단어qzx').length,0);assert.equal(searchBooks([book],'は','camera').length,0);assert.equal(searchBooks([book],'   ').length,0);
});
test('백업 가져오기는 풀이 이력을 복원하지 않고 공개 형식만 허용한다',()=>{
 assert.throws(()=>parseReading({format:'different',version:1,progress:[],notes:[]}));
 const value=parseReading({format:'study-library-reading',version:1,progress:[{bookId:'b',pageId:'p',blockId:'x',offset:8,version:'1',updatedAt:2,readPages:['p'],reviewPages:[],answers:['secret'],score:90}],notes:[{id:'b/p',bookId:'b',pageId:'p',text:'직접 쓴 생각',updatedAt:3}]});
 assert.equal(value.progress[0].offset,1);assert.ok(!('answers' in value.progress[0]));assert.ok(!('score' in value.progress[0]));assert.equal(value.notes[0].text,'직접 쓴 생각');
});

