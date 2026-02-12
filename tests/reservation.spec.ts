import { test, expect } from '@playwright/test';

const getTomorrowDateString = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

test('reservation form submits and shows confirmation', async ({ page }) => {
  await page.route('**/rest/v1/restaurants*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'restaurant-1',
          name: 'Kalita Spectrum',
          phone: '+91 9876543210',
          address: 'Rukminigaon, Guwahati',
          theme_color: '#0f172a',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/reservations*', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'reservation-1' }),
    });
  });

  await page.route('**/functions/v1/send-reservation-email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/');

  const formHeading = page.getByRole('heading', { name: /Reserve Your Table/i });
  await formHeading.scrollIntoViewIfNeeded();

  await page.getByLabel(/Your Name/i).fill('Test User');
  await page.getByLabel(/Email Address/i).fill('test@example.com');
  await page.getByLabel(/Phone Number/i).fill('9876543210');
  await page.getByLabel(/Reservation Date/i).fill(getTomorrowDateString());
  await page.getByLabel(/Select Time/i).selectOption('19:00');
  await page.getByLabel(/Number of Guests/i).fill('2');

  await page.getByRole('button', { name: /Submit Reservation/i }).click();

  await expect(page.getByRole('heading', { name: /Reservation Confirmed/i })).toBeVisible();
  await expect(page.getByText(/confirmation email has been sent/i)).toBeVisible();
});
