import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { PrimaryNavigation, SkipLink } from './Navigation';

export default function HomeFrame({children}:PropsWithChildren){
 return <div className="home-root"><SkipLink/><div className="home-window">
  <header className="home-window-header"><Link className="brand home-window-brand" to="/"><span className="brand-mark"><BookOpen size={24} strokeWidth={1.7} aria-hidden="true"/></span><span>나의 지식 서재</span></Link><nav className="home-window-tools" aria-label="서재 도구"><Link to="/search" aria-label="검색 화면 열기"><Search size={25} aria-hidden="true"/></Link><Link to="/settings" aria-label="읽기 기록 설정"><SlidersHorizontal size={25} aria-hidden="true"/></Link></nav></header>
  <aside className="home-window-sidebar"><PrimaryNavigation className="main-nav home-primary-nav"/></aside>
  <main id="main" className="home-window-main">{children}</main>
  <footer className="home-window-footer">천천히 읽고, 내 말로 이해하는 공간.</footer>
 </div></div>;
}
