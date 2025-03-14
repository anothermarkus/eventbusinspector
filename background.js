

var eventDisplayTabId;

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

  // if (message.action === 'trackEventBuses') {
  //   const selectedEventBuses = message.eventBuses;

  //   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  //     if (tabs.length > 0) {
  //       const tabId = tabs[0].id;

  //       chrome.scripting.executeScript({
  //         target: { tabId: tabId },
  //         func: trackEventBusesInPage,
  //         args: [selectedEventBuses]
  //       });
  //     } else {
  //       console.error("No active tab found.");
  //     }
  //   });
  // }

  return true;
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("background.js: Got a message", message);
  
  if (message.action === 'trackEventBuses') {
    console.log("background.js forwarding start message to content.js");
  
    // Find the active tab where content.js is running
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]){ console.log("Active tab not found cannot forward from background.js");  return; }
      const tabId = tabs[0].id; // Get the active tab's ID

      // Send the message to the content script in that tab
      chrome.tabs.sendMessage(tabId, {
        action: 'trackEventBuses',
        eventBuses: message.eventBuses
      });
    });
  }

  if (message.action === 'stopTrackingEvents') {
    console.log("background.js forwarding stop message to content.js");
  
    // Find the active tab where content.js is running
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]){ console.log("Active tab not found cannot forward from background.js");  return; }
      const tabId = tabs[0].id; // Get the active tab's ID

      // Send the message to the content script in that tab
      chrome.tabs.sendMessage(tabId, {
        action: 'stopTrackingEvents',
        eventBuses: message.eventBuses
      });
    });
  }

});


// background.js

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'logEvent') {
    const { type, eventBusName, eventKey, data } = message.data;
    
    // Handle event logging or processing here
    console.log(`Received event:`, { type, eventBusName, eventKey, data });

    // Example: You can save events in local storage or sync them to a server
    // If you're saving to storage:
    chrome.storage.local.get({ events: [] }, (result) => {
      const events = result.events;
      events.push({ type, eventBusName, eventKey, data, timestamp: new Date().toISOString() });

      // Save the events back to local storage
      chrome.storage.local.set({ events }, () => {
        console.log('Event logged successfully!');
      });
    });

    // Optionally, send a response back if needed
    sendResponse({ success: true });
  }

  // Return true if you want to send an asynchronous response
  return true;
});

// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openNewTab') {
    // Open a new tab and load a simple HTML page
    chrome.tabs.create({ url: 'eventDisplay.html' }, (newTab) => {
      eventDisplayTabId = newTab.Id
      console.log('New tab opened: ', eventDisplayId);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateEventList') {
    console.log("background.js: Received and forwarding updateventlist message to eventdisplay.js")
    // Forward this event to the newly opened tab (eventDisplay.html)
    if (eventDisplayTabId !== null) {
      chrome.tabs.sendMessage(eventDisplayTabId, {
        action: 'updateEventList',
        event: message.event
      });
    }
  }
});