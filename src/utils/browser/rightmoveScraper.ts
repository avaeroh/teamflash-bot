import playwright from 'playwright-core';
import { getPageAndBrowser } from './browserUtils';
import { sleep } from '../debugHelper';

export type PropertyInfo = {
  url?: string;
  title?: string | undefined | null;
  price?: string | undefined | null;
  internet?: string | undefined | null;
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

export async function getRightMovePropertyInfo(url: string, optionalLocations: (string | null)[]) {
  const { page: rightMovePage, browser } = await getPageAndBrowser();
  await rightMovePage.goto(url);

  let propertyInfo: PropertyInfo = {
    description: {
      propertyType: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      size: undefined,
    },
    commute: [],
  };

  //handle optional locations
  optionalLocations?.forEach((optionalLocation) => {
    optionalLocation ? propertyInfo.commute?.push({ location: optionalLocation }) : null;
  });

  const rightMoveCookieModal = rightMovePage.locator('[id="onetrust-reject-all-handler"]');
  try {
    rightMoveCookieModal.waitFor({ timeout: 2000 });
    rightMoveCookieModal.click();
  } catch (error) {
    console.log('No cookies to reject');
  }

  //get basic info
  propertyInfo.title = await rightMovePage.locator('h1').textContent();
  propertyInfo.price = await rightMovePage
    .locator("//article //span[text()[contains(.,'£')]]")
    .textContent();

  //get internet info
  await rightMovePage.locator("//div[@data-gtm-name='broadband-checker']").click();
  const internetLocator = rightMovePage.locator(
    "//div[@data-testid='DTbroadband-widget'] //div[@class] //div"
  );
  await internetLocator.first().waitFor();

  propertyInfo.internet = (await internetLocator.allTextContents())
    .filter((element) => !element.toLowerCase().includes('average download speed'))
    .join(' - ')
    .trim();

  //get propety description info
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

  //get commute times
  if (propertyInfo.commute) {
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
        // mapsPage.close();
      } catch (error) {
        console.error('could not retrieve commute info');
        console.error(error);
      }
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
  await mapsPage.keyboard.press('Enter');

  if (await mapsPage.locator(`//h2[contains(text(), "Google Maps can't find")]`).isVisible()) {
    return {
      location: `Commute error: ${areaOfInterest}`,
    };
  }
  //wait for element that only appears when search completes
  await mapsPage.locator("//h1[@id='section-directions-trip-title-0']").waitFor({ timeout: 2000 });

  //get durations
  const drivingDurationLocator = await getDurationLocator(mapsPage, 'Driving');
  await drivingDurationLocator.waitFor();

  const publicTransportDuration = await getDurationLocator(mapsPage, 'Public transport');
  const walkingDuration = await getDurationLocator(mapsPage, 'Walking');
  const cyclingDuration = await getDurationLocator(mapsPage, 'Cycling');

  //update location names to provide accurate feedback
  const location = (await toDestionationLocator.getAttribute('aria-label'))?.split(
    'Destination '
  )[1];
  //no other easy way to wait for URL to update
  await sleep(1);
  const mapUrl = mapsPage.url();
  await fromDestinationLocator.clear();
  await toDestionationLocator.clear();

  return {
    location: `[${location}](<${mapUrl}>)` ?? areaOfInterest,
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
