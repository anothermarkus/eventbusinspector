chrome.runtime.onInstalled.addListener(() => {
  console.log("Event Tracker Extension Installed");
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectScript') {
    // Query for the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        const tabId = tabs[0].id; // Get the ID of the active tab
        console.log("Active tabId:", tabId);

        // Execute the script in the active tab
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: function () {
            let eventBuses = [];

            // Look for globalEventBus and other event buses in the page's window
            if (window.globalEventBus) {
              eventBuses.push('globalEventBus');
            }

            // Check all global variables for event buses
            for (let prop in window) {
              if (
                window[prop] &&
                typeof window[prop] === 'object' &&
                (window[prop].publishEvent || window[prop].publish || window[prop].subscribeToEvent)
              ) {
                eventBuses.push(prop);
              }
            }

            console.log("Event buses detected: ", eventBuses);

            // Send back the event buses found to the popup.js
            chrome.runtime.sendMessage({ action: 'eventBusesFound', eventBuses: eventBuses });
          }
        });
      } else {
        console.error("No active tab found.");
      }
    });
  }

  if (message.action === 'trackEventBuses') {
    const selectedEventBuses = message.eventBuses;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;

        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: trackEventBusesInPage,
          args: [selectedEventBuses]
        });
      } else {
        console.error("No active tab found.");
      }
    });
  }

  return true;
});
