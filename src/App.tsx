import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, Compass, Download, Grid2X2, List, Search, Upload } from 'lucide-react';
import type { Book, BookSummary, Library } from './shared/schema';
import { getBook, getLibrary } from './lib/content';
import { exportReading, getProgress, importReading, type Progress } from './lib/storage';
import { searchBooks } from './lib/search';
import Reader from './components/Reader';
import HomeFrame from './components/HomeFrame';
import AppHeader from './components/AppHeader';
import { SkipLink } from './components/Navigation';
import { HomeDashboard, BookmarksPage, ProgressPage } from './components/Dashboard';

const bookRoute=(bookId:string,pageId?:string)=>'/books/'+bookId+(pageId?'/pages/'+pageId:'');
function BookCover({book,large=false}:{book:Pick<BookSummary,'title'|'subtitle'|'coverColor'|'level'>;large?:boolean}) {
  return <div className={'book-cover '+(large?'large':'')} style={{'--book-color':book.coverColor} as React.CSSProperties}><div className="cover-spine"/><div className="cover-face"><BookOpen aria-hidden="true" size={25}/><h3>{book.title}</h3><p>{book.subtitle}</p><span>{book.level}</span></div></div>;
}
function BookCard({book}:{book:BookSummary}) {
  return <Link className="book-card" to={bookRoute(book.id)}><BookCover book={book}/><div className="book-card-copy"><h3>{book.title}</h3><p>{book.summary}</p><span>{book.pageCount}페이지 · 차근차근 약 {book.minutes}분<ChevronRight size={15}/></span></div></Link>;
}
function LibraryPage({library}:{library:Library}) {
  const [recent,setRecent]=useState<{book:BookSummary;progress:Progress}[]>([]);
  useEffect(()=>{Promise.all(library.books.map(async book=>({book,progress:await getProgress(book.id)}))).then(v=>setRecent(v.filter((x):x is {book:BookSummary;progress:Progress}=>!!x.progress).sort((a,b)=>b.progress.updatedAt-a.progress.updatedAt).slice(0,2))).catch(()=>{});},[library]);
  return <><section className="library-opening"><div className="opening-copy"><h1>궁금했던 것들을,<br/>내 책으로.</h1><p>자료를 모으는 데서 한 걸음 더.<br/>읽고, 직접 바꿔 보고, 내 말로 이해하는 서재입니다.</p><Link className="text-link" to="/paths">질문에서 시작하기<ArrowRight size={18}/></Link></div><div className="opening-note"><span className="rule"/><p>배운다는 건<br/><strong>한 번 더 펼쳐 보는 일.</strong></p><small>서재의 책은 차근차근 채워갑니다.</small></div></section>
    {recent.length>0&&<section className="recent-section"><h2>펼쳐 두었던 책</h2>{recent.map(({book,progress})=><Link key={book.id} to={bookRoute(book.id,progress.pageId)}><BookOpen size={22}/><div><strong>{book.title}</strong><span>읽던 페이지에서 이어서</span></div><ArrowRight size={20}/></Link>)}</section>}
    <section className="subject-section"><div className="section-heading"><h2>어떤 세계를 펼쳐볼까요?</h2><span>{library.subjects.length}개의 분야, 하나의 서재</span></div><div className="subject-shelf">{library.subjects.map((s,i)=>{const count=library.books.filter(b=>b.subject===s.id).length;return <Link key={s.id} className="subject-book" style={{'--subject-color':s.color,'--book-index':i} as React.CSSProperties} to={'/subjects/'+s.id}><div className="subject-cover"><div className="subject-binding"/><span className="subject-motif">{s.motif}</span><h3>{s.title}</h3><span className="subject-subtitle">{s.subtitle}</span><span className="subject-book-count">{count?count+'권의 학습책':'새로운 책을 준비해요'}<ArrowRight size={17}/></span></div><div className="shelf-label"><strong>{s.title}</strong><p>{s.description}</p></div></Link>;})}</div></section>
    <section className="reading-invitation"><div><Compass size={30}/><h2>한 권을 읽는 또 다른 방법</h2><p>차례대로 읽어도 좋고, 지금의 질문에서 시작해도 좋아요.<br/>개념의 연결을 따라가며 나만의 읽기 순서를 찾아보세요.</p></div><div className="invitation-links"><Link to="/paths">질문별 읽기 노선<ArrowRight size={19}/></Link><Link to="/map">개념이 만나는 지식 지도<ArrowRight size={19}/></Link></div></section>
  </>;
}
function Subject({library}:{library:Library}) {
  const {subjectId}=useParams(),subject=library.subjects.find(s=>s.id===subjectId);
  const [view,setView]=useState<'shelf'|'list'>('shelf'),[level,setLevel]=useState('');
  if(!subject)return <Empty title="찾는 분야가 없어요" text="전체 서재에서 다시 골라주세요."/>;
  const all=library.books.filter(b=>b.subject===subject.id),books=all.filter(b=>!level||b.level===level);
  return <><Link className="back-link" to="/library"><ArrowLeft size={16}/>전체 서재</Link><header className="section-title"><h1>{subject.title}의 안쪽 서재</h1><p>{subject.description} 한 주제를 충분히 풀어낸 책들을 학습 순서로 이어갑니다.</p></header><div className="catalog-controls"><div className="filter-row"><button aria-pressed={!level} onClick={()=>setLevel('')}>전체</button>{[...new Set(all.map(b=>b.level))].map(v=><button key={v} aria-pressed={v===level} onClick={()=>setLevel(v)}>{v}</button>)}</div><div className="segmented view-toggle"><button aria-label="책장으로 보기" aria-pressed={view==='shelf'} onClick={()=>setView('shelf')}><Grid2X2 size={18}/></button><button aria-label="목록으로 보기" aria-pressed={view==='list'} onClick={()=>setView('list')}><List size={18}/></button></div></div>
    {!books.length?<Empty title={all.length?'이 단계에는 아직 책이 없어요':'이 분야의 첫 책을 준비하고 있어요'} text="완성되지 않은 책을 있는 것처럼 진열하지 않아요. 지금은 일본어 서재에서 첫 학습책을 읽을 수 있어요." action={<Link className="primary-button" to="/subjects/japanese">일본어 서재 열기<ArrowRight size={17}/></Link>}/>:<div className={'catalog '+view}>{[...new Set(books.map(b=>b.section))].map(section=><section key={section}><h2>{section}</h2><div className="book-grid">{books.filter(b=>b.section===section).map(b=><BookCard key={b.id} book={b}/>)}</div></section>)}</div>}
  </>;
}
function useBook() {const {bookId=''}=useParams();const [book,setBook]=useState<Book>(),[error,setError]=useState('');useEffect(()=>{setBook(undefined);setError('');getBook(bookId).then(setBook).catch(e=>setError(e.message));},[bookId]);return {book,error};}
function BookIntro() {
  const {book,error}=useBook(),[progress,setProgress]=useState<Progress>();
  useEffect(()=>{if(book)getProgress(book.id).then(setProgress).catch(()=>{});},[book]);
  if(error)return <Empty title="책을 열지 못했어요" text={error}/>;
  if(!book)return <Loading/>;
  return <><Link className="back-link" to={'/subjects/'+book.subject}><ArrowLeft size={16}/>분야 서재</Link><section className="book-intro"><div className="intro-cover"><BookCover book={book} large/><span className="edition">학습책 {book.version}</span></div><div className="intro-copy"><p className="book-location">{book.section} · {book.level}</p><h1>{book.title}</h1><p className="book-subtitle">{book.subtitle}</p><p>{book.summary}</p><div className="book-facts"><span>{book.pages.length}개의 학습 페이지</span><span>차근차근 약 {book.minutes}분</span></div><div className="intro-actions">{progress&&book.pages.some(p=>p.id===progress.pageId)&&<Link className="primary-button" to={bookRoute(book.id,progress.pageId)}>읽던 곳 이어보기<ArrowRight size={18}/></Link>}<Link className={progress?'secondary-button':'primary-button'} to={bookRoute(book.id,book.pages[0].id)}>처음부터 읽기<ArrowRight size={18}/></Link></div><p className="quiet">읽던 위치는 남기고, 문제는 다시 펼칠 때 새롭게 풀어요.</p></div></section>
    <section className="book-plan"><div><h2>이 책을 읽고 나면</h2><ul className="check-list">{book.objectives.map(x=><li key={x}><Check size={18}/>{x}</li>)}</ul><h3>미리 알면 좋은 것</h3><p>{book.prerequisites.length?book.prerequisites.join(' · '):'처음 시작해도 괜찮아요. 낯선 말은 예문과 읽기를 함께 보며 익혀요.'}</p></div><div><h2>책의 차례</h2><ol className="chapter-list">{book.pages.map((p,i)=><li key={p.id}><Link to={bookRoute(book.id,p.id)}><span className="chapter-number">{String(i+1).padStart(2,'0')}</span><div><h3>{p.title}</h3><p>{p.goal}</p></div><span className="chapter-time">{p.minutes}분</span><ChevronRight size={18}/></Link></li>)}</ol></div></section>
  </>;
}
function SearchPage({library}:{library:Library}) {
  const [params,setParams]=useSearchParams(),[query,setQuery]=useState(params.get('q')||''),[subject,setSubject]=useState(''),[level,setLevel]=useState(''),[books,setBooks]=useState<Book[]>([]),[error,setError]=useState('');
  useEffect(()=>{Promise.all(library.books.map(b=>getBook(b.id))).then(setBooks).catch(e=>setError(e.message));},[library]);
  const results=searchBooks(books,query,subject,level);
  return <><header className="section-title"><h1>배우고 싶은 말을 찾아보세요</h1><p>책 제목뿐 아니라 예문·읽기·본문에서도 함께 찾습니다.</p></header><form className="search-form" onSubmit={e=>{e.preventDefault();setParams(query?{q:query}:{});}}><Search size={22}/><label className="sr-only" htmlFor="site-search">서재 검색</label><input id="site-search" autoFocus type="search" placeholder="예: は, 자기소개, あります" value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit">찾기</button></form><div className="search-filters"><label>분야<select value={subject} onChange={e=>setSubject(e.target.value)}><option value="">모든 분야</option>{library.subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label>학습 단계<select value={level} onChange={e=>setLevel(e.target.value)}><option value="">모든 단계</option>{[...new Set(library.books.map(b=>b.level))].map(v=><option key={v}>{v}</option>)}</select></label><button className="text-button" onClick={()=>{setQuery('');setSubject('');setLevel('');setParams({});}}>조건 지우기</button></div>
  {error?<p role="alert">{error}</p>:!query.trim()?<div className="search-prompt"><CircleHelp size={35}/><h2>짧은 한 글자로도 괜찮아요</h2><p>뜻이 궁금한 일본어, 읽기, 한국어 개념을 넣어보세요.</p><div className="choice-row">{['は','취미','위치','날짜'].map(v=><button key={v} onClick={()=>setQuery(v)}>{v}</button>)}</div></div>:<section aria-live="polite"><p className="result-count">{results.length}개의 학습 지점을 찾았어요.</p>{results.length?<div className="search-results">{results.map(r=><Link key={r.bookId+r.pageId} to={bookRoute(r.bookId,r.pageId)}><small>{r.bookTitle}</small><h2>{r.title}<ArrowRight size={18}/></h2><p>{r.snippet}…</p></Link>)}</div>:<Empty title="일치하는 내용이 없어요" text="단어를 짧게 바꾸거나 분야·단계 조건을 풀어보세요." action={<button className="secondary-button" onClick={()=>{setSubject('');setLevel('');setQuery('');}}>전체 자료에서 다시 찾기</button>}/>}</section>}</>;
}
function Paths({library}:{library:Library}) {
  const {pathId}=useParams(),path=library.paths.find(p=>p.id===pathId);
  if(!pathId)return <><header className="section-title"><h1>질문에서 시작하는 읽기</h1><p>지금 궁금한 한 가지를 따라 필요한 페이지를 연결했어요.</p></header><div className="path-list">{library.paths.map((p,i)=><Link key={p.id} to={'/paths/'+p.id}><span className="path-line" aria-hidden="true"><i/><i/><i/></span><div><h2>{p.question}</h2><p>{p.title}</p><small>{p.steps.length}개의 정거장 · {p.audience}</small></div><ArrowRight size={23}/></Link>)}</div></>;
  if(!path)return <Empty title="이 읽기 노선은 없어요" text="다른 질문에서 시작해 보세요."/>;
  return <><Link className="back-link" to="/paths"><ArrowLeft size={16}/>읽기 노선</Link><header className="section-title"><h1>{path.question}</h1><p>{path.title}</p></header><div className="route-intro"><p><strong>이런 분께</strong> {path.audience}</p><p><strong>미리 알면 좋은 것</strong> {path.prerequisites.join(' · ')||'처음부터 함께 살펴봐요.'}</p></div><ol className="route-stops">{path.steps.map((s,i)=>{const b=library.books.find(b=>b.id===s.bookId);return <li key={i}><span className="stop-marker">{i+1}</span><div><small>{b?.title}</small><h2>{s.reason}</h2><p>남길 생각: {s.record}</p><Link className="text-link" to={bookRoute(s.bookId,s.pageId)}>이 페이지 펼치기<ArrowRight size={17}/></Link></div></li>;})}</ol><section className="final-task"><h2>마지막에 해볼 일</h2><p>{path.task}</p></section></>;
}
function KnowledgeMap({library}:{library:Library}) {
  const [selected,setSelected]=useState(library.concepts[0]?.id||'');const c=library.concepts.find(x=>x.id===selected);
  const pos=(i:number)=>({x:60+(i%3)*140,y:45+Math.floor(i/3)*105});
  return <><header className="section-title"><h1>하나를 알면, 다음이 보여요</h1><p>개념을 누르면 무엇과 왜 연결되는지 살펴볼 수 있어요.</p></header><div className="knowledge-layout"><div className="knowledge-canvas"><svg viewBox="0 0 420 285" preserveAspectRatio="none" aria-hidden="true">{library.concepts.flatMap((v,i)=>v.related.map(id=>{const j=library.concepts.findIndex(c=>c.id===id);if(j<i||j<0)return null;const a=pos(i),b=pos(j);return <line key={v.id+id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={selected===v.id||selected===id?'active':''}/>;}))}</svg>{library.concepts.map((v,i)=>{const p=pos(i);return <button key={v.id} aria-pressed={v.id===selected} style={{left:(p.x/420*100)+'%',top:(p.y/285*100)+'%'}} onClick={()=>setSelected(v.id)}>{v.label}</button>;})}</div>{c&&<section className="concept-panel" aria-live="polite"><h2>{c.label}</h2><p>{c.description}</p><Link className="primary-button" to={bookRoute(c.bookId,c.pageId)}>여기서 공부하기<ArrowRight size={17}/></Link><h3>함께 이어지는 개념</h3><ul>{c.related.map(id=>{const v=library.concepts.find(c=>c.id===id);return v&&<li key={id}><button className="text-button" onClick={()=>setSelected(id)}>{v.label}<ChevronRight size={15}/></button></li>;})}</ul></section>}</div><details className="map-list"><summary>목록으로 관계 읽기</summary>{library.concepts.map(v=><p key={v.id}><button onClick={()=>setSelected(v.id)}>{v.label}</button> · {v.related.map(id=>library.concepts.find(c=>c.id===id)?.label).join(', ')}</p>)}</details></>;
}
function AboutBook() {
  const {book,error}=useBook();if(error)return <Empty title="자료 정보를 열지 못했어요" text={error}/>;if(!book)return <Loading/>;
  return <><Link className="back-link" to={bookRoute(book.id)}><ArrowLeft size={16}/>책 소개</Link><header className="section-title"><h1>이 책은 어디에서 왔을까요?</h1><p>{book.title} · {book.version}</p></header><div className="about-reading"><h2>원자료와 새로운 설명</h2><p>원자료를 바탕으로 한 설명과, 이해를 돕기 위해 새로 쓴 예시·문제·활동을 구분했습니다. 원문의 내용과 새로운 보충을 출처 표시로 확인할 수 있어요.</p><h2>자료별 학습 지점</h2>{book.coverage.map(c=><section key={c.sourceId}><h3>{c.sourceId} · {book.sources.find(s=>s.id===c.sourceId)?.label}</h3><p>{c.reason}</p><div className="choice-row">{c.pageIds.map(id=><Link key={id} to={bookRoute(book.id,id)}>{book.pages.find(p=>p.id===id)?.title}<ChevronRight size={14}/></Link>)}</div></section>)}<h2>이해하기 어려운 부분이 있다면</h2><p>읽기 화면의 메모에 그 문장과 궁금한 점을 남겨주세요. 메모는 공개 사이트나 다른 사람에게 보내지지 않고 이 브라우저에 남아요.</p><Link className="text-link" to="/settings">메모를 파일로 보관하기<Download size={16}/></Link></div></>;
}
function ReadingSettings() {
  const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  const download=async()=>{setBusy(true);try{const data=await exportReading(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='서재-읽기기록-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('읽기 기록·메모·북마크를 파일로 내보냈어요.');}catch{setStatus('기록을 내보내지 못했어요. 브라우저 저장 권한을 확인해주세요.');}finally{setBusy(false);}};
  return <><header className="section-title"><h1>읽어온 흔적을 보관해요</h1><p>읽던 위치·진도·메모·북마크는 지금 쓰는 브라우저에 저장됩니다.</p></header><div className="settings-content"><section><Download size={28}/><h2>기록을 파일로 내보내기</h2><p>브라우저를 바꾸거나 저장 공간을 비우기 전에 보관해주세요. 문제 답·점수·과거 풀이 이력은 저장하지 않으므로 내보내기에도 포함되지 않아요.</p><button className="primary-button" disabled={busy} onClick={download}><ArrowDownToLine size={18}/>기록 내보내기</button></section><section><Upload size={28}/><h2>보관한 기록 가져오기</h2><p>이 서재에서 내보낸 JSON 파일을 골라주세요. 같은 항목은 더 최근의 기록을 유지합니다.</p><label className="secondary-button file-button"><Upload size={18}/>기록 파일 선택<input type="file" accept=".json,application/json" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{if(file.size>5*1024*1024)throw new Error('5MB 이하의 기록 파일을 골라주세요.');const result=await importReading(JSON.parse(await file.text()));setStatus('읽기 기록 '+result.progress+'개와 메모 '+result.notes+'개, 북마크 '+result.bookmarks+'개를 가져왔어요.');}catch(err){setStatus(err instanceof Error?err.message:'올바른 기록 파일을 선택해주세요.');}finally{setBusy(false);e.target.value='';}}}/></label></section></div><p className="settings-status" role="status">{status}</p><p className="privacy-note">개인 기록은 GitHub나 제작 PC로 전송되지 않아요. 같은 iPhone이라도 다른 브라우저에서는 별도의 기록입니다.</p></>;
}
function Empty({title,text,action}:{title:string;text:string;action?:React.ReactNode}){return <div className="empty-state"><BookOpen size={38}/><h2>{title}</h2><p>{text}</p>{action||<Link className="text-link" to="/library">전체 서재로<ArrowRight size={17}/></Link>}</div>;}
function Loading(){return <div className="loading" role="status">서재를 열고 있어요…</div>;}
export default function App(){
  const [library,setLibrary]=useState<Library>(),[error,setError]=useState(''),location=useLocation();
  useEffect(()=>{getLibrary().then(setLibrary).catch(e=>setError(e.message));},[]);
  useEffect(()=>{
    document.documentElement.dataset.theme='light';
    const update=()=>{const value=window.scrollY>16?'true':'false';if(document.documentElement.dataset.scrolled!==value)document.documentElement.dataset.scrolled=value;};
    update();window.addEventListener('scroll',update,{passive:true});
    return()=>window.removeEventListener('scroll',update);
  },[]);
  const reading=/^\/books\/[^/]+\/pages\/[^/]+\/?$/.test(location.pathname);
  useEffect(()=>{if(!reading)window.scrollTo(0,0);},[location.key,reading]);
  if(location.pathname==='/')return <HomeFrame library={library}>{error?<Empty title="서재를 불러오지 못했어요" text={error} action={<button className="primary-button" onClick={()=>window.location.reload()}>다시 열기</button>}/>:library?<HomeDashboard library={library}/>:<Loading/>}</HomeFrame>;
  return <div className={'app has-drawer '+(reading?'is-reading':'')}>
    <SkipLink/>
    <AppHeader library={library}/>
    {error?<main className="site-content" id="main"><Empty title="서재를 불러오지 못했어요" text={error} action={<button className="primary-button" onClick={()=>window.location.reload()}>다시 열기</button>}/></main>:!library?<Loading/>:reading?<Routes><Route path="/books/:bookId/pages/:pageId" element={<Reader/>}/></Routes>:<main className="site-content" id="main"><Routes><Route path="/" element={<HomeDashboard library={library}/>}/><Route path="/library" element={<LibraryPage library={library}/>}/><Route path="/bookmarks" element={<BookmarksPage library={library}/>}/><Route path="/progress" element={<ProgressPage library={library}/>}/><Route path="/subjects/:subjectId" element={<Subject library={library}/>}/><Route path="/books/:bookId" element={<BookIntro/>}/><Route path="/books/:bookId/about" element={<AboutBook/>}/><Route path="/search" element={<SearchPage library={library}/>}/><Route path="/paths" element={<Paths library={library}/>}/><Route path="/paths/:pathId" element={<Paths library={library}/>}/><Route path="/map" element={<KnowledgeMap library={library}/>}/><Route path="/settings" element={<ReadingSettings/>}/><Route path="*" element={<Empty title="이 페이지는 서재에 없어요" text="아래 링크에서 다시 시작해주세요."/>}/></Routes></main>}
    {!reading&&<footer className="site-footer"><span>나의 지식 서재</span><p>천천히 읽고, 내 말로 이해하는 공간.</p><Link to="/settings">내 읽기 기록 보관하기</Link></footer>}
  </div>;
}
