import { useRef, useState, type PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PanelLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import { PrimaryNavigation, SkipLink } from './Navigation';

export default function HomeFrame({children}:PropsWithChildren){
 const [menuOpen,setMenuOpen]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null);
 return <div className="home-root"><SkipLink/><div className="home-window">
  <header className="home-window-header"><div className="home-window-heading"><button ref={menuButton} className="home-menu-toggle" popoverTarget="home-navigation" aria-label="메뉴 열기" aria-expanded={menuOpen} aria-controls="home-navigation"><PanelLeft size={23} aria-hidden="true"/></button><Link className="brand home-window-brand" to="/"><span className="brand-mark"><BookOpen size={24} strokeWidth={1.7} aria-hidden="true"/></span><span>나의 지식 서재</span></Link></div><nav className="home-window-tools" aria-label="서재 도구"><Link to="/search" aria-label="검색 화면 열기"><Search size={25} aria-hidden="true"/></Link><Link to="/settings" aria-label="읽기 기록 설정"><SlidersHorizontal size={25} aria-hidden="true"/></Link></nav></header>
  <div id="home-navigation" popover="auto" className="home-navigation-popover glass" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();event.currentTarget.hidePopover();requestAnimationFrame(()=>menuButton.current?.focus());}}} onToggle={event=>setMenuOpen(event.newState==='open')} onClick={event=>{if((event.target as HTMLElement).closest('a'))event.currentTarget.hidePopover();}}><div className="home-drawer-header"><span><BookOpen size={23} aria-hidden="true"/>나의 지식 서재</span><button popoverTarget="home-navigation" popoverTargetAction="hide" aria-label="메뉴 닫기"><X size={21} aria-hidden="true"/></button></div><PrimaryNavigation className="main-nav home-primary-nav"/></div>
  <main id="main" className="home-window-main">{children}</main>
  <footer className="home-window-footer">천천히 읽고, 내 말로 이해하는 공간.</footer>
 </div></div>;
}