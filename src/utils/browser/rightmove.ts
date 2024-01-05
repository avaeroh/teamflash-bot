import playwright from 'playwright';
import { getPageAndBrowser } from './browserUtils';

const areasOfInterest = ['london bridge'];

export type PropertyInfo = {
  title?: string | undefined;
  price?: string | undefined;
  description: Description;
  commute?: Commute[];
};
type Commute = {
  location: string;
  drivingDuration?: string | undefined | null;
  publicTransportDuration?: string | undefined | null;
  walkingDuration?: string | undefined | null;
  cyclingDuration?: string | undefined | null;
};
type Description = {
  propertyType: string | undefined | null;
  bedrooms: string | undefined | null;
  bathrooms: string | undefined | null;
  size: string | undefined | null;
};

export async function getRightMovePropertyInfo(url: string) {
  const { page: rightMovePage, browser } = await getPageAndBrowser();
  await rightMovePage.goto(url);

  let propertyInfo: PropertyInfo = {
    description: {
      propertyType: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      size: undefined,
    },
    commute: [{ location: 'London Bridge' }],
  };

  const rightMoveCookieModal = rightMovePage.locator('[id="onetrust-reject-all-handler"]');
  try {
    rightMoveCookieModal.waitFor({ timeout: 2000 });
    rightMoveCookieModal.click();
  } catch (error) {
    console.log('No cookies to reject');
  }

  propertyInfo.title = await rightMovePage.locator('h1').innerText();
  propertyInfo.price = await rightMovePage
    .locator("//article //span[text()[contains(.,'£')]]")
    .innerText();

  //propety description
  propertyInfo.description.propertyType = await getPropertyDescription(
    rightMovePage,
    '[data-testid="svg-house"]'
  );
  propertyInfo.description.bedrooms = await getPropertyDescription(
    rightMovePage,
    '[data-testid="svg-bed"]'
  );

  propertyInfo.description.bathrooms = await getPropertyDescription(
    rightMovePage,
    '[data-testid="svg-bathroom"]'
  );
  propertyInfo.description.size = await getPropertyDescription(
    rightMovePage,
    '[data-testid="svg-floorplan"]'
  );

  //enhancement info
  await rightMovePage.locator("//a[contains(@href, '#/streetView')]").click();
  const addressLocator = rightMovePage.locator(
    "//div[contains(@class, 'gm-iv-address-description')]"
  );
  await addressLocator.waitFor();
  const propertyAddress = (await addressLocator.textContent())?.trim();
  //get commute info if address is available
  if (propertyAddress) {
    try {
      const mapsPage = await browser.newPage();
      const rejectCookiesButton = mapsPage
        .locator("//span[text()[contains(.,'Reject all')]]")
        .first();
      await mapsPage.goto('https://www.google.co.uk/maps/');
      await mapsPage.waitForLoadState();
      if (await rejectCookiesButton.isVisible()) {
        await rejectCookiesButton.click();
      }
      await mapsPage.locator("//button[contains(@aria-label, 'Directions')]").click();
      if (propertyInfo.commute) {
        let commuteInfo: Commute[] = [];
        for (const commute of propertyInfo.commute) {
          commuteInfo.push(await getCommuteInfo(mapsPage, propertyAddress, commute.location));
        }
        propertyInfo.commute = commuteInfo;
      }
      mapsPage.close();
    } catch (error) {
      console.error('could not retrieve commute info');
      console.error(error);
    }
  }
  browser.close();
  return propertyInfo;
}

async function getCommuteInfo(
  mapsPage: playwright.Page,
  fullAddress: string,
  areaOfInterest: string
): Promise<Commute> {
  const fromDestinationLocator = mapsPage.locator("//div[@id='directions-searchbox-0'] //input");
  const toDestionationLocator = mapsPage.locator("//div[@id='directions-searchbox-1'] //input");

  await fromDestinationLocator.waitFor();
  await fromDestinationLocator.fill(fullAddress);
  await mapsPage.keyboard.press('Enter');
  await toDestionationLocator.fill(areaOfInterest);
  //   await toDestionationLocator.fill(areaOfInterest);
  await mapsPage.keyboard.press('Enter');
  //wait for element that only appears when search completes
  await mapsPage.locator("//h1[@id='section-directions-trip-title-0']").waitFor({ timeout: 2000 });

  //get durations
  const drivingDurationLocator = await getDurationLocator(mapsPage, 'Driving');
  await drivingDurationLocator.waitFor();

  const publicTransportDuration = await getDurationLocator(mapsPage, 'Public transport');
  const walkingDuration = await getDurationLocator(mapsPage, 'Walking');
  const cyclingDuration = await getDurationLocator(mapsPage, 'Cycling');
  await fromDestinationLocator.clear();
  await toDestionationLocator.clear();

  return {
    location: areaOfInterest,
    drivingDuration: await drivingDurationLocator.textContent(),
    publicTransportDuration: await publicTransportDuration.textContent(),
    walkingDuration: await walkingDuration.textContent(),
    cyclingDuration: await cyclingDuration.textContent(),
  };
}

async function getPropertyDescription(page: playwright.Page, locator: string) {
  const propertyDescriptionLocator = page.locator('[data-test="infoReel"]');
  return propertyDescriptionLocator
    .locator(locator)
    .locator('xpath=..')
    .locator('xpath=..')
    .textContent();
}

async function getDurationLocator(mapsPage: playwright.Page, ariaLabel: string) {
  return mapsPage.locator(`//img[contains(@aria-label, '${ariaLabel}')]`).locator('xpath=..');
}
