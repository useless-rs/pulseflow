import { test, expect } from '@playwright/test';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@pulseflow.io');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: /pulse/i })).toBeVisible();
}

test('board syncs across two clients over websocket', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await login(pageA);
  await login(pageB);
  await pageA.goto('/kanban');
  await pageB.goto('/kanban');
  await expect(pageA.getByText('live api').first()).toBeVisible({ timeout: 15000 });
  await expect(pageB.getByText('live api').first()).toBeVisible({ timeout: 15000 });

  const btn = pageA.getByRole('button', { name: /^Move .* to (To Do|Doing|Done)$/ }).first();
  const label = await btn.getAttribute('aria-label');
  const m = label?.match(/^Move (.+) to (.+)$/);
  if (!m) throw new Error('no move button found');
  const col = m[2] === 'To Do' ? 'todo' : m[2].toLowerCase();
  const target = { todo: 'col-todo', doing: 'col-doing', done: 'col-done' }[col];
  await btn.click();

  await expect(pageB.getByTestId(target).getByText(m[1]).first()).toBeVisible({ timeout: 15000 });

  await ctxA.close();
  await ctxB.close();
});
