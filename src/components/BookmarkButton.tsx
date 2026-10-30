import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { getBookmark, setBookmark } from '../lib/storage';

export default function BookmarkButton({bookId,pageId}:{bookId:string;pageId:string}){
 const [saved,setSaved]=useState(false),[busy,setBusy]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let active=true;getBookmark(bookId,pageId).then(value=>{if(active)setSaved(!!value);}).catch(()=>{if(active)setError('북마크를 불러오지 못했어요.');}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[bookId,pageId]);
 const toggle=async()=>{setBusy(true);setError('');try{await setBookmark(bookId,pageId,!saved);setSaved(!saved);}catch{setError('북마크를 저장하지 못했어요. 저장 공간을 확인해주세요.');}finally{setBusy(false);}};
 return <div className="bookmark-action"><button className="bookmark-control" disabled={busy} aria-label={saved?'북마크 해제':'북마크 추가'} aria-pressed={saved} onClick={toggle}><Bookmark size={17} fill={saved?'currentColor':'none'} aria-hidden="true"/><span>북마크</span></button>{error&&<p className="bookmark-notice" role="alert">{error}</p>}</div>;
}
