import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateBook, LibrarySchema, summarize } from '../src/shared/schema.ts';
import { searchBooks, validateLibraryLinks } from '../src/lib/search.ts';

const book=validateBook(JSON.parse(fs.readFileSync('public/content/books/introduction-to-philosophy.json','utf8')));
const library=LibrarySchema.parse(JSON.parse(fs.readFileSync('public/content/library.json','utf8')));

test('철학 네 회차와 서술형 16문제·원문·목록을 연결한다',()=>{
 assert.equal(book.pages.length,4);
 assert.deepEqual(book.pages.map(page=>page.blocks.filter(block=>block.type==='reflection').length),[4,4,4,4]);
 assert.ok(book.pages.every(page=>page.blocks.filter(block=>block.reflection).every(block=>block.reflection!.explanation.length>15)));
 assert.deepEqual(library.books.find(entry=>entry.id===book.id),summarize(book));
 assert.ok(library.subjects.some(subject=>subject.id===book.subject));
 validateLibraryLinks(library,library.books.map(entry=>validateBook(JSON.parse(fs.readFileSync('public/content/books/'+entry.id+'.json','utf8')))));
 assert.ok(book.sources.every(source=>source.url?.startsWith('https://openstax.org/books/introduction-philosophy/')));
});

test('서술형 본문·해설 누락과 실행 가능한 출처 주소를 거부한다',()=>{
 let candidate=structuredClone(book);
 const reflection=candidate.pages[0].blocks.find(block=>block.type==='reflection')!;
 delete reflection.reflection;
 assert.throws(()=>validateBook(candidate),/서술형/);
 candidate=structuredClone(book);
 candidate.pages[0].blocks.find(block=>block.reflection)!.reflection!.explanation='짧음';
 assert.throws(()=>validateBook(candidate));
 candidate=structuredClone(book);
 candidate.sources[0].url='javascript:alert(1)';
 assert.throws(()=>validateBook(candidate),/HTTP/);
});

test('철학 서술형 질문을 검색하고 분야를 필터링한다',()=>{
 const candidate=structuredClone(book);
 candidate.pages[0].blocks.find(block=>block.reflection)!.reflection!.prompt='서술형질문검색전용어';
 assert.equal(searchBooks([candidate],'서술형질문검색전용어','philosophy').length,1);
 assert.equal(searchBooks([candidate],'서술형질문검색전용어','japanese').length,0);
 assert.ok(searchBooks([book],'반성적 평형','philosophy').length>0);
});