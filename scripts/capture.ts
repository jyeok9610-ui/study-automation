import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const folder=path.resolve('.impeccable/review');fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch();
for(const [name,width,height] of [['desktop',1365,900],['mobile',390,844]] as const){
 const context=await browser.newContext({viewport:{width,height},isMobile:name==='mobile',hasTouch:name==='mobile',colorScheme:'light'});
 const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.locator('.subject-book').first().waitFor();await page.screenshot({path:path.join(folder,name+'.png'),fullPage:true});
 await page.goto('http://127.0.0.1:4173/#/books/first-sentences/pages/wa-ga');await page.locator('.page-header h1').waitFor();await page.screenshot({path:path.join(folder,'reader-'+name+'.png'),fullPage:true});await page.locator('.lab').first().screenshot({path:path.join(folder,'activity-'+name+'.png')});
 await page.goto('http://127.0.0.1:4173/#/map');await page.locator('.concept-panel').waitFor();await page.screenshot({path:path.join(folder,'map-'+name+'.png'),fullPage:true});
 console.log(JSON.stringify({name,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),pageErrors:errors}));
 await context.close();
}
await browser.close();

