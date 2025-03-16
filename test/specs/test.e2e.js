const assert = require('assert');

describe('Chrome Extension Test', () => {
  it('Should Render the Popup and open the Events page when clicked', async () => {
    // Open the chrome://extensions/ page
    await browser.url('chrome://extensions/');

    // Wait for the "Details" button to be visible and click it
    const detailsButton = await $('#detailsButton'); // Use the selector directly
    await detailsButton.waitForDisplayed({ timeout: 5000 }); // Wait for the Details button to be displayed
    await detailsButton.click(); // Click the Details button to open the details page

    // Now that the details page is open, extract the extension ID from the URL
    const extensionId = await browser.getUrl().then(url => {
      // The extension ID is part of the URL after ?id=
      const match = url.match(/id=([a-z0-9]{32})/);
      return match ? match[1] : null;
    });

    assert(extensionId, 'Could not find the extension ID in the URL'); // Ensure we found the extension ID
    console.log('Extension ID:', extensionId);

    // Open the extension's popup page using the dynamically fetched extension ID
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    const popupWindow = await browser.newWindow(popupUrl); // Open the extension popup

    // Wait for the button with ID '#openTabEvents' to appear and then click it
    const button = await $('#openTabEvents'); // Get the button element by ID
    await button.waitForDisplayed({ timeout: 5000 }); // Wait for the button to be displayed
    console.log('Button found, clicking...');
    await button.click(); // Click the button

    // Now, wait for the new window to open and validate the URL
    await browser.waitUntil(async () => {
      const windows = await browser.getWindowHandles(); // Get all window handles
      const newWindow = windows[windows.length - 1]; // Switch to the last window (the newly opened one)
      await browser.switchToWindow(newWindow); // Switch to the new window
      const currentUrl = await browser.getUrl(); // Get the URL of the new window
      console.log('Current window URL:', currentUrl); // Log the current URL
      return currentUrl.includes('eventDisplay/eventDisplay.html'); // Check if the new window is the event display page
    }, {
      timeout: 5000, // Timeout after 5 seconds
      timeoutMsg: 'Event display page did not load correctly'
    });

    const exportButton = await $('#exportButton'); // Get the button element by ID
    const isButtonDisplayed = await button.isDisplayed();

    //TODO
    //assert.strictEqual(isButtonDisplayed, true, 'The "Export" button is not displayed');

  });
});
