import { NavLink } from 'react-router-dom';
import { Bookmark, ChartNoAxesColumnIncreasing, Home, Library } from 'lucide-react';

export function PrimaryNavigation({className='main-nav'}:{className?:string}){
 return <nav className={className} aria-label="주 메뉴">
  <NavLink to="/" end><Home size={19} aria-hidden="true"/><span>홈</span></NavLink>
  <NavLink to="/library"><Library size={19} aria-hidden="true"/><span>내 서재</span></NavLink>
  <NavLink to="/bookmarks"><Bookmark size={19} aria-hidden="true"/><span>북마크</span></NavLink>
  <NavLink to="/progress"><ChartNoAxesColumnIncreasing size={19} aria-hidden="true"/><span>학습 현황</span></NavLink>
 </nav>;
}
export function SkipLink(){
 return <a className="skip-link" href="#main" onClick={event=>{event.preventDefault();const main=document.getElementById('main');if(main){main.setAttribute('tabindex','-1');main.focus();main.scrollIntoView();}}}>본문으로 건너뛰기</a>;
}
