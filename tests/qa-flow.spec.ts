import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

test.describe('Unapproved User QA Flow', () => {
  const email = `qa_test_${Date.now()}@minifigurlerim.com`;
  const password = 'Password123!';

  test.afterAll(async () => {
    // Cleanup
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (data?.id) {
      await supabase.auth.admin.deleteUser(data.id);
    }
  });

  test('Full Flow: Register -> Test UI -> Approve -> Test Again', async ({ page }) => {
    // 1. REGISTER
    await page.goto('http://localhost:3006/en/login?type=register');
    
    // Fill form
    await page.locator('div[data-state="active"] input[name="email"]').fill(email);
    await page.locator('div[data-state="active"] input[name="password"]').fill(password);
    
    // Check terms and conditions if present
    const termsCheckbox = page.locator('button[role="checkbox"]');
    if (await termsCheckbox.isVisible()) {
       await termsCheckbox.click();
    }

    // Click register
    await page.locator('div[data-state="active"] button[type="submit"]').click();

    // Wait for login or redirect
    await page.waitForURL('**/login*message=*', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Check if we are redirected or need to click login
    if (page.url().includes('login')) {
       // ensure login tab is active
       await page.locator('button[value="login"]').click();
       await page.waitForTimeout(500);

       // fill login
       await page.locator('div[data-state="active"] input[name="email"]').fill(email);
       await page.locator('div[data-state="active"] input[name="password"]').fill(password);
       await page.locator('div[data-state="active"] button[type="submit"]').click();
       await page.waitForURL('**/collection', { timeout: 10000 });
    }
    
    // Should be at collection
    expect(page.url()).toContain('/en/collection');

    // 2. UNAPPROVED USER FLOW
    await page.goto('http://localhost:3006/en/figures/series-1/tribal-hunter');
    
    // Find Add to Collection
    const addButton = page.locator('button:has-text("Add to Collection")');
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();

    // Verify Toast appears
    const toastMessage = page.locator('div[role="status"]');
    await expect(toastMessage).toBeVisible({ timeout: 5000 });
    const text = await toastMessage.innerText();
    expect(text).toContain('Your account needs to be approved');

    // 3. ADMIN APPROVE
    const { data } = await supabase.from('profiles').select('id, username').eq('email', email).single();
    await supabase.from('profiles').update({ is_approved: true }).eq('id', data!.id);

    // 4. APPROVED USER FLOW
    await page.reload();
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();

    // Verify it changed to Remove from Collection
    const removeButton = page.locator('button:has-text("Remove from Collection")');
    await expect(removeButton).toBeVisible({ timeout: 5000 });

    // Verify Persistence
    await page.goto('http://localhost:3006/en/collection');
    await expect(page.locator('text=Tribal Hunter')).toBeVisible({ timeout: 5000 });
  });
});
