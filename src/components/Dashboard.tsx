import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark as BookmarkIcon, BookOpen, Check, ChevronRight, FileText, Trash2 } from 'lucide-react';
import type { Book, Library } from '../shared/schema';
import { getBook } from '../lib/content';
import { getBookmarks, getProgress, setBookmark, type Bookmark, type Progress } from '../lib/storage';
import { summarizeReading } from '../lib/overview';

const pageLink=(bookId:string,pageId:string)=>'/books/'+bookId+'/pages/'+encodeURIComponent(pageId);
type ReadingData={books:Book[];progress:(Progress|undefined)[];bookmarks:Bookmark[]};
function useReadingData(library:Library){
 const [data,setData]=useState<ReadingData>(),[error,setError]=useState('');
 useEffect(()=>{let active=true;Promise.all([Promise.all(library.books.map(b=>getBook(b.id))),Promise.all(library.books.map(b=>getProgress(b.id))),getBookmarks()]).then(([books,progress,bookmarks])=>{if(active)setData({books,progress,bookmarks});}).catch(()=>{if(active)setError('읽기 기록을 불러오지 못했어요. 브라우저의 저장 공간을 확인해주세요.');});return()=>{active=false;};},[library]);
 return {data,error,setData};
}
function ReadingError({message}:{message:string}){return <div className="dashboard-error" role="alert"><h2>읽기 기록을 확인해주세요</h2><p>{message}</p><Link className="text-link" to="/settings">기록 보관 설정<ArrowRight size={16}/></Link></div>;}
function ReadingLoading(){return <p className="dashboard-loading" role="status">나의 읽기 기록을 불러오고 있어요…</p>;}

export function HomeDashboard({library}:{library:Library}){
 const {data,error}=useReadingData(library);
 if(error)return <ReadingError message={error}/>;
 if(!data)return <ReadingLoading/>;
 const overview=summarizeReading(data.books,data.progress),recent=overview.recent.slice(0,3),items=recent.length?recent:overview.rows.slice(0,3);
 return <section className="dashboard-panel" aria-labelledby="dashboard-title">
  <header className="dashboard-heading"><p className="dashboard-label">MY LIBRARY</p><h1 id="dashboard-title">오늘도, 한 걸음 더.</h1><p>배움의 기록을 한곳에서 관리하세요.</p></header>
  <dl className="dashboard-stats"><div><dt>전체 자료</dt><dd>{data.books.length}<span className="sr-only">권의 학습책</span></dd></div><div><dt>학습 진행률</dt><dd>{overview.percent}%</dd></div></dl>
  <p className="dashboard-measure">학습책 {data.books.length}권 · {overview.totalPages}페이지 중 {overview.readPages}페이지 읽음</p>
  <section className="dashboard-recent" aria-labelledby="recent-heading"><div className="dashboard-section-heading"><h2 id="recent-heading">{recent.length?'최근 학습 자료':'처음 펼쳐볼 자료'}</h2><Link to="/library">내 서재<ArrowRight size={15}/></Link></div>
   {items.length?<div className="dashboard-recent-list">{items.map(row=><Link className="dashboard-recent-item" key={row.book.id} to={recent.length&&row.progress?pageLink(row.book.id,row.progress.pageId):'/books/'+row.book.id}><span className="document-icon"><FileText size={25} aria-hidden="true"/></span><div><h3>{row.book.title}</h3><p>{recent.length&&row.progress?'읽던 곳에서 이어서 · '+row.readPages.length+' / '+row.book.pages.length+'페이지 읽음':row.book.pages.length+'개의 학습 페이지 · 첫 장을 펼쳐보세요'}</p></div><ChevronRight size={23} aria-hidden="true"/></Link>)}</div>:<div className="dashboard-empty"><BookOpen size={30}/><p>첫 학습책을 준비하고 있어요.</p><Link className="text-link" to="/library">내 서재 둘러보기<ArrowRight size={16}/></Link></div>}
  </section>
  <nav className="dashboard-shortcuts" aria-label="학습 바로가기"><Link to="/bookmarks"><BookmarkIcon size={17}/><span>북마크 {data.bookmarks.length}개</span><ChevronRight size={15}/></Link><Link to="/progress"><Check size={17}/><span>내 학습 현황</span><ChevronRight size={15}/></Link></nav>
 </section>;
}

export function BookmarksPage({library}:{library:Library}){
 const {data,error,setData}=useReadingData(library),[removing,setRemoving]=useState(''),[message,setMessage]=useState('');
 if(error)return <ReadingError message={error}/>;
 if(!data)return <ReadingLoading/>;
 const items=data.bookmarks.flatMap(bookmark=>{const book=data.books.find(b=>b.id===bookmark.bookId),page=book?.pages.find(p=>p.id===bookmark.pageId);return book&&page?[{bookmark,book,page}]:[];});
 const remove=async(bookmark:Bookmark)=>{setRemoving(bookmark.id);setMessage('');try{await setBookmark(bookmark.bookId,bookmark.pageId,false);setData(current=>current?{...current,bookmarks:current.bookmarks.filter(b=>b.id!==bookmark.id)}:current);setMessage('북마크를 해제했어요.');}catch{setMessage('북마크를 해제하지 못했어요. 다시 시도해주세요.');}finally{setRemoving('');}};
 return <><header className="section-title"><h1>다시 펼치고 싶은 페이지</h1><p>읽다가 남긴 북마크를 한곳에 모았어요. 같은 브라우저에 보관됩니다.</p></header><p className="bookmark-status" role="status">{message}</p>
  {items.length?<section className="bookmark-list" aria-label="저장한 북마크">{items.map(({bookmark,book,page})=><article className="bookmark-item" key={bookmark.id}><Link to={pageLink(book.id,page.id)}><span className="document-icon"><BookmarkIcon size={22} aria-hidden="true"/></span><div><small>{book.title}</small><h2>{page.title}</h2><p>{page.goal}</p></div><ChevronRight size={20}/></Link><button className="bookmark-remove" aria-label={page.title+' 북마크 해제'} disabled={!!removing} onClick={()=>remove(bookmark)}><Trash2 size={17} aria-hidden="true"/></button></article>)}</section>:<section className="empty-state"><BookmarkIcon size={36} aria-hidden="true"/><h2>기억하고 싶은 페이지를 남겨보세요</h2><p>책을 읽다가 도구막대의 북마크를 누르면 여기에 모입니다.</p><Link className="primary-button" to="/library">내 서재 열기<ArrowRight size={16}/></Link></section>}
  {data.bookmarks.length>items.length&&<p className="quiet">현재 서재에 없는 페이지의 북마크도 백업 파일에는 보존됩니다.</p>}
 </>;
}

export function ProgressPage({library}:{library:Library}){
 const {data,error}=useReadingData(library);
 if(error)return <ReadingError message={error}/>;
 if(!data)return <ReadingLoading/>;
 const overview=summarizeReading(data.books,data.progress);
 return <><header className="section-title"><h1>한 페이지씩 쌓아온 배움</h1><p>읽음 표시한 페이지를 기준으로 보여드려요. 문제 답이나 점수는 기록하지 않습니다.</p></header><div className="progress-summary"><strong>{overview.percent}%</strong><span>전체 {overview.totalPages}페이지 중 {overview.readPages}페이지 읽음</span></div>
  {!overview.rows.length?<section className="empty-state"><BookOpen size={36}/><h2>첫 학습책을 준비하고 있어요</h2><Link className="text-link" to="/library">내 서재로<ArrowRight size={16}/></Link></section>:<div className="progress-books">{overview.rows.map(row=><section className="progress-book" key={row.book.id}><div className="progress-book-heading"><h2>{row.book.title}</h2><strong>{row.percent}%</strong></div><progress max={row.book.pages.length} value={row.readPages.length} aria-label={row.book.title+' 읽기 진도'}/><p>{row.readPages.length} / {row.book.pages.length}페이지 읽음{row.reviewPages.length?' · 복습할 페이지 '+row.reviewPages.length+'개':''}</p><ol className="progress-page-list">{row.book.pages.map(page=><li key={page.id}><Link to={pageLink(row.book.id,page.id)}><span className={row.readPages.some(p=>p.id===page.id)?'read-indicator is-read':'read-indicator'}><Check size={14}/></span><span>{page.title}</span><small>{row.readPages.some(p=>p.id===page.id)?'읽음':'읽기 전'}</small><ChevronRight size={16}/></Link></li>)}</ol></section>)}</div>}
 </>;
}
