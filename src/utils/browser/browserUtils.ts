import playwright from 'playwright';

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

export async function findYoutubeAudioByText(text: string): Promise<string | undefined> {
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

    //try to click videos tab in the first instance, but if it doesn't exist, just continue
    try {
      await videosTab.waitFor({ timeout: 2000 });
      await videosTab.click();
    } catch (error) {
      console.log('No videos tab to click');
    }

    const videoUrlLocator = page.locator("//*[@id='page-manager'] //*[@id='thumbnail']").first();

    try {
      videoUrlLocator.waitFor({ timeout: 2000 });
    } catch (error) {
      console.error('No video found');
      return;
    }

    const path = await videoUrlLocator.getAttribute('href');
    console.log(`Video href: ${path}`);

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

export async function getPageAndBrowser() {
  const browser = await playwright['chromium'].launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  return { page, browser };
}
