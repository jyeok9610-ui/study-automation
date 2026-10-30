import { test, expect } from '@playwright/test';

test('Every page can navigate directly through the same sliding drawer',async({page})=>{
 const routes=['/library','/books/first-sentences','/books/first-sentences/pages/nominal','/books/first-sentences/about','/bookmarks','/progress','/search','/subjects/japanese','/paths','/map','/settings','/not-a-page'];
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const route of routes){
  await page.goto('/#'+route);await expect(page.locator('main#main')).toBeVisible();
  await page.evaluate(()=>scrollTo(0,420));
  const trigger=page.getByRole('button',{name:'메뉴 열기',exact:true});await expect(trigger).toBeInViewport();await trigger.click();
  const drawer=page.locator('#app-navigation');await expect(drawer).toBeVisible();
  await expect.poll(async()=>Math.round((await drawer.boundingBox())!.x)).toBe(0);
  const bounds=await drawer.boundingBox();expect(Math.round(bounds!.height)).toBe(page.viewportSize()!.height);
  await expect(drawer.getByRole('navigation',{name:'더 둘러보기'})).toBeVisible();await expect(drawer.getByRole('navigation',{name:'분야 바로가기'})).toBeVisible();
  await drawer.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'내 서재',exact:true}).click();
  await expect(page).toHaveURL(/#\/library$/);await expect(drawer).toBeHidden();await expect(page.locator('.subject-shelf')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width+1);
 }
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await page.getByRole('navigation',{name:'더 둘러보기'}).getByRole('link',{name:'지식 지도'}).click();await expect(page).toHaveURL(/#\/map$/);await expect(page.locator('#app-navigation')).toBeHidden();
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await page.getByRole('navigation',{name:'분야 바로가기'}).getByRole('link',{name:'일본어',exact:true}).click();await expect(page).toHaveURL(/#\/subjects\/japanese$/);
 expect(errors).toEqual([]);
});