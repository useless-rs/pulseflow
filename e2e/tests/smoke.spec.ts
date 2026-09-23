import { test, expect } from '@playwright/test';

test('dashboard shows preview with sign-in CTA when logged out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /pulse/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
});

test('demo login leads to live dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@pulseflow.io');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByText('live', { exact: false }).first()).toBeVisible({ timeout: 10000 });
});

test('kanban ?q= deep link filters tasks', async ({ page }) => {
  await page.goto('/kanban?q=kanban');
  await expect(page.getByText('Ship Kanban UI')).toBeVisible();
  await expect(page.getByText('Design logo system')).toHaveCount(0);
  await expect(page.getByText('WIP 2/2')).toBeVisible();
});

test('kanban card drags between columns', async ({ page }) => {
  await page.goto('/kanban');
  const grip = page.getByRole('button', { name: 'Drag Write README that gets stars to reorder', exact: true });
  const doingCol = page.getByTestId('col-doing');
  await expect(grip).toBeVisible();
  const from = await grip.boundingBox();
  const to = await doingCol.boundingBox();
  if (!from || !to) throw new Error('no boxes');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + 120, { steps: 12 });
  await page.mouse.up();
  await expect(doingCol.getByText('Write README that gets stars').first()).toBeVisible();
  await expect(page.getByTestId('col-todo').getByText('Write README that gets stars')).toHaveCount(0);
});

test('command palette opens and jumps to analytics', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
  await page.getByRole('combobox', { name: /command palette/i }).fill('analytics');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/analytics/);
});

test('task drawer opens and edits a title', async ({ page }) => {
  await page.goto('/kanban');
  await page.getByRole('button', { name: 'Open details for Docker + CI gates', exact: true }).click();
  await expect(page.getByRole('dialog', { name: /details for/i })).toBeVisible();
  await page.getByLabel('Title').fill('Docker + CI gates v2');
  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByText('Docker + CI gates v2')).toBeVisible();
  await expect(page.getByRole('dialog', { name: /details for/i })).toHaveCount(0);
});
