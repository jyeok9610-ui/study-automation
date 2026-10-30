import type { Book } from '../shared/schema';
export type GlossaryEntry=Book['glossary'][number];
export type WordPart={text:string;entry?:GlossaryEntry};
const han=/\p{Script=Han}/u,katakana=/\p{Script=Katakana}/u;
const escapeRegex=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

export function createWordMatcher(entries:GlossaryEntry[]){
 const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ja',{granularity:'word'}):null;
 const terms=new Map(entries.filter(entry=>entry.word).map(entry=>[entry.word,entry]));
 const words=[...terms.keys()].sort((a,b)=>b.length-a.length);
 const pattern=words.length?new RegExp(words.map(escapeRegex).join('|'),'gu'):null;
 return (text:string):WordPart[]=>{
  if(!pattern)return [{text}];
  const parts:WordPart[]=[];let cursor=0;let boundaries:Set<number>|undefined;
  for(const match of text.matchAll(pattern)){
   const word=match[0],start=match.index!,end=start+word.length,before=Array.from(text.slice(0,start)).at(-1)||'',after=text.slice(end)[0]||'';
   // Adjacent Japanese words may be written without spaces, but unknown compounds stay intact.
   const adjacent=(han.test(word[0])&&han.test(before))||(han.test(word.at(-1)!)&&han.test(after))||(katakana.test(word[0])&&katakana.test(before))||(katakana.test(word.at(-1)!)&&katakana.test(after));
   if(/[0-9０-９]/u.test(before)&&(/^[0-9０-９]/u.test(word)||han.test(word[0])))continue;
   if(adjacent){
    if(!segmenter)continue;
    boundaries??=new Set([...segmenter.segment(text)].flatMap(part=>[part.index,part.index+part.segment.length]));
    if(!boundaries.has(start)||!boundaries.has(end))continue;
   }
   if(start>cursor)parts.push({text:text.slice(cursor,start)});
   parts.push({text:word,entry:terms.get(word)});cursor=end;
  }
  if(cursor<text.length)parts.push({text:text.slice(cursor)});
  return parts.length?parts:[{text}];
 };
}