import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const round=process.argv[2]||'final';
if(!/^[a-z0-9-]+$/.test(round))throw new Error('Use a simple capture round name.');
const folder=path.resolve('.impeccable/review/liquid-glass',round);
fs.mkdirSync(folder,{recursive:true});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch();
const reports:unknown[]=[];
const routes=[
 ['home','/','.dashboard-panel'],
 ['library','/#/library','.subject-book'],
 ['bookmarks','/#/bookmarks','.empty-state'],
 ['progress','/#/progress','.progress-books'],
 ['subject','/#/subjects/japanese','.book-card'],
 ['intro','/#/books/first-sentences','.chapter-list'],
 ['reader','/#/books/first-sentences/pages/nominal','.page-header h1'],
 ['search','/#/search?q=취미','.search-results>a'],
 ['paths','/#/paths','.path-list>a'],
 ['map','/#/map','.concept-panel'],
 ['settings','/#/settings','.settings-content'],
 ['empty','/#/subjects/camera','.empty-state'],
 ['missing','/#/not-a-page','.empty-state'],
] as const;
try{
 for(const [device,width,height] of [['desktop',1920,1080],['laptop',1440,900],['mobile',390,844]] as const){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:device==='mobile',hasTouch:device==='mobile',colorScheme:'light'});
  const page=await context.newPage();const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  for(const [name,route,ready] of routes){
   await page.goto(base+route);await page.locator(ready).first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(320);
   const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,colorScheme:getComputedStyle(document.documentElement).colorScheme,overflow:Array.from(document.querySelectorAll<HTMLElement>('body *')).filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&(r.right>innerWidth+2||r.left < -2)&&s.position!=='fixed'&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('.table-scroll,.sr-only,.skip-link')}).slice(0,10).map(e=>({tag:e.tagName,class:e.className}))}));
   await page.screenshot({path:path.join(folder,device+'-'+name+'.png'),fullPage:name!=='reader',animations:'disabled'});
   if(['home','map'].includes(name))await page.screenshot({path:path.join(folder,device+'-'+name+'-viewport.png'),animations:'disabled'});
   reports.push({device,route:name,expectedWidth:width,expectedHeight:height,...metrics,errors:[...new Set(errors)]});errors.length=0;
  }
  await page.goto(base+'/#/books/first-sentences/pages/wa-ga');await page.locator('.lab').first().waitFor();await page.locator('.lab').first().scrollIntoViewIfNeeded();await page.waitForTimeout(320);
  await page.locator('.lab').first().screenshot({path:path.join(folder,device+'-activity.png'),animations:'disabled'});
  await page.getByRole('button',{name:'사전',exact:true}).click();await page.getByRole('dialog').waitFor();await page.waitForTimeout(320);
  await page.screenshot({path:path.join(folder,device+'-panel.png'),animations:'disabled'});
  await page.keyboard.press('Escape');
  if(round!=='before'){
   await page.goto(base+'/#/books/first-sentences/pages/nominal');await page.locator('.page-header').waitFor();
   await page.getByRole('button',{name:'북마크 추가',exact:true}).click();await page.getByRole('button',{name:'북마크 해제',exact:true}).waitFor();
   await page.getByRole('button',{name:'읽음 표시',exact:true}).click();
   await page.goto(base+'/');await page.getByText('13%',{exact:true}).waitFor();await page.screenshot({path:path.join(folder,device+'-home-with-progress.png'),animations:'disabled'});
   await page.goto(base+'/#/bookmarks');await page.locator('.bookmark-item').waitFor();await page.screenshot({path:path.join(folder,device+'-saved-bookmark.png'),animations:'disabled'});
   await page.goto(base+'/#/progress');await page.locator('.read-indicator.is-read').waitFor();await page.screenshot({path:path.join(folder,device+'-reading-progress.png'),animations:'disabled'});
   reports.push({device,route:'saved-reading',percent:'13%',bookmarks:1,errors:[...new Set(errors)]});errors.length=0;
  }
  if(round!=='before'){
   await page.goto(base+'/#/books/first-sentences/pages/nominal');await page.locator('.page-header').waitFor();await page.evaluate(()=>scrollTo(0,350));await page.waitForTimeout(320);
   reports.push({device,route:'scrolled',active:await page.locator('html').getAttribute('data-scrolled')});
   await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
   await page.evaluate(()=>{localStorage.setItem('library-theme','dark')});await page.reload();await page.locator('.page-header').waitFor();
   reports.push({device,route:'accessibility-preferences',...await page.evaluate(()=>({colorScheme:getComputedStyle(document.documentElement).colorScheme,theme:document.documentElement.dataset.theme,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,motion:getComputedStyle(document.querySelector('.reader-toolbar')!).transitionDuration}))});
  }
  await context.close();
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(folder,'report.json'),JSON.stringify(reports,null,2));
const bad=reports.filter((r:any)=>r.scrollWidth>r.expectedWidth+1||r.width>r.expectedWidth+1||r.errors?.length);
console.log(JSON.stringify({round,folder,captures:fs.readdirSync(folder).filter(name=>name.endsWith('.png')).length,pages:reports.length,issues:bad},null,2));
if(bad.length)process.exitCode=1;
