const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting headless UI check...');
  const URL = process.env.URL || 'http://localhost:3002';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(20000);
  try {
    await page.goto(URL, { waitUntil: 'networkidle2' });

    // Check for error banner
    const errorBanner = await page.$('.error-banner');
    const errorText = errorBanner ? (await page.evaluate(el => el.innerText, errorBanner)).trim() : null;

    // Check search-results span
    const searchResults = await page.$('.search-results');
    const countsText = searchResults ? (await page.evaluate(el => el.innerText, searchResults)).trim() : null;

    // Check footer airports count
    const footer = await page.$('footer.app-footer');
    const footerText = footer ? (await page.evaluate(el => el.innerText, footer)).trim() : null;

    console.log('URL:', URL);
    console.log('Error banner present:', !!errorBanner);
    if (errorText) console.log('Error banner text:', errorText.replace(/\n/g, ' | '));
    console.log('Search results string:', countsText);
    console.log('Footer text:', footerText);

    // Try to extract numeric counts
    const matched = countsText ? countsText.match(/(\d+) of (\d+)/) : null;
    if (matched) {
      console.log(`Filtered: ${matched[1]}, Total: ${matched[2]}`);
    } else {
      // fallback: extract from footer
      const mf = footerText ? footerText.match(/(\d+) Airports/) : null;
      if (mf) console.log(`Total airports (footer): ${mf[1]}`);
    }

  } catch (err) {
    console.error('Headless check failed:', err.message);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();