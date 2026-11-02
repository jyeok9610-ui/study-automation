import type { Book, Library } from '../shared/schema';
export function normalize(text:string) { return text.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim(); }
export type SearchResult={bookId:string;pageId:string;title:string;bookTitle:string;subject:string;level:string;snippet:string};
export function searchBooks(books:Book[],query:string,subject='',level=''):SearchResult[] {
  const words=normalize(query).split(' ').filter(Boolean);
  if(!words.length) return [];
  return books.filter(b=>(!subject||b.subject===subject)&&(!level||b.level===level)).flatMap(b=>
    b.pages.flatMap(p=>{
      const text=[p.goal,...p.blocks.flatMap(x=>[x.title||'',x.text||'',...(x.examples||[]).flatMap(e=>[e.ja,e.reading,e.meaning]),...(x.rows||[]).flat(),x.question?.prompt||'',x.reflection?.prompt||'',...(x.question?.options||[])])].join(' ');
      const all=normalize(b.title+' '+p.title+' '+text);
      return words.every(w=>all.includes(w))?[{bookId:b.id,pageId:p.id,title:p.title,bookTitle:b.title,subject:b.subject,level:b.level,snippet:text.slice(Math.max(0,normalize(text).indexOf(words[0])-35),Math.max(0,normalize(text).indexOf(words[0])-35)+140)}]:[];
    })
  );
}
export function validateLibraryLinks(library:Library,books:Book[]) {
  const byId=new Map(books.map(b=>[b.id,b]));
  for(const path of library.paths) for(const step of path.steps) if(!byId.get(step.bookId)?.pages.some(p=>p.id===step.pageId)) throw new Error('노선 링크 오류: '+path.id);
  const ids=new Set(library.concepts.map(c=>c.id));
  for(const c of library.concepts) {
    if(!byId.get(c.bookId)?.pages.some(p=>p.id===c.pageId)||c.related.some(id=>!ids.has(id))) throw new Error('개념 링크 오류: '+c.id);
  }
}

