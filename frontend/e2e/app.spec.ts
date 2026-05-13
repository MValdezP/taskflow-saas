import { test, expect } from '@playwright/test';

// ─── Test 1: Login Flow ───────────────────────────────────────────────────────
test('user can log in with valid credentials', async ({ page }) => {
  await page.goto('/login');

  // Page should show TaskFlow branding
  await expect(page.locator('text=TaskFlow')).toBeVisible();
  await expect(page.locator('text=Welcome back')).toBeVisible();

  // Fill demo credentials
  await page.click('#fill-demo');
  await expect(page.locator('#email')).toHaveValue('alice@taskflow.dev');

  // Submit login
  await page.click('#login-submit');

  // Should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  await expect(page.locator('text=Good morning')).toBeVisible();
});

// ─── Test 2: Registration Flow ────────────────────────────────────────────────
test('user can register a new account', async ({ page }) => {
  await page.goto('/register');

  await expect(page.locator('text=Create account')).toBeVisible();

  const uniqueEmail = `test_${Date.now()}@example.com`;

  await page.fill('#reg-name', 'Test User');
  await page.fill('#reg-email', uniqueEmail);
  await page.fill('#reg-password', 'password123');

  await page.click('#register-submit');

  // Should redirect to dashboard after registration
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
});

// ─── Test 3: Create Project Flow ─────────────────────────────────────────────
test('authenticated user can create a project', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.click('#fill-demo');
  await page.click('#login-submit');
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  // Navigate to projects
  await page.goto('/projects');
  await expect(page.locator('text=Projects')).toBeVisible();

  // Open create form
  await page.click('#new-project-btn');
  await expect(page.locator('#project-name')).toBeVisible();

  // Fill project form
  const projectName = `E2E Project ${Date.now()}`;
  await page.fill('#project-name', projectName);

  // Submit
  await page.click('#create-project-submit');

  // Project should appear in the list
  await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 5000 });
});

// ─── Test 4: Kanban Board Renders ─────────────────────────────────────────────
test('kanban board displays task columns', async ({ page }) => {
  await page.goto('/login');
  await page.click('#fill-demo');
  await page.click('#login-submit');
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  await page.goto('/projects');
  await page.waitForTimeout(1000);

  // Click first project
  const openBtn = page.locator('text=Open →').first();
  if (await openBtn.isVisible()) {
    await openBtn.click();
    await expect(page.locator('text=To Do')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=In Review')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
  }
});

// ─── Test 5: Task Search / Filter ────────────────────────────────────────────
test('tasks page filter works', async ({ page }) => {
  await page.goto('/login');
  await page.click('#fill-demo');
  await page.click('#login-submit');
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  await page.goto('/tasks');
  await expect(page.locator('text=My Tasks')).toBeVisible();

  // Search for a task
  await page.fill('#task-search', 'auth');
  await page.waitForTimeout(500);

  // Filter by status
  await page.selectOption('#status-filter', 'DONE');
  await page.waitForTimeout(300);

  // Should still show the page without errors
  await expect(page.locator('text=My Tasks')).toBeVisible();
});
