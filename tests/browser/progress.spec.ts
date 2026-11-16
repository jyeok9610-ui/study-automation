import { test, expect, type Page } from '@playwright/test';

async function reading(page: Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('study-library', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<{pageId: string; readPages: string[]; reviewPages: string[]}>((resolve, reject) => {
        const request = database.transaction('progress').objectStore('progress').get('first-sentences');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { database.close(); }
  });
}

async function markRead(page: Page) {
  await page.getByRole('button', { name: '읽음 표시', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('읽음 표시를 저장했어요.');
}

test('이전 탭의 스크롤과 페이지 종료가 다른 탭에서 읽은 세 장을 지우지 않는다', async ({ context, page }) => {
  await page.goto('/#/books/first-sentences/pages/nominal');
  await markRead(page);
  const other = await context.newPage();
  for (const pageId of ['wa-ga', 'location']) {
    await other.goto('/#/books/first-sentences/pages/' + pageId);
    await markRead(other);
  }
  const expected = ['nominal', 'wa-ga', 'location'];
  await expect.poll(async () => (await reading(other)).readPages).toEqual(expected);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);
  // Let the existing 250ms scroll-save debounce commit before checking preservation.
  await page.waitForTimeout(500);
  await expect.poll(async () => (await reading(other)).readPages).toEqual(expected);
  await page.getByRole('button', { name: '메뉴 열기', exact: true }).click();
  await page.getByRole('navigation', { name: '주 메뉴' }).getByRole('link', { name: '내 서재', exact: true }).click();
  await expect.poll(async () => (await reading(other)).readPages).toEqual(expected);
  await other.reload();
  await expect(other.getByRole('button', { name: '읽음 표시', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('이전 탭에서 읽음과 복습 표시를 변경해도 다른 페이지 기록을 보존한다', async ({ context, page }) => {
  await page.goto('/#/books/first-sentences/pages/nominal');
  await page.locator('.page-end').waitFor();
  const other = await context.newPage();
  for (const pageId of ['wa-ga', 'location']) {
    await other.goto('/#/books/first-sentences/pages/' + pageId);
    await markRead(other);
  }
  await other.getByRole('button', { name: '복습 표시', exact: true }).click();
  await expect(other.getByRole('status')).toContainText('복습 표시를 저장했어요.');
  await markRead(page);
  await expect.poll(async () => (await reading(page)).readPages).toEqual(['wa-ga', 'location', 'nominal']);
  await page.getByRole('button', { name: '복습 표시', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('복습 표시를 저장했어요.');
  await expect.poll(async () => (await reading(page)).reviewPages).toEqual(['location', 'nominal']);
  await markRead(other);
  await expect.poll(async () => (await reading(page)).readPages).toEqual(['wa-ga', 'nominal']);
  await expect.poll(async () => (await reading(page)).reviewPages).toEqual(['location', 'nominal']);
  await page.reload();
  await expect(page.getByRole('button', { name: '읽음 표시', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '복습 표시', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('장 이동 직후 저장한 진도와 현재 페이지가 다음 날 다시 열어도 유지된다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const pageId of ['nominal', 'wa-ga', 'location']) {
    await page.goto('/#/books/first-sentences/pages/' + pageId);
    await markRead(page);
    await expect.poll(async () => (await reading(page)).pageId).toBe(pageId);
  }
  await page.clock.setSystemTime(Date.now() + 24 * 60 * 60 * 1000);
  await page.reload();
  await expect(page.getByRole('button', { name: '읽음 표시', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await reading(page)).readPages).toEqual(['nominal', 'wa-ga', 'location']);
  await page.goto('/#/progress');
  await expect(page.locator('.read-indicator.is-read')).toHaveCount(3);
  expect(errors).toEqual([]);
});
