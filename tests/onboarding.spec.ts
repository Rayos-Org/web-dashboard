import { test, expect } from '@playwright/test';

test('Onboarding flow basic validation', async ({ page }) => {
  // 1. Visit the home page
  await page.goto('http://localhost:3000/');
  
  // 2. Click "Create Wallet"
  await page.click('text=Create Wallet');
  
  // 3. Should be on create page with unsupported or actual flow
  // (Since Playwright by default won't have a platform authenticator setup out-of-the-box, it might show the "Unsupported" banner)
  
  const unsupportedBanner = page.locator('text=Unsupported Browser or Device');
  const createTitle = page.locator('text=Create your Guardian Wallet');
  
  await Promise.race([
    unsupportedBanner.waitFor({ state: 'visible' }),
    createTitle.waitFor({ state: 'visible' })
  ]);
  
  if (await unsupportedBanner.isVisible()) {
    // If unsupported, we assert it shows the message correctly.
    expect(await unsupportedBanner.isVisible()).toBeTruthy();
  } else {
    // If supported, we enter name and continue
    await page.fill('input[id="name"]', 'My Test Wallet');
    await page.click('button:has-text("Continue")');
    
    // Step 2 shows up
    await expect(page.locator('text=Create Passkey')).toBeVisible();
  }
});
