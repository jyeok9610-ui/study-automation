import { test, expect } from '@playwright/test';

test('Light Mode stays fixed without deleting an old theme preference',async({page})=>{
 await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('library-theme','dark'));await page.reload();
 await expect(page.locator('.dashboard-panel')).toBeVisible();
 expect(await page.locator('html').getAttribute('data-theme')).toBe('light');
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme)).toBe('light');
 expect(await page.evaluate(()=>localStorage.getItem('library-theme'))).toBe('dark');
 await expect(page.getByRole('button',{name:'어두운 테마로'})).toHaveCount(0);
});

test('Navigation stays in the viewport and leaves the mobile brand clear',async({page,isMobile})=>{
 await page.goto('/');await expect(page.locator('.dashboard-panel')).toBeVisible();
 const nav=await page.locator('.main-nav').boundingBox();expect(nav).not.toBeNull();
 if(isMobile){
  const panel=await page.locator(".dashboard-panel").boundingBox();expect(panel).not.toBeNull();expect(nav!.x+nav!.width).toBeLessThanOrEqual(panel!.x);expect(nav!.y).toBeLessThan(160);
  await page.evaluate(()=>scrollTo(100,0));expect(await page.evaluate(()=>scrollX)).toBe(0);
  const brand=await page.locator('.brand').boundingBox();expect(brand!.y+brand!.height).toBeLessThan(nav!.y);
 }
 await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'내 서재',exact:true}).click();
 await page.goto('/#/map');
 await expect(page.locator('.concept-panel')).toBeVisible();
 const dimensions=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}));
 expect(dimensions.inner).toBe(page.viewportSize()!.width);expect(dimensions.scroll).toBeLessThanOrEqual(page.viewportSize()!.width+1);
});

test('Scroll depth, opaque reading surface, and reduced motion are observable',async({page})=>{
 await page.goto('/#/books/first-sentences/pages/nominal');await expect(page.locator('.page-header')).toBeVisible();
 expect(await page.locator('.reading-paper').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(255, 255, 255)');
 await page.evaluate(()=>scrollTo(0,420));await expect(page.locator('html')).toHaveAttribute('data-scrolled','true');
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await page.locator('.reader-toolbar').evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration))).toBeLessThan(.01);
 await page.getByRole('button',{name:'사전',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'사전',exact:true})).toBeFocused();
});
