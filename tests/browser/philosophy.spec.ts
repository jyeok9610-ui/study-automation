import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const book='introduction-to-philosophy';
const pages=['what-is-philosophy','philosophical-inquiry','socrates','contemporary-philosophy'];

test('철학 서재에서 답과 해설을 사용하고 메모·북마크만 보관한다',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/#/library');
 await expect(page.getByText('5개의 분야, 하나의 서재')).toBeVisible();
 await page.screenshot({path:testInfo.outputPath('library.png')});
 await page.locator('.subject-book').filter({has:page.getByRole('heading',{name:'철학',exact:true})}).click();
 await page.getByRole('link',{name:/철학개론: 생각을 살펴보는 첫걸음/}).click();
 await expect(page.locator('.chapter-list>li')).toHaveCount(4);
 await page.getByRole('link',{name:'처음부터 읽기',exact:true}).click();
 await expect(page.locator('.reflection')).toHaveCount(4);
 const question=page.locator('.reflection').first();
 await expect(question.locator('details')).not.toHaveAttribute('open','');
 await question.getByLabel('생각 적기').fill('temporary-philosophy-answer-123');
 await question.getByText('해설과 검토 기준 보기',{exact:true}).click();
 await expect(question.locator('.explanation')).toContainText('사용 기록');
 await page.evaluate(()=>{const question=document.querySelector('.reflection');if(question)window.scrollTo(0,window.scrollY+question.getBoundingClientRect().top-180);});
 await page.screenshot({path:testInfo.outputPath('reflection.png')});
 await page.getByRole('button',{name:'출처',exact:true}).click();
 const sourcePanel=page.getByRole('dialog',{name:'출처와 보충 설명'});
 await expect(sourcePanel.getByRole('link',{name:'원문과 이용 조건 보기'})).toHaveCount(4);
 await expect(sourcePanel.getByRole('link',{name:'원문과 이용 조건 보기'}).first()).toHaveAttribute('href',/openstax.org\/books\/introduction-philosophy/);
 await page.getByRole('button',{name:'도움말 닫기'}).click();
 await expect(question.getByLabel('생각 적기')).toHaveValue('temporary-philosophy-answer-123');
 await page.getByRole('button',{name:'북마크 추가',exact:true}).click();
 await page.getByRole('button',{name:'메모',exact:true}).click();
 await page.getByLabel('페이지 메모').fill('철학 학습 메모');
 await expect(page.getByRole('status')).toContainText(['메모를 저장했어요.']);
 await page.getByRole('button',{name:'도움말 닫기'}).click();
 await page.getByRole('button',{name:'읽음 표시',exact:true}).click();
 await page.reload();
 await expect(page.locator('.reflection').first().getByLabel('생각 적기')).toHaveValue('');
 await expect(page.locator('.reflection').first().locator('details')).not.toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'북마크 해제',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'읽음 표시',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'메모',exact:true}).click();
 await expect(page.getByLabel('페이지 메모')).toHaveValue('철학 학습 메모');
 await page.getByRole('button',{name:'도움말 닫기'}).click();
 await page.goto('/#/settings');
 const pending=page.waitForEvent('download');
 await page.getByRole('button',{name:'기록 내보내기',exact:true}).click();
 const download=await pending;
 const backup=await fs.readFile((await download.path())!,'utf8');
 expect(backup).not.toContain('temporary-philosophy-answer-123');
 expect(backup).toContain('철학 학습 메모');
 expect(errors).toEqual([]);
});

test('철학 네 페이지의 본문·표·문항을 표시하고 가로 넘침이 없다',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const id of pages){
  await page.goto('/#/books/'+book+'/pages/'+id);
  await expect(page.locator('.page-header h1')).toBeVisible();
  await expect(page.locator('.reflection')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:testInfo.outputPath(id+'.png')});
 }
 expect(errors).toEqual([]);
});

test('철학 검색과 용어 사전은 일본어 발음 UI 없이 동작한다',async({page})=>{
 await page.goto('/#/search');
 await page.getByLabel('서재 검색').fill('반성적 평형');
 await expect(page.locator('.search-results>a').first()).toContainText('철학');
 await page.goto('/#/books/'+book+'/pages/philosophical-inquiry');
 await page.getByRole('button',{name:'사전',exact:true}).click();
 const panel=page.getByRole('dialog',{name:'용어 사전'});
 await panel.getByLabel('단어·읽기·뜻 찾기').fill('논증');
 const entry=panel.locator('details').filter({has:page.getByText('논증',{exact:true})});
 await entry.locator('summary').click();
 await expect(entry.locator('.word-reading')).toHaveText('argument');
 await expect(entry.getByRole('button')).toHaveCount(0);
 await page.getByRole('button',{name:'도움말 닫기'}).click();
 await page.locator('.reflection').first().locator('summary').focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('.reflection').first().locator('.explanation')).toBeVisible();
});