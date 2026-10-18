import { expect, test } from '@playwright/test';

const jobs = [
  {
    id: 'job-in-queue',
    player_name: 'Morgan Player',
    racquet: 'Babolat Pure Aero',
    status: 'in_queue',
    strung_at: null,
    picked_up_at: null,
    notes: '',
  },
  {
    id: 'job-queued',
    player_name: 'Alex Player',
    racquet: 'Wilson Blade',
    status: 'queued',
    strung_at: '2026-10-17T13:00:00.000Z',
    picked_up_at: null,
    notes: 'Queued job notes',
  },
  {
    id: 'job-ready',
    player_name: 'Casey Player',
    racquet: 'Yonex Ezone',
    status: 'ready_for_pickup',
    strung_at: null,
    picked_up_at: null,
    notes: '',
  },
  {
    id: 'job-done',
    player_name: 'Jordan Player',
    racquet: 'Head Speed',
    status: 'done',
    strung_at: '2026-10-16T10:00:00.000Z',
    picked_up_at: '2026-10-17T15:30:00.000Z',
    notes: 'Completed job notes',
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('admin_token', 'test-admin-token'));
  await page.route('**/api/stringing**', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(jobs),
    });
  });
});

test('loads and saves supported fields for jobs in every existing status', async ({ page }) => {
  for (const job of jobs) {
    await page.goto(`/jobs/edit?id=${job.id}`);

    await expect(page.getByRole('heading', { name: 'Edit Stringing Job' })).toBeVisible();
    await expect(page.locator('#status')).toHaveValue(job.status);
    await expect(page.locator('#notes')).toHaveValue(job.notes);
    await expect(page.locator('#job-summary')).toContainText(job.player_name);

    await page.locator('#notes').fill(`Updated ${job.id}`);
    const updateRequest = page.waitForRequest(
      (request) => request.method() === 'PUT' && request.url().includes(`/api/stringing/${job.id}`),
    );
    await page.getByRole('button', { name: 'Save changes' }).click();
    const request = await updateRequest;
    const payload = request.postDataJSON();

    expect(payload).toEqual({
      status: job.status,
      strung_at: job.strung_at,
      picked_up_at: job.picked_up_at,
      notes: `Updated ${job.id}`,
    });
    await expect(page).toHaveURL(/\/jobs\/?$/);
  }
});

test('edit action from jobs list opens the static edit route', async ({ page }) => {
  await page.goto('/jobs');
  await page.locator('#jobs-table button[data-action="edit"][data-id="job-queued"]').click();

  await expect(page).toHaveURL('/jobs/edit?id=job-queued');
  await expect(page.getByRole('heading', { name: 'Edit Stringing Job' })).toBeVisible();
  await expect(page.locator('#notes')).toHaveValue('Queued job notes');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Edit Stringing Job' })).toBeVisible();
  await expect(page.locator('#notes')).toHaveValue('Queued job notes');
});

test('keeps the form available and shows an error when saving fails', async ({ page }) => {
  await page.route('**/api/stringing/job-queued', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ status: 500, body: 'Server error' });
      return;
    }
    await route.fallback();
  });

  await page.goto('/jobs/edit?id=job-queued');
  await page.locator('#notes').fill('Keep this unsaved note');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByRole('alert')).toContainText('Your edits are still here');
  await expect(page.locator('#notes')).toHaveValue('Keep this unsaved note');
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();
});

test('shows a useful message when the selected job cannot be loaded', async ({ page }) => {
  await page.route('**/api/stringing**', async (route) => {
    await route.fulfill({ status: 500, body: 'Server error' });
  });

  await page.goto('/jobs/edit?id=job-missing');
  await expect(page.getByRole('alert')).toContainText('Unable to load this job');
});

test('asks the user to return to Jobs when no job id is supplied', async ({ page }) => {
  await page.goto('/jobs/edit');
  await expect(page.getByRole('alert')).toContainText('No job was selected');
});
