import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, List, MessageSquare, X } from 'lucide-react';
import type { Block, Book } from '../shared/schema';
import { getBook } from '../lib/content';
import { getNotes, getProgress, saveNote, saveProgress, type Progress } from '../lib/storage';
import BookmarkButton from './BookmarkButton';
import { DeviceSpeechProvider, SpeechButton } from './DeviceSpeech';
import { getWordEntries } from '../lib/word-data';
import { WordDefinition, WordHelpProvider, WordText } from './WordHelp';
import { CounterLab, DialogueLab, PositionLab, ResetButton, SentenceLab } from './Widgets';

function QuestionCard({block}:{block:Block}) {
  const q=block.question!;const [selected,setSelected]=useState<number|null>(null),[reveal,setReveal]=useState(false);
  return <div className="question"><h3>{block.title||'생각을 확인해 볼까요?'}</h3><p><WordText text={q.prompt}/></p><div className="question-options">{q.options.map((v,i)=><button key={i} aria-pressed={selected===i} className={selected===i?(i===q.answer?'correct':'incorrect'):''} onClick={()=>{setSelected(i);setReveal(true);}}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{v}</span>{selected===i&&i===q.answer&&<Check size={18} aria-hidden="true"/>}</button>)}</div>
  {selected!==null&&<p className="feedback" role="status">{selected===q.answer?'잘 짚으셨어요. 이유까지 확인해 보세요.':q.wrongExplanations?.[selected]||'다시 문맥을 살펴보세요. 아래 해설에서 차이를 확인할 수 있어요.'}</p>}
  <button className="explanation-toggle" aria-expanded={reveal} onClick={()=>setReveal(!reveal)}><ChevronDown size={16} aria-hidden="true"/>{reveal?'해설 접기':'정답과 해설 보기'}</button>
  {reveal&&<div className="explanation"><strong>함께 이해하기</strong><p><WordText text={q.explanation}/></p></div>}
  {selected!==null&&<ResetButton onClick={()=>{setSelected(null);setReveal(false);}}/>}</div>;
}
function ReflectionCard({block}:{block:Block}) {
  const question=block.reflection!,[answer,setAnswer]=useState('');
  const answerId=block.id+'-answer',hintId=block.id+'-hint';
  return <div className="question reflection"><h3>{block.title||'생각을 적어 볼까요?'}</h3>
    <p className="reflection-prompt">{question.prompt}</p>
    <label className="field-label" htmlFor={answerId}>생각 적기</label>
    <textarea id={answerId} aria-describedby={hintId} rows={4} maxLength={5000} value={answer} onChange={event=>setAnswer(event.target.value)}/>
    <p id={hintId} className="reflection-hint">이 답은 페이지를 떠나거나 새로고침하면 비워집니다. 보관할 생각은 메모에 적어주세요.</p>
    <details className="reflection-explanation"><summary>해설과 검토 기준 보기</summary>
      <div className="explanation">{question.explanation.split(/\n{2,}/).map((text,index)=><p key={index}>{text}</p>)}</div>
    </details>
  </div>;
}
function BlockView({block,showSources,epoch}:{block:Block;showSources:boolean;epoch:number}) {
  const provenance=block.provenance==='supplement'?'이해를 돕는 보충':block.provenance==='correction'?'교정을 반영한 설명':'원자료를 바탕으로';
  return <section className={'learning-block block-'+block.type} id={block.id} data-block-id={block.id}>
    {block.type==='question'?<QuestionCard key={block.id+'-'+epoch} block={block}/>:block.type==='reflection'?<ReflectionCard key={block.id+'-'+epoch} block={block}/>:<>
      {block.title&&<h2><WordText text={block.title}/></h2>}
      {block.text&&block.text.split(/\n{2,}/).map((v,i)=><p key={i}><WordText text={v}/></p>)}
      {block.examples?.map((e,i)=><div className="example" key={i}><div className="example-speech"><p className="japanese" lang="ja"><WordText text={e.ja}/></p><SpeechButton text={e.reading} label="일본어 예문"/></div><p className="reading" lang="ja">{e.reading}</p><p className="meaning">{e.meaning}</p>{e.note&&<p><WordText text={e.note}/></p>}</div>)}
      {block.type==='table'&&<div className="table-scroll" role="region" aria-label={block.title||'학습 표'} tabIndex={0}><table><thead><tr>{block.headers?.map((h,i)=><th key={i}><WordText text={h}/></th>)}</tr></thead><tbody>{block.rows?.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}><WordText text={cell}/></td>)}</tr>)}</tbody></table></div>}
      {block.type==='dialogue'&&<DialogueLab/>}{block.type==='position'&&<PositionLab/>}{block.type==='sentence'&&<SentenceLab/>}{block.type==='counter'&&<CounterLab/>}
    </>}
    {showSources&&<p className="provenance">{provenance} · {block.sourceIds.join(' · ')}</p>}
  </section>;
}
export default function Reader() {
  const {bookId='',pageId=''}=useParams(),location=useLocation();
  const [book,setBook]=useState<Book>(),[error,setError]=useState(''),[toc,setToc]=useState(false),[panel,setPanel]=useState<'dictionary'|'sources'|'notes'|null>(null),[showSources,setShowSources]=useState(false),[epoch,setEpoch]=useState(0),[progress,setProgress]=useState<Progress>(),[note,setNote]=useState(''),[saveMessage,setSaveMessage]=useState(''),[dictionaryQuery,setDictionaryQuery]=useState('');
  const progressRef=useRef<Progress|undefined>(undefined),tracked=useRef<Progress|undefined>(undefined),restored=useRef(false);
  const dictionaryEntries=useMemo(()=>book?.subject==='japanese'?getWordEntries(book.glossary):book?.glossary||[],[book]);
  const sheetRef=useRef<HTMLDivElement>(null),openerRef=useRef<HTMLElement|null>(null);
  const [mobilePanel,setMobilePanel]=useState(()=>window.matchMedia('(max-width:760px)').matches);
  useEffect(()=>{const media=window.matchMedia('(max-width:760px)'),change=()=>setMobilePanel(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  // WebKit pointer clicks can leave document.activeElement on the body.
  const togglePanel=(value:'dictionary'|'sources'|'notes',opener:HTMLButtonElement)=>{if(panel===value){setPanel(null);return;}openerRef.current=opener;setPanel(value);};
  useEffect(()=>{
    if(!panel||!sheetRef.current)return;
    const sheet=sheetRef.current,opener=openerRef.current,oldOverflow=document.body.style.overflow;
    const backgrounds=Array.from(document.querySelectorAll<HTMLElement>('.site-header,.reader-main,.toc,.skip-link')).map(el=>({el,inert:el.inert}));
    if(mobilePanel){backgrounds.forEach(x=>x.el.inert=true);document.body.style.overflow='hidden';}
    const frame=requestAnimationFrame(()=>{const first=sheet.querySelector<HTMLElement>('input:not([type=checkbox]),textarea')||sheet.querySelector<HTMLElement>('button')||sheet;first.focus({preventScroll:true});});
    const keys=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setPanel(null);return;}
      if(!mobilePanel||event.key!=='Tab')return;
      const list=Array.from(sheet.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(el=>el.offsetParent!==null);
      if(!list.length){event.preventDefault();sheet.focus();return;}
      if(event.shiftKey&&document.activeElement===list[0]){event.preventDefault();list.at(-1)!.focus();}
      else if(!event.shiftKey&&document.activeElement===list.at(-1)){event.preventDefault();list[0].focus();}
    };
    document.addEventListener('keydown',keys);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',keys);backgrounds.forEach(x=>x.el.inert=x.inert);document.body.style.overflow=oldOverflow;if(opener?.isConnected)opener.focus({preventScroll:true});};
  },[panel,mobilePanel]);
  const page=book?.pages.find(p=>p.id===pageId),index=book?.pages.findIndex(p=>p.id===pageId)??-1;
  useEffect(()=>{setError('');setBook(undefined);getBook(bookId).then(setBook).catch(e=>setError(String(e.message)));},[bookId]);
  useEffect(()=>{setEpoch(v=>v+1);setToc(false);setPanel(null);setSaveMessage('');restored.current=false;setNote('');tracked.current=undefined;
    let disposed=false;progressRef.current=undefined;setProgress(undefined);
    getNotes().then(notes=>{if(!disposed)setNote(notes.find(n=>n.id===bookId+'/'+pageId)?.text||'');}).catch(()=>{});
    window.scrollTo(0,0);return()=>{disposed=true;};
  },[bookId,pageId,location.key]);
  useEffect(()=>{const onShow=(event:PageTransitionEvent)=>{if(event.persisted)setEpoch(v=>v+1);};window.addEventListener('pageshow',onShow);return()=>window.removeEventListener('pageshow',onShow);},[]);
  useEffect(()=>{
    if(!book||!page)return;let timer:ReturnType<typeof setTimeout>|undefined;let disposed=false;
    getProgress(bookId).then(p=>{
      if(disposed)return;progressRef.current=p;setProgress(p);
      if(p?.pageId===pageId && p.blockId)requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(disposed)return;const el=document.getElementById(p.blockId);if(el)window.scrollTo(0,el.getBoundingClientRect().top+window.scrollY+p.offset*el.getBoundingClientRect().height-110);restored.current=true;
      }));else restored.current=true;
    }).catch(()=>{restored.current=true;});
    const capture=()=>{
      if(!restored.current)return;
      const elements=Array.from(document.querySelectorAll<HTMLElement>('[data-block-id]'));
      const el=elements.find(v=>v.getBoundingClientRect().bottom>120)||elements.at(-1);
      if(!el)return;
      const base=progressRef.current;
      tracked.current={bookId,pageId,blockId:el.id,offset:Math.max(0,Math.min(1,(120-el.getBoundingClientRect().top)/Math.max(1,el.offsetHeight))),version:book.version,updatedAt:Date.now(),readPages:base?.readPages||[],reviewPages:base?.reviewPages||[]};
      clearTimeout(timer);timer=setTimeout(()=>{if(tracked.current)saveProgress(tracked.current).catch(()=>setSaveMessage('읽기 기록을 저장하지 못했어요. 브라우저 저장 공간을 확인해주세요.'));},250);
    };
    window.addEventListener('scroll',capture,{passive:true});timer=setTimeout(capture,400);
    return()=>{disposed=true;window.removeEventListener('scroll',capture);clearTimeout(timer);if(tracked.current)void saveProgress(tracked.current).catch(()=>{});};
  },[book,page,bookId,pageId,location.key]);
  const mark=async(field:'readPages'|'reviewPages')=>{
    if(!book||!page)return;
    const base=tracked.current||progressRef.current||{bookId,pageId,blockId:page.blocks[0].id,offset:0,version:book.version,updatedAt:Date.now(),readPages:[],reviewPages:[]};
    const values=base[field].includes(pageId)?base[field].filter(x=>x!==pageId):[...base[field],pageId];
    const next={...base,[field]:values,updatedAt:Date.now()};progressRef.current=next;tracked.current=next;setProgress(next);
    try{await saveProgress(next);setSaveMessage(field==='readPages'?'읽음 표시를 저장했어요.':'복습 표시를 저장했어요.');}catch{setSaveMessage('기록을 저장하지 못했어요.');}
  };
  const updateNote=(text:string)=>{setNote(text);saveNote({id:bookId+'/'+pageId,bookId,pageId,text,updatedAt:Date.now()}).then(()=>setSaveMessage('메모를 저장했어요.')).catch(()=>setSaveMessage('메모를 저장하지 못했어요.'));};
  if(error)return <div className="empty-state"><h1>책을 열지 못했어요</h1><p>{error}</p><Link to="/library">서재로 돌아가기</Link></div>;
  if(!book)return <div className="loading" role="status">책을 펼치고 있어요…</div>;
  if(!page)return <div className="empty-state"><h1>이 페이지를 찾지 못했어요</h1><p>책의 목차에서 읽을 곳을 다시 골라주세요.</p><Link to={'/books/'+bookId}>목차로</Link></div>;
  return <DeviceSpeechProvider key={bookId+'/'+pageId}><WordHelpProvider entries={book.glossary} enabled={book.subject==='japanese'}><div className="reader-layout">
    <aside className={'toc '+(toc?'open':'')} aria-label="책 목차"><Link className="back-link" to={'/books/'+bookId}><ArrowLeft size={16}/>책 소개</Link><h2>{book.title}</h2><p>{(progress?.readPages||[]).length} / {book.pages.length} 페이지 읽음</p><ol>{book.pages.map((p,i)=><li key={p.id}><Link aria-current={p.id===pageId?'page':undefined} to={'/books/'+bookId+'/pages/'+p.id}><span>{String(i+1).padStart(2,'0')}</span>{p.title}{progress?.readPages.includes(p.id)&&<Check size={14} aria-label="읽음"/>}</Link></li>)}</ol><Link to={'/books/'+bookId+'/about'}>이 책의 자료와 교정</Link></aside>
    <main className="reader-main" id="main"><div className="reader-toolbar"><button className="text-button mobile-toc" onClick={()=>setToc(!toc)} aria-expanded={toc}><List size={18}/>목차</button><span>{index+1} / {book.pages.length}</span><div><BookmarkButton key={bookId+'/'+pageId} bookId={bookId} pageId={pageId}/><button onClick={event=>togglePanel('dictionary',event.currentTarget)} aria-expanded={panel==='dictionary'}>사전</button><button onClick={event=>togglePanel('sources',event.currentTarget)} aria-expanded={panel==='sources'}>출처</button><button aria-label="메모" onClick={event=>togglePanel('notes',event.currentTarget)} aria-expanded={panel==='notes'}><MessageSquare size={16}/><span>메모</span></button></div></div>
      <article className="reading-paper"><header className="page-header"><Link to={'/subjects/'+book.subject}>{book.section}</Link><h1><WordText text={page.title}/></h1><p className="page-goal"><WordText text={page.goal}/></p><span className="read-time">차근차근 약 {page.minutes}분</span></header>
        {book.subject==='japanese'&&<p className="word-help-hint">파란색 단어를 누르면 읽기와 한자 풀이를 볼 수 있어요.</p>}
        {page.blocks.map(block=><BlockView key={block.id+'-'+epoch} block={block} epoch={epoch} showSources={showSources}/>)}
        <footer className="page-end"><BookOpen size={30}/><h2>오늘 이해한 것을 한 문장으로 말해 보세요</h2><p>정답을 외웠는지보다, 왜 그렇게 생각하는지 설명할 수 있는지 확인해 보세요.</p><div className="choice-row"><button aria-pressed={progress?.readPages.includes(pageId)||false} onClick={()=>mark('readPages')}><Check size={17}/>읽음 표시</button><button aria-pressed={progress?.reviewPages.includes(pageId)||false} onClick={()=>mark('reviewPages')}>복습 표시</button></div><p className="save-status" role="status">{saveMessage}</p><p className="quiet">읽던 위치와 진도는 이 브라우저에 남아요. 문제와 이전 풀이 기록은 다시 열 때 비워져요.</p></footer>
      </article>
      <nav className="page-nav" aria-label="페이지 이동">{index>0?<Link to={'/books/'+bookId+'/pages/'+book.pages[index-1].id}><ArrowLeft size={18}/><span><small>이전</small>{book.pages[index-1].title}</span></Link>:<Link to={'/books/'+bookId}><ArrowLeft size={18}/>목차</Link>}{index<book.pages.length-1?<Link to={'/books/'+bookId+'/pages/'+book.pages[index+1].id}><span><small>다음</small>{book.pages[index+1].title}</span><ArrowRight size={18}/></Link>:<Link to={'/subjects/'+book.subject}>내부 서재로<ArrowRight size={18}/></Link>}</nav>
    </main>
    {panel&&<><div className="sheet-scrim" aria-hidden="true"/><div ref={sheetRef} tabIndex={-1} className="side-sheet" role="dialog" aria-modal={mobilePanel} aria-label={panel==='dictionary'?(book.subject==='japanese'?'한자와 어휘 사전':'용어 사전'):panel==='sources'?'출처와 보충 설명':'내 메모'}><div className="sheet-header"><h2>{panel==='dictionary'?'읽다가 궁금한 말':panel==='sources'?'자료와 보충의 구분':'내 메모'}</h2><button aria-label="도움말 닫기" onClick={()=>setPanel(null)}><X size={21}/></button></div>
      {panel==='dictionary'&&<><label className="field-label" htmlFor="dictionary-search">단어·읽기·뜻 찾기</label><input id="dictionary-search" value={dictionaryQuery} onChange={e=>setDictionaryQuery(e.target.value)} placeholder={book.subject==='japanese'?'예: 私, わたし, 나':'예: 논증, 직관, 정합성'}/><div className="dictionary-list">{dictionaryEntries.filter(v=>(v.word+' '+v.reading+' '+v.meaning).includes(dictionaryQuery)).map(v=><details key={v.id}><summary><span lang={book.subject==='japanese'?'ja':'ko'}>{v.word}</span><small>{v.meaning}</small></summary>{book.subject==='japanese'?<WordDefinition entry={v}/>:<><p className="word-reading" lang="en">{v.reading}</p><p className="word-meaning">{v.meaning}</p><p className="word-note">{v.note}</p></>}</details>)}</div></>}
      {panel==='sources'&&<><p>원자료, 교정을 반영한 설명, 새로 만든 보충을 구분해서 읽어주세요.</p><label className="check-row"><input type="checkbox" checked={showSources} onChange={e=>setShowSources(e.target.checked)}/>본문마다 출처 표시</label><ul className="source-list">{book.sources.map(s=><li key={s.id}><strong>{s.id}</strong><span>{s.label}</span>{s.url&&<a href={s.url} target="_blank" rel="noopener noreferrer">원문과 이용 조건 보기</a>}</li>)}</ul><Link to={'/books/'+bookId+'/about'}>자료 대응과 이 책 정보</Link></>}
      {panel==='notes'&&<><p>이 페이지에서 이해한 것과 아직 궁금한 것을 적어보세요. 메모는 같은 브라우저에 자동 저장돼요.</p><label className="field-label" htmlFor="reader-note">페이지 메모</label><textarea id="reader-note" rows={12} maxLength={50000} value={note} onChange={e=>updateNote(e.target.value)}/><p role="status" className="save-status">{saveMessage}</p><Link to="/settings">기록을 파일로 보관하기</Link></>}
    </div></>}
  </div></WordHelpProvider></DeviceSpeechProvider>;
}
