import playwright from 'playwright';
import { sleep } from './debugHelper';

export async function googleQuery(text: string) {
  const { page, browser } = await getPageAndBrowser();

  const rejectCookies = page.getByRole('button', { name: 'Reject all' });
  const links = page.locator(" //*[@id='search']  //span//a //h3");

  await page.goto('https://google.com');
  try {
    await rejectCookies.waitFor({ timeout: 2000 });
    await page.getByRole('button', { name: 'Reject all' }).click();
  } catch (error) {
    console.log('No cookies to reject');
  }
  await page.getByLabel('Search', { exact: true }).first().click();
  await page.getByLabel('Search', { exact: true }).first().fill(text);
  await page.getByRole('button', { name: 'Google Search' }).first().click();

  await page.waitForLoadState();

  const linkTexts = await links.allInnerTexts();

  let hrefList = await Promise.all(
    (
      await links.locator('xpath=..').all()
    ).map(async (anchor) => (await anchor.getAttribute('href')) || '')
  );
  //avoid link previews
  hrefList = hrefList.map((value) => '<' + value + '>');

  const combined: string[] = linkTexts.map((value, index) => value + ' - ' + hrefList[index]);

  browser.close();
  return combined;
}

export async function findYoutubeAudioByText(text: string) {
  let videoUrl;
  try {
    text = text.replace(/ /g, '+');
    const { page, browser } = await getPageAndBrowser();
    const rejectCookies = page.getByLabel('Reject the use of cookies and');
    const videosTab = page.getByRole('tab', { name: 'Videos' });

    const youtubeBaseUrl = 'https://www.youtube.com';
    const youtubeUrl = `${youtubeBaseUrl}/results?search_query=${text}`;

    await page.goto(youtubeUrl);
    try {
      await rejectCookies.waitFor({ timeout: 2000 });
      await rejectCookies.click();
    } catch (error) {
      console.log('No cookies to reject');
    }

    if (!(await videosTab.isVisible())) {
      browser.close();
      return undefined;
    }

    await videosTab.click();
    await page.waitForLoadState();
    const path = await page
      .locator("//*[@id='page-manager'] //*[@id='thumbnail']")
      .first()
      .getAttribute('href');
    if (path) {
      videoUrl = youtubeBaseUrl + path;
    } else {
      return undefined;
    }

    browser.close();
  } catch (error) {
    console.error(error);
  }

  return videoUrl;
}

async function getPageAndBrowser() {
  const browser = await playwright['chromium'].launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { page, browser };
}
