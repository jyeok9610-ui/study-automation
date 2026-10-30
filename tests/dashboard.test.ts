import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { summarizeReading } from '../src/lib/overview.ts';
import { parseReading, type Progress } from '../src/lib/storage.ts';
const book=JSON.parse(fs.readFileSync('public/content/books/first-sentences.json','utf8'));

test('진도는 실제 페이지의 중복 없는 읽음 표시만 집계한다',()=>{
 const p:Progress={bookId:book.id,pageId:book.pages[0].id,blockId:'block',offset:0,version:book.version,updatedAt:100,readPages:[book.pages[0].id,book.pages[0].id,'removed-page'],reviewPages:[book.pages[1].id,'removed-page']};
 const result=summarizeReading([book],[p]);assert.equal(result.readPages,1);assert.equal(result.totalPages,8);assert.equal(result.percent,13);assert.equal(result.rows[0].reviewPages.length,1);assert.equal(result.recent.length,1);
 assert.equal(summarizeReading([],[]).percent,0);assert.equal(summarizeReading([book],[]).percent,0);
 assert.equal(summarizeReading([book],[{...p,pageId:'removed-page'}]).recent.length,0);
});
test('이전 백업은 북마크 없이도 읽고 새 북마크는 안전한 키로 정규화한다',()=>{
 const legacy={format:'study-library-reading',version:1,progress:[],notes:[]};assert.deepEqual(parseReading(legacy).bookmarks,[]);
 const data=parseReading({...legacy,bookmarks:[{id:'other-setting',bookId:book.id,pageId:book.pages[0].id,updatedAt:50,answers:['discard'],score:100}]});
 assert.equal(data.bookmarks[0].id,'bookmark/'+book.id+'/'+book.pages[0].id);assert.ok(!('answers' in data.bookmarks[0]));assert.ok(!('score' in data.bookmarks[0]));
 assert.throws(()=>parseReading({...legacy,bookmarks:[{bookId:book.id,pageId:'../settings',updatedAt:50}]}),/북마크/);
 assert.throws(()=>parseReading({...legacy,bookmarks:'invalid'}),/북마크/);
});
