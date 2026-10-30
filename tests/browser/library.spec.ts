import {test,expect} from '@playwright/test';
test('분야·내부 책·목차·빈 분야·검색·노선·지도를 실제로 이동한다',async({page})=>{
 await page.goto('/#/library');await expect(page.getByRole('heading',{name:'어떤 세계를 펼쳐볼까요?'})).toBeVisible();
 await page.locator('.subject-book').filter({has:page.getByRole('heading',{name:'일본어',exact:true})}).click();
 await expect(page.getByRole('heading',{name:'일본어의 안쪽 서재'})).toBeVisible();
 await page.getByRole('link',{name:/나를 소개하고 주변을 말하는 첫 문장/}).first().click();
 await expect(page.getByRole('heading',{name:'책의 차례'})).toBeVisible();
 await page.getByRole('link',{name:'처음부터 읽기'}).click();await expect(page.locator('.page-header h1')).toBeVisible();
 await page.goto('/#/search');await page.getByLabel('서재 검색').fill('は');await expect(page.locator('.search-results>a').first()).toBeVisible();
 await page.getByLabel('서재 검색').fill('qqq없는자료');await expect(page.getByRole('heading',{name:'일치하는 내용이 없어요'})).toBeVisible();
 await page.goto('/#/subjects/camera');await expect(page.getByRole('heading',{name:'이 분야의 첫 책을 준비하고 있어요'})).toBeVisible();
 await page.goto('/#/paths');await page.locator('.path-list>a').first().click();await expect(page.locator('.route-stops>li')).toHaveCount(4);await page.getByRole('link',{name:'이 페이지 펼치기'}).first().click();await expect(page.locator('.page-header h1')).toBeVisible();
 await page.goto('/#/map');await page.getByRole('button',{name:'위치와 존재',exact:true}).first().click();await expect(page.locator('.concept-panel h2')).toHaveText('위치와 존재');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});
test('문제는 패널을 닫아도 유지되고 새로 열면 초기화하며 위치·메모만 저장한다',async({page})=>{
 await page.goto('/#/books/first-sentences/pages/nominal');
 const first=page.locator('.question').first();await first.locator('.question-options button').first().click();await expect(first.locator('.question-options button[aria-pressed=true]')).toHaveCount(1);
 await page.getByRole('button',{name:'사전',exact:true}).click();await page.getByRole('button',{name:'도움말 닫기'}).click();await expect(first.locator('.question-options button[aria-pressed=true]')).toHaveCount(1);
 await page.getByRole('button',{name:'메모',exact:true}).click();await page.getByLabel('페이지 메모').fill('독립된 읽기 메모');await expect(page.getByRole('status')).toContainText(['메모를 저장했어요.']);await page.getByRole('button',{name:'도움말 닫기'}).click();
 await page.getByRole('button',{name:'읽음 표시',exact:true}).click();await expect(page.getByRole('button',{name:'읽음 표시',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.reload();await expect(page.locator('.question').first()).toBeVisible();await expect(page.locator('.question-options button[aria-pressed=true]')).toHaveCount(0);
 await page.getByRole('button',{name:'메모',exact:true}).click();await expect(page.getByLabel('페이지 메모')).toHaveValue('독립된 읽기 메모');await page.getByRole('button',{name:'도움말 닫기'}).click();
 const data=await page.evaluate(async()=>{const d=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('study-library',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const all:any={};for(const name of ['progress','notes','settings']){all[name]=await new Promise((resolve,reject)=>{const r=d.transaction(name).objectStore(name).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}return all});
 const p=data.progress[0];expect(p).not.toHaveProperty('answers');expect(p).not.toHaveProperty('score');expect(p).not.toHaveProperty('attempts');expect(data.notes[0].text).toBe('독립된 읽기 메모');
});
test('세 학습 활동의 입력이 실제 결과를 바꾼다',async({page})=>{
 await page.goto('/#/books/first-sentences/pages/wa-ga');await page.getByRole('button',{name:'학생인 사람 찾기'}).click();await page.getByRole('button',{name:'が를 넣어 보기'}).click();await expect(page.locator('.lab-feedback').first()).toContainText('誰が');
 await page.goto('/#/books/first-sentences/pages/location');await page.getByRole('button',{name:'고양이',exact:true}).click();await page.getByRole('button',{name:'中 · 안'}).click();await expect(page.locator('.lab-result')).toContainText('ねこは 箱の中に います。');
 await page.goto('/#/books/first-sentences/pages/hobbies');await page.getByRole('button',{name:'요리',exact:true}).click();await expect(page.locator('.sentence-pieces')).not.toContainText('こと');await page.getByRole('button',{name:'영화 보기',exact:true}).click();await expect(page.locator('.sentence-pieces')).toContainText('こと');
});
test('브라우저 기록 내보내기와 불량 파일 복구 안내',async({page})=>{
 await page.goto('/#/settings');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'기록 내보내기'}).click();const file=await download;expect(file.suggestedFilename()).toContain('.json');
 await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"not-reading"}')});await expect(page.getByRole('status')).toContainText('지원하지 않는 기록 파일');
});

