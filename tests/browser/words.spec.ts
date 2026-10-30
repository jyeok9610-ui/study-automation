import { test, expect } from '@playwright/test';

test('단어 팝업은 단어 전체와 한자 풀이를 보여주며 답을 바꾸지 않는다',async({page})=>{
 await page.goto('/#/books/first-sentences/pages/nominal');await expect(page.locator('.page-header')).toBeVisible();
 const question=page.locator('.question').first();await question.locator('.question-options button').first().click();
 const word=page.locator('.reading-paper .word-link').filter({hasText:/^学生$/}).first();await word.click();
 const popup=page.getByRole('dialog',{name:'学生',exact:true});await expect(popup).toBeVisible();
 await expect(popup.locator('.word-reading')).toHaveText('がくせい');await expect(popup.locator('.word-meaning')).toHaveText('학생');
 await expect(popup.locator('dt')).toHaveText(['学','生']);await expect(popup.locator('dd')).toHaveText(['배울 학','날 생']);
 const bounds=await popup.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.y).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
 await page.mouse.click(page.viewportSize()!.width/2,2);await expect(popup).toBeHidden();
 await expect(question.locator('.question-options button[aria-pressed=true]')).toHaveCount(1);
 await word.click();await expect(popup).toBeVisible();await page.keyboard.press('Escape');await expect(popup).toBeHidden();await expect(word).toBeFocused();
 await word.click();await popup.getByRole('button',{name:'단어 설명 닫기'}).click();await expect(popup).toBeHidden();await expect(word).toBeFocused();
 expect(await page.locator('button button').count()).toBe(0);await expect(page).toHaveURL(/pages\/nominal$/);
});

test('표의 긴 단어와 사전에도 같은 풀이가 있고 페이지 이동 시 닫힌다',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#/books/first-sentences/pages/demonstratives');
 const word=page.getByRole('button',{name:'携帯電話 단어 풀이',exact:true}).first();await word.click();
 const popup=page.getByRole('dialog',{name:'携帯電話',exact:true});await expect(popup).toBeVisible();
 await expect(popup.locator('.word-reading')).toHaveText('けいたいでんわ');await expect(popup.locator('dt')).toHaveText(['携','帯','電','話']);
 expect(await popup.evaluate(el=>parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThan(.01);
 await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();await expect(popup).toBeHidden();
 await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'내 서재',exact:true}).click();await expect(page).toHaveURL(/#\/library$/);await expect(page.locator('.word-popover')).toHaveCount(0);
 await page.goto('/#/books/first-sentences/pages/nominal');await page.getByRole('button',{name:'사전',exact:true}).click();
 await page.locator('.dictionary-list details').filter({has:page.locator('summary span',{hasText:/^学生$/})}).locator('summary').click();
 const entry=page.locator('.dictionary-list details[open]').first();await expect(entry.locator('dd')).toHaveText(['배울 학','날 생']);
});
test('누락 단어와 숫자 날짜도 분명한 파란 단어로 표시한다',async({page})=>{
 for(const [pageId,word,reading] of [['nominal','会社員','かいしゃいん'],['hobbies','日本語','にほんご'],['dates','3日','みっか']]){
  await page.goto('/#/books/first-sentences/pages/'+pageId);
  const link=page.locator('.reading-paper .word-link').filter({hasText:new RegExp('^'+word+'$')}).first();await expect(link).toBeVisible();
  const style=await link.evaluate(el=>{const css=getComputedStyle(el);return {color:css.color,background:css.backgroundColor,decoration:css.textDecorationStyle};});
  expect(style.color).toBe('rgb(0, 99, 206)');expect(style.background).toBe('rgb(234, 243, 255)');expect(style.decoration).toBe('solid');
  await link.click();const popup=page.getByRole('dialog',{name:word,exact:true});await expect(popup.locator('.word-reading')).toHaveText(reading);await popup.getByRole('button',{name:'단어 설명 닫기'}).click();
 }
 await page.getByRole('button',{name:'사전',exact:true}).click();
 for(const [word,reading] of [['20分','にじゅっぷん'],['2000年','にせんねん']]){
  await page.getByLabel('단어·읽기·뜻 찾기').fill(word);
  const entry=page.locator('.dictionary-list details').filter({has:page.locator('summary span',{hasText:new RegExp('^'+word+'$')})});await entry.locator('summary').click();await expect(entry.locator('.word-reading')).toHaveText(reading);
 }});