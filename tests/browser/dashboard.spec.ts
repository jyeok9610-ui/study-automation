import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('홈은 실제 자료와 읽음 진도를 보여주고 현황으로 이어진다',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'오늘도, 한 걸음 더.'})).toBeVisible();
 await expect(page.locator('.dashboard-stats dd').first()).toHaveText('1권의 학습책');await expect(page.locator('.dashboard-stats dd').last()).toHaveText('0%');
 await expect(page.getByRole('heading',{name:'처음 펼쳐볼 자료'})).toBeVisible();
 await page.goto('/#/books/first-sentences/pages/nominal');await page.getByRole('button',{name:'읽음 표시',exact:true}).click();await expect(page.getByRole('status')).toContainText(['읽음 표시를 저장했어요.']);
 await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'홈',exact:true}).click();await expect(page.locator('.dashboard-stats dd').last()).toHaveText('13%');
 await expect(page.getByRole('heading',{name:'최근 학습 자료'})).toBeVisible();
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'학습 현황',exact:true}).click();await expect(page.locator('.progress-summary strong')).toHaveText('13%');await expect(page.locator('.read-indicator.is-read')).toHaveCount(1);
});
test('북마크는 새로고침·목록·해제·백업 복원까지 유지된다',async({page})=>{
 await page.goto('/#/books/first-sentences/pages/nominal');await page.getByRole('button',{name:'북마크 추가',exact:true}).click();await expect(page.getByRole('button',{name:'북마크 해제',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.reload();await expect(page.getByRole('button',{name:'북마크 해제',exact:true})).toBeEnabled();
 await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'북마크',exact:true}).click();await expect(page.locator('.bookmark-item')).toHaveCount(1);
 await page.locator('.bookmark-item>a').click();await expect(page.locator('.page-header')).toBeVisible();
 await page.goto('/#/settings');const pending=page.waitForEvent('download');await page.getByRole('button',{name:'기록 내보내기'}).click();const download=await pending;const raw=await fs.readFile((await download.path())!,'utf8');expect(JSON.parse(raw).bookmarks).toHaveLength(1);
 await page.goto('/#/bookmarks');await page.getByRole('button',{name:/북마크 해제/}).click();await expect(page.getByRole('heading',{name:'기억하고 싶은 페이지를 남겨보세요'})).toBeVisible();
 await page.goto('/#/settings');await page.locator('input[type=file]').setInputFiles({name:'reading.json',mimeType:'application/json',buffer:Buffer.from(raw)});await expect(page.getByRole('status')).toContainText('북마크 1개');
 await page.goto('/#/bookmarks');await expect(page.locator('.bookmark-item')).toHaveCount(1);
});
test('이전 메모·settings를 보존하면서 버전1 DB에 북마크를 더한다',async({page})=>{
 await page.goto('/#/settings');const legacy={format:'study-library-reading',version:1,progress:[],notes:[{id:'first-sentences/nominal',bookId:'first-sentences',pageId:'nominal',text:'이전부터 적은 메모',updatedAt:123}]};
 await page.locator('input[type=file]').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await expect(page.getByRole('status')).toContainText('메모 1개');
 await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('study-library',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise<void>((resolve,reject)=>{const tx=db.transaction('settings','readwrite');tx.objectStore('settings').put({id:'existing-setting',value:'keep'});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close();});
 await page.goto('/#/books/first-sentences/pages/nominal');await page.getByRole('button',{name:'북마크 추가',exact:true}).click();await expect(page.getByRole('button',{name:'북마크 해제',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'메모',exact:true}).click();await expect(page.getByLabel('페이지 메모')).toHaveValue('이전부터 적은 메모');await page.keyboard.press('Escape');
 const preserved=await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('study-library',1);r.onsuccess=()=>resolve(r.result)});const setting=await new Promise<any>(resolve=>{const r=db.transaction('settings').objectStore('settings').get('existing-setting');r.onsuccess=()=>resolve(r.result)});const result={version:db.version,value:setting.value};db.close();return result});expect(preserved).toEqual({version:1,value:'keep'});
});
