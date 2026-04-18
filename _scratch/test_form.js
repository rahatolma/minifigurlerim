const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3004/iletisim');
  
  await page.waitForSelector('input[name="first_name"]');
  
  // Try to type
  await page.type('input[name="first_name"]', 'Hello World', { delay: 50 });
  
  const val = await page.inputValue('input[name="first_name"]');
  console.log("Input value is: '" + val + "'");
  
  if (val === '') {
    console.log("Typing failed!");
    // check event listeners
    const listeners = await page.evaluate(() => {
        return window.getEventListeners ? window.getEventListeners(document) : 'Not available';
    });
    console.log("Listeners:", listeners);
  } else {
    console.log("Typing Succeeded!");
  }
  
  await browser.close();
})();
