import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getWordEntries } from '../src/lib/word-data.ts';
import { getReadingGuide, characterReadings } from '../src/lib/word-readings.ts';
const book=JSON.parse(fs.readFileSync('public/content/books/first-sentences.json','utf8'));
const entries=getWordEntries(book.glossary);
const entry=(word:string)=>entries.find(item=>item.word===word)!;

test('현재 한자 단어의 읽기 분해는 원래 표기와 전체 발음을 보존한다',()=>{
 for(const item of entries.filter(item=>/\p{Script=Han}/u.test(item.word))){
  const guide=getReadingGuide(item);assert.ok(guide,item.word);
  assert.equal(guide.parts.map(part=>part.text).join(''),item.word,item.word);
  const reading=guide.parts.map(part=>part.reading).join('');assert.ok(reading===item.reading||reading===item.reading.split('／')[0],item.word+': '+reading);
  for(const character of item.word.match(/\p{Script=Han}/gu)||[])assert.ok(guide.grouped||characterReadings(guide,character),item.word+': '+character);
 }
});
test('같은 한자라도 단어의 소리를 쓰고 불규칙 표현은 묶어서 안내한다',()=>{
 assert.equal(characterReadings(getReadingGuide(entry('学生')),'生'),'せい');
 assert.equal(characterReadings(getReadingGuide(entry('誕生日')),'生'),'じょう');
 assert.equal(characterReadings(getReadingGuide(entry('誕生日')),'日'),'び');
 assert.equal(characterReadings(getReadingGuide(entry('1本')),'本'),'ぽん');
 assert.equal(characterReadings(getReadingGuide(entry('3本')),'本'),'ぼん');
 for(const word of ['1日','2日','20日','1人','2人','時計']){const guide=getReadingGuide(entry(word))!;assert.equal(guide.grouped,true);assert.equal(guide.parts.length,1);}
});