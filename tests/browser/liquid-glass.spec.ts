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

test('Home menu opens, dismisses outside and with Escape, and closes on navigation',async({page})=>{
 await page.goto('/');await expect(page.locator('.dashboard-panel')).toBeVisible();
 const panel=page.locator('#home-navigation');
 await expect(panel).toBeHidden();
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await expect(panel).toBeVisible();await expect.poll(async()=>Math.round((await panel.boundingBox())!.x)).toBe(0);
 const bounds=await panel.boundingBox();expect(Math.abs(bounds!.x)).toBeLessThanOrEqual(1);expect(Math.abs(bounds!.y)).toBeLessThanOrEqual(1);expect(Math.abs(bounds!.height-page.viewportSize()!.height)).toBeLessThanOrEqual(1);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width-40);
 await page.mouse.click(page.viewportSize()!.width-12,page.viewportSize()!.height/2);await expect(panel).toBeHidden();
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();
 await panel.getByRole('link',{name:'홈',exact:true}).focus();await page.keyboard.press('Escape');await expect(panel).toBeHidden();await expect(page.getByRole('button',{name:'메뉴 열기',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await panel.getByRole('button',{name:'메뉴 닫기',exact:true}).click();await expect(panel).toBeHidden();
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await panel.getByRole('link',{name:'홈',exact:true}).click();await expect(panel).toBeHidden();
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await panel.getByRole('link',{name:'내 서재',exact:true}).click();await expect(page).toHaveURL(/#\/library$/);
 await page.goto('/#/map');await expect(page.locator('.concept-panel')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width+1);
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
