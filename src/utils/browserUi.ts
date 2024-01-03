import playwright from 'playwright';

export async function googleQuery(text: string) {
  const browser = await playwright['chromium'].launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

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

  await browser.close();
  return combined;
}
