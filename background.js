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

        const injectedsrc = chrome.runtime.getURL('injectedScript.js'); // Get the correct URL for injectedScript.js
        console.log("Injected Src", injectedsrc);

        // Inject an external script into the page by creating a script element with the correct src
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: function (src) {
            const script = document.createElement('script');
            script.src = src; // Set the script source to the chrome-extension URL
            document.documentElement.appendChild(script); // Append the script to the document
            script.onload = () => {
              console.log("Injected script loaded successfully!");
            };
            script.onerror = (error) => {
              console.error("Failed to load injected script:", error);
            };
          },
          args: [injectedsrc] // Pass the chrome-extension URL as an argument to the function
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
