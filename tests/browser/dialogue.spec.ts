import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import type { Book } from '../../src/shared/schema';

const book:Book=JSON.parse(fs.readFileSync('public/content/books/first-sentences.json','utf8'));

test('일본어책의 질답 역할과 문장별 읽기·뜻을 표시한다',async({page})=>{
  for(const chapter of book.pages){
    await page.goto('/#/books/first-sentences/pages/'+chapter.id);
    const expected=chapter.blocks.flatMap(block=>block.examples||[]);
    const examples=page.locator('.learning-block .example');
    await expect(examples).toHaveCount(expected.length);
    for(let index=0;index<expected.length;index++){
      const example=expected[index],card=examples.nth(index);
      await expect(card.locator('.japanese')).toHaveText(example.ja);
      await expect(card.locator('.reading')).toHaveText(example.reading);
      await expect(card.locator('.meaning')).toHaveText(example.meaning);
      if(example.role){
        await expect(card.locator('.example-role')).toHaveText(example.role==='question'?'질문 :':'답변 :');
      }else{
        await expect(card.locator('.example-role')).toHaveCount(0);
      }
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width+1);
  }
  await page.goto('/#/books/first-sentences/pages/demonstratives');
  const split=page.locator('#demonstratives-04 .example');
  await expect(split.locator('.example-role')).toHaveText(['질문 :','답변 :','질문 :','답변 :','질문 :','답변 :']);
  await expect(split.nth(0).locator('.japanese')).toHaveText('これは何ですか。');
  await expect(split.nth(1).locator('.japanese')).toHaveText('これははさみです。');
  const questionBounds=(await split.nth(0).boundingBox())!;
  const answerBounds=(await split.nth(1).boundingBox())!;
  expect(answerBounds.y).toBeGreaterThanOrEqual(questionBounds.y+questionBounds.height);
});

test('は·が 체험에서도 질문 아래에 답변을 표시하고 선택을 반영한다',async({page})=>{
  await page.goto('/#/books/first-sentences/pages/wa-ga');
  const conversation=page.locator('.conversation');
  await expect(conversation.locator(':scope > div > span')).toHaveText(['질문 :','답변 :']);
  const question=(await conversation.locator(':scope > div').nth(0).boundingBox())!;
  const answer=(await conversation.locator(':scope > div').nth(1).boundingBox())!;
  expect(answer.y).toBeGreaterThanOrEqual(question.y+question.height);
  await page.getByRole('button',{name:'학생인 사람 찾기',exact:true}).click();
  await expect(conversation.locator('p').first()).toHaveText('誰が学生ですか。');
  await page.getByRole('button',{name:'が를 넣어 보기',exact:true}).click();
  await expect(conversation.locator('p').last()).toHaveText('私 が 学生です。');
  await page.getByRole('button',{name:'처음 만나 자기소개',exact:true}).click();
  await expect(conversation.locator('strong')).toHaveText('？');
  await page.getByRole('button',{name:'は를 넣어 보기',exact:true}).click();
  await expect(conversation.locator('p').last()).toHaveText('私 は 学生です。');
});
