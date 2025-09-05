import { chromium } from 'playwright-core';

const PLAYWRIGHT_ENDPOINT = (process.env.PLAYWRIGHT_WS || '').replace(/\/+$/, '');

export async function googleQuery(text: string) {
  const { page, browser, context } = await getPageAndBrowser();

  const rejectCookies = page.getByRole('button', { name: 'Reject all' });
  const links = page.locator("//*[@id='search']//span//a//h3");

  try {
    await page.goto('https://google.com');
    try {
      await rejectCookies.waitFor({ timeout: 2000 });
      await rejectCookies.click();
    } catch {}

    await page.getByLabel('Search', { exact: true }).first().click();
    await page.getByLabel('Search', { exact: true }).first().fill(text);
    await page.getByRole('button', { name: 'Google Search' }).first().click();
    await page.waitForLoadState();

    const linkTexts = await links.allInnerTexts();
    let hrefList = await Promise.all(
      (await links.locator('xpath=..').all()).map(async (anchor) => (await anchor.getAttribute('href')) || '')
    );
    hrefList = hrefList.map((v) => `<${v}>`);
    return linkTexts.map((v, i) => `${v} - ${hrefList[i]}`);
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

export async function findYoutubeAudioByText(text: string): Promise<string | undefined> {
  const youtubeBaseUrl = 'https://www.youtube.com';
  const query = text.replace(/ /g, '+');
  const youtubeUrl = `${youtubeBaseUrl}/results?search_query=${query}`;

  const { page, browser, context } = await getPageAndBrowser();
  const rejectCookies = page.getByLabel('Reject the use of cookies and');
  const videosTab = page.getByRole('tab', { name: 'Videos' });

  try {
    await page.goto(youtubeUrl);

    try {
      await rejectCookies.waitFor({ timeout: 2000 });
      await rejectCookies.click();
    } catch {}

    try {
      await videosTab.waitFor({ timeout: 2000 });
      await videosTab.click();
    } catch {}

    const videoUrlLocator = page.locator("//*[@id='page-manager']//*[@id='thumbnail']").first();
    try {
      await videoUrlLocator.waitFor({ timeout: 2000 });
    } catch {
      return undefined;
    }

    const path = await videoUrlLocator.getAttribute('href');
    return path ? youtubeBaseUrl + path : undefined;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

export async function getPageAndBrowser() {
  if (!PLAYWRIGHT_ENDPOINT) {
    throw new Error('PLAYWRIGHT_WS is not set');
  }
  const browser = await chromium.connect({ wsEndpoint: PLAYWRIGHT_ENDPOINT });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { page, browser, context };
}
