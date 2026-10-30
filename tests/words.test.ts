import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createWordMatcher } from '../src/lib/words.ts';
const book=JSON.parse(fs.readFileSync('public/content/books/first-sentences.json','utf8'));
const meanings=JSON.parse(fs.readFileSync('src/content/japanese-kanji.json','utf8'));
const split=createWordMatcher(book.glossary);

test('단어 전체를 긴 일치부터 연결하고 원문과 반복 호출을 보존한다',()=>{
 for(const text of ['私は学生です。学生じゃありません。','携帯電話と電話。','ノートパソコンとパソコン。','24日と4月。']){
  const parts=split(text);assert.equal(parts.map(p=>p.text).join(''),text);assert.deepEqual(split(text),parts);
 }
 assert.deepEqual(split('携帯電話と電話').filter(p=>p.entry).map(p=>p.text),['携帯電話','電話']);
 assert.deepEqual(split('学生です').filter(p=>p.entry).map(p=>p.text),['学生']);
 assert.equal(split('日本語・大学生・1本・214日').filter(p=>p.entry).length,0);
});
test('현재 123개 단어 및 구성 한자 풀이를 빠짐없이 연결한다',()=>{
 for(const entry of book.glossary){assert.ok(split(entry.word).some(p=>p.entry?.word===entry.word),entry.word);for(const character of entry.word.match(/\p{Script=Han}/gu)||[])assert.ok(meanings[character],character);}
 assert.equal(meanings.学,'배울 학');assert.equal(meanings.生,'날 생');
 assert.equal(split('<学生>')[1].text,'学生');
});