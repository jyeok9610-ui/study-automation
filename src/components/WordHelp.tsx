import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { X } from 'lucide-react';
import { SpeechButton, useDeviceSpeech } from './DeviceSpeech';
import { standaloneReading } from '../lib/speech';
import { getWordEntries } from '../lib/word-data';
import { getReadingGuide, characterReadings } from '../lib/word-readings';
import kanjiMeanings from '../content/japanese-kanji.json';
import { createWordMatcher, type GlossaryEntry, type WordPart } from '../lib/words';

const meanings:Record<string,string>=kanjiMeanings;
const WordContext=createContext<{split:(text:string)=>WordPart[];open:(entry:GlossaryEntry,anchor:HTMLButtonElement)=>void}|null>(null);

export function WordDefinition({entry}:{entry:GlossaryEntry}){
 const guide=getReadingGuide(entry);
 const characters=[...new Set(entry.word.match(/\p{Script=Han}/gu)||[])];
 return <><p className="word-reading" lang="ja"><ReadingAudio reading={entry.reading} wordReading={entry.reading} label={'단어 '+entry.word}/></p><p className="word-meaning">{entry.meaning}</p>
  {characters.length>0&&<section className="word-kanji"><h3>이 단어에서의 읽기와 한자 뜻</h3>{guide?.note&&<p className="word-reading-note">{guide.note}</p>}<dl>{characters.map(character=><div key={character}><dt lang="ja">{character}</dt><dd>{characterReadings(guide,character)&&<span className="word-kanji-reading" lang="ja"><ReadingAudio reading={characterReadings(guide,character)} wordReading={entry.reading} label={'한자 '+character}/></span>}<span className="word-kanji-meaning">{meanings[character]||'풀이 준비 중'}</span></dd></div>)}</dl></section>}
  {entry.note&&<p className="word-note">{entry.note}</p>}
 </>;
}

export function WordHelpProvider({children,entries,enabled=true}:{entries:GlossaryEntry[];enabled?:boolean}&PropsWithChildren){
 const speech=useDeviceSpeech();
 const [selection,setSelection]=useState<{entry:GlossaryEntry;anchor:HTMLButtonElement}|null>(null);
 const popup=useRef<HTMLDivElement>(null),closeButton=useRef<HTMLButtonElement>(null),titleId=useId();
 const split=useMemo(()=>createWordMatcher(enabled?getWordEntries(entries):[]),[entries,enabled]);
 const close=(restore=false)=>{popup.current?.hidePopover();if(restore&&selection?.anchor.isConnected)requestAnimationFrame(()=>selection.anchor.focus({preventScroll:true}));};
 useEffect(()=>{
  if(!selection||!popup.current)return;
  const box=popup.current;
  box.showPopover();
  const position=()=>{
   const anchor=selection.anchor.getBoundingClientRect(),width=document.documentElement.clientWidth,height=window.innerHeight;
   const header=document.querySelector('.app-header')?.getBoundingClientRect();
   const safeTop=Math.min(Math.max(12,(header?.bottom||0)+12),Math.max(12,height-80));
   box.style.maxHeight=Math.max(1,height-safeTop-12)+'px';
   const rect=box.getBoundingClientRect();
   box.style.left=Math.max(12,Math.min(anchor.left,width-rect.width-12))+'px';
   const below=anchor.bottom+10,above=anchor.top-rect.height-10;
   box.style.top=Math.max(safeTop,Math.min(below+rect.height<=height-12?below:above,height-rect.height-12))+'px';
  };
  position();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(position):null;observer?.observe(box);const frame=requestAnimationFrame(()=>{position();closeButton.current?.focus({preventScroll:true});});
  const follow=()=>{if(box.matches(':popover-open'))position();};
  window.addEventListener('resize',position);window.addEventListener('scroll',follow,{passive:true});
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('resize',position);window.removeEventListener('scroll',follow);};
 },[selection]);
 const value=useMemo(()=>({split,open:(entry:GlossaryEntry,anchor:HTMLButtonElement)=>setSelection({entry,anchor})}),[split]);
 return <WordContext.Provider value={value}>{children}<div ref={popup} popover="auto" className="word-popover" onToggle={event=>{if(event.newState==='closed')speech?.stop();}} role="dialog" aria-labelledby={titleId} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}}}>
  {selection&&<><header className="word-popover-header"><h2 id={titleId} lang="ja" aria-label={selection.entry.word}><WordPronunciation entry={selection.entry}/></h2><button ref={closeButton} aria-label="단어 설명 닫기" onClick={()=>close(true)}><X size={19} aria-hidden="true"/></button></header><WordDefinition entry={selection.entry}/></>}
 </div></WordContext.Provider>;
}

export function WordText({text}:{text:string}){
 const context=useContext(WordContext);
 if(!context)return <>{text}</>;
 return <>{context.split(text).map((part,index)=>part.entry?<button key={index} className="word-link" lang="ja" aria-label={part.text+' 단어 풀이'} aria-haspopup="dialog" onClick={event=>context.open(part.entry!,event.currentTarget)}>{part.text}</button>:part.text)}</>;
}
function WordPronunciation({entry}:{entry:GlossaryEntry}){
 const guide=getReadingGuide(entry);
 if(!guide)return <>{entry.word}</>;
 return <>{guide.parts.map((part,index)=>/\p{Script=Han}|\d/u.test(part.text)?<ruby key={index}>{part.text}<rt aria-hidden="true">{part.reading}</rt></ruby>:part.text)}</>;
}
function ReadingAudio({reading,wordReading,label}:{reading:string;wordReading:string;label:string}){
 return <>{reading.split('／').map((part,index)=><span key={index}>{index>0?'／':null}<span className="reading-audio-group"><span>{part}</span>{standaloneReading(part)?<SpeechButton text={part} label={label+' '+part}/>:<span className="speech-whole-hint"><SpeechButton text={wordReading} label={label+' 단어 전체'}/><small lang="ko">단어로 듣기</small></span>}</span></span>)}</>;
}