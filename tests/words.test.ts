import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createWordMatcher } from '../src/lib/words.ts';
import { getWordEntries } from '../src/lib/word-data.ts';
const book=JSON.parse(fs.readFileSync('public/content/books/first-sentences.json','utf8'));
const meanings=JSON.parse(fs.readFileSync('src/content/japanese-kanji.json','utf8'));
const entries=getWordEntries(book.glossary);
const split=createWordMatcher(entries);

test('단어 전체를 긴 일치부터 연결하고 원문과 반복 호출을 보존한다',()=>{
 for(const text of ['私は学生です。学生じゃありません。','携帯電話と電話。','ノートパソコンとパソコン。','24日と4月。']){
  const parts=split(text);assert.equal(parts.map(p=>p.text).join(''),text);assert.deepEqual(split(text),parts);
 }
 assert.deepEqual(split('携帯電話と電話').filter(p=>p.entry).map(p=>p.text),['携帯電話','電話']);
 assert.deepEqual(split('学生です').filter(p=>p.entry).map(p=>p.text),['学生']);
 assert.equal(split('未登録語・大学生・214日').filter(p=>p.entry).length,0);
});
test('원래 단어와 보충 단어의 구성 한자 풀이를 빠짐없이 연결한다',()=>{
 for(const entry of entries){assert.ok(split(entry.word).some(p=>p.entry?.word===entry.word),entry.word);for(const character of entry.word.match(/\p{Script=Han}/gu)||[])assert.ok(meanings[character],character);}
 assert.equal(meanings.学,'배울 학');assert.equal(meanings.生,'날 생');
 assert.equal(split('<学生>')[1].text,'学生');
});
test('붙여 쓴 단어도 나누고 날짜·시각·수량은 전체 읽기를 보존한다',()=>{
 assert.deepEqual(split('一番好きです。').filter(p=>p.entry).map(p=>p.text),['一番','好き']);
 for(const [text,reading] of [['会社員','かいしゃいん'],['日本語','にほんご'],['何時','なんじ'],['3日','みっか'],['1本','いっぽん']])assert.equal(split(text).find(p=>p.entry)?.entry?.reading,reading);
 for(const block of book.pages.find((p:any)=>p.id==='dates').blocks)for(const row of block.rows||[])if(/^\d+(月|日|時|分)$/.test(row[0]))assert.equal(split(row[0]).find(p=>p.entry)?.entry?.reading,row[1]);
 assert.equal(entries.find(entry=>entry.word==='学生')?.id,book.glossary.find((entry:any)=>entry.word==='学生').id);
});
test('현재 수업 자료의 모든 한자 표기에 사전 연결 데이터가 있다',()=>{
 const strings=(value:unknown):string[]=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(strings):value&&typeof value==='object'?Object.values(value).flatMap(strings):[];
 for(const page of book.pages)for(const text of strings(page.blocks))for(const part of split(text))if(!part.entry)assert.ok(!/\p{Script=Han}/u.test(part.text),page.id+': '+part.text);
});