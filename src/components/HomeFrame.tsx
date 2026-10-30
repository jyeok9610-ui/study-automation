import type { PropsWithChildren } from 'react';
import type { Library } from '../shared/schema';
import AppHeader from './AppHeader';
import { SkipLink } from './Navigation';

export default function HomeFrame({children,library}:PropsWithChildren<{library?:Library}>){
 return <div className="home-root"><SkipLink/><div className="home-window">
  <AppHeader home library={library}/>
  <main id="main" className="home-window-main">{children}</main>
  <footer className="home-window-footer">천천히 읽고, 내 말로 이해하는 공간.</footer>
 </div></div>;
}