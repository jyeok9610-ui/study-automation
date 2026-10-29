import fs from 'node:fs';
import path from 'node:path';
import { LibrarySchema,validateBook } from '../src/shared/schema.ts';
import { validateLibraryLinks } from '../src/lib/search.ts';
const folder=path.resolve('public/content');const library=LibrarySchema.parse(JSON.parse(fs.readFileSync(path.join(folder,'library.json'),'utf8')));
const books=library.books.map(summary=>{const book=validateBook(JSON.parse(fs.readFileSync(path.join(folder,'books',summary.id+'.json'),'utf8')));if(summary.pageCount!==book.pages.length||summary.version!==book.version)throw new Error('manifest 판본 불일치: '+book.id);return book;});
validateLibraryLinks(library,books);
for(const book of books)for(const page of book.pages)for(const block of page.blocks){
 if(block.headers&&block.rows?.some(row=>row.length!==block.headers!.length))throw new Error('표 열 불일치: '+block.id);
 if(block.question?.wrongExplanations&&block.question.wrongExplanations.length!==block.question.options.length)throw new Error('선택지 해설 수 불일치: '+block.id);
}
console.log('콘텐츠·판본·표·문항·노선·개념 연결 검증: '+books.length+'권 통과');

