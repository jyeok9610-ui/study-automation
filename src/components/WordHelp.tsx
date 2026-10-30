import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { X } from 'lucide-react';
import { getWordEntries } from '../lib/word-data';
import kanjiMeanings from '../content/japanese-kanji.json';
import { createWordMatcher, type GlossaryEntry, type WordPart } from '../lib/words';

const meanings:Record<string,string>=kanjiMeanings;
const WordContext=createContext<{split:(text:string)=>WordPart[];open:(entry:GlossaryEntry,anchor:HTMLButtonElement)=>void}|null>(null);

export function WordDefinition({entry}:{entry:GlossaryEntry}){
 const characters=[...new Set(entry.word.match(/\p{Script=Han}/gu)||[])];
 return <><p className="word-reading" lang="ja">{entry.reading}</p><p className="word-meaning">{entry.meaning}</p>
  {characters.length>0&&<section className="word-kanji"><h3>단어를 이루는 한자</h3><dl>{characters.map(character=><div key={character}><dt lang="ja">{character}</dt><dd>{meanings[character]||'풀이 준비 중'}</dd></div>)}</dl></section>}
  {entry.note&&<p className="word-note">{entry.note}</p>}
 </>;
}

export function WordHelpProvider({children,entries,enabled=true}:{entries:GlossaryEntry[];enabled?:boolean}&PropsWithChildren){
 const [selection,setSelection]=useState<{entry:GlossaryEntry;anchor:HTMLButtonElement}|null>(null);
 const popup=useRef<HTMLDivElement>(null),closeButton=useRef<HTMLButtonElement>(null),titleId=useId();
 const split=useMemo(()=>createWordMatcher(enabled?getWordEntries(entries):[]),[entries,enabled]);
 const close=(restore=false)=>{popup.current?.hidePopover();if(restore&&selection?.anchor.isConnected)requestAnimationFrame(()=>selection.anchor.focus({preventScroll:true}));};
 useEffect(()=>{
  if(!selection||!popup.current)return;
  const box=popup.current;
  box.showPopover();
  const position=()=>{
   const anchor=selection.anchor.getBoundingClientRect(),rect=box.getBoundingClientRect(),width=document.documentElement.clientWidth,height=window.innerHeight;
   box.style.left=Math.max(12,Math.min(anchor.left,width-rect.width-12))+'px';
   const below=anchor.bottom+10,above=anchor.top-rect.height-10;
   box.style.top=Math.max(12,Math.min(below+rect.height<=height-12?below:above,height-rect.height-12))+'px';
  };
  position();const frame=requestAnimationFrame(()=>{position();closeButton.current?.focus({preventScroll:true});});
  const follow=()=>{if(box.matches(':popover-open'))position();};
  window.addEventListener('resize',position);window.addEventListener('scroll',follow,{passive:true});
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',position);window.removeEventListener('scroll',follow);};
 },[selection]);
 const value=useMemo(()=>({split,open:(entry:GlossaryEntry,anchor:HTMLButtonElement)=>setSelection({entry,anchor})}),[split]);
 return <WordContext.Provider value={value}>{children}<div ref={popup} popover="auto" className="word-popover" role="dialog" aria-labelledby={titleId} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}}}>
  {selection&&<><header className="word-popover-header"><h2 id={titleId} lang="ja">{selection.entry.word}</h2><button ref={closeButton} aria-label="단어 설명 닫기" onClick={()=>close(true)}><X size={19} aria-hidden="true"/></button></header><WordDefinition entry={selection.entry}/></>}
 </div></WordContext.Provider>;
}

export function WordText({text}:{text:string}){
 const context=useContext(WordContext);
 if(!context)return <>{text}</>;
 return <>{context.split(text).map((part,index)=>part.entry?<button key={index} className="word-link" lang="ja" aria-label={part.text+' 단어 풀이'} aria-haspopup="dialog" onClick={event=>context.open(part.entry!,event.currentTarget)}>{part.text}</button>:part.text)}</>;
}