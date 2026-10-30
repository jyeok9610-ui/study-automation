import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, ChevronRight, Compass, Map as MapIcon, PanelLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Library } from '../shared/schema';
import { PrimaryNavigation } from './Navigation';

export default function AppHeader({library,home=false}:{library?:Library;home?:boolean}){
 const [menuOpen,setMenuOpen]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null),drawer=useRef<HTMLDivElement>(null);
 const location=useLocation();
 useEffect(()=>{drawer.current?.hidePopover();},[location.key]);
 return <>
  <header className={home?'home-window-header':'site-header app-header glass'}><div className="home-window-heading"><button ref={menuButton} className="home-menu-toggle" popoverTarget="app-navigation" aria-label="메뉴 열기" aria-expanded={menuOpen} aria-controls="app-navigation"><PanelLeft size={23} aria-hidden="true"/></button><Link className="brand home-window-brand" to="/"><span className="brand-mark"><BookOpen size={24} strokeWidth={1.7} aria-hidden="true"/></span><span>나의 지식 서재</span></Link></div><nav className="home-window-tools" aria-label="서재 도구"><Link to="/search" aria-label="검색 화면 열기"><Search size={25} aria-hidden="true"/></Link><Link to="/settings" aria-label="읽기 기록 설정"><SlidersHorizontal size={25} aria-hidden="true"/></Link></nav></header>
  <div ref={drawer} id="app-navigation" popover="auto" className="home-navigation-popover glass" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();event.currentTarget.hidePopover();requestAnimationFrame(()=>menuButton.current?.focus());}}} onToggle={event=>setMenuOpen(event.newState==='open')} onClick={event=>{if((event.target as HTMLElement).closest('a'))event.currentTarget.hidePopover();}}>
   <div className="home-drawer-header"><span><BookOpen size={23} aria-hidden="true"/>나의 지식 서재</span><button popoverTarget="app-navigation" popoverTargetAction="hide" aria-label="메뉴 닫기"><X size={21} aria-hidden="true"/></button></div>
   <PrimaryNavigation className="main-nav home-primary-nav"/>
   <nav className="sidebar-explore" aria-label="더 둘러보기"><NavLink to="/paths"><Compass size={18} aria-hidden="true"/><span>읽기 노선</span></NavLink><NavLink to="/map"><MapIcon size={18} aria-hidden="true"/><span>지식 지도</span></NavLink></nav>
   {library&&<nav className="sidebar-subjects" aria-label="분야 바로가기"><h2>나의 분야</h2>{library.subjects.map(s=><NavLink key={s.id} to={'/subjects/'+s.id}><span className="subject-dot" style={{background:s.color}}/><span>{s.title}</span><ChevronRight size={14} aria-hidden="true"/></NavLink>)}</nav>}
  </div>
 </>;
}