class BackgroundHandler {
  constructor() {
    this.eventDisplayTabId = null;  // To track the event display tab
    this.initializeListeners();
  }

  // Initialize the listeners
  initializeListeners() {
    chrome.runtime.onInstalled.addListener(this.onInstalled);

    // Handle all messages through this method
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
  }

  // Handle the onInstalled event
  onInstalled() {
    console.log("Event Tracker Extension Installed");
  }

  // Handle messages sent to background.js
  onMessage(message, sender, sendResponse) {
    console.log("background.js: Got a message", message);

    switch (message.action) {
      case 'injectScript':
        this.injectScript();
        break;

      case 'trackEventBuses':
        this.forwardTrackEventBuses(message);
        break;

      case 'stopTrackingEvents':
        this.forwardStopTrackingEvents(message);
        break;

      case 'logEvent':
        this.handleLogEvent(message, sendResponse);
        break;

      case 'openNewTab':
        this.openNewTab();
        break;

      case 'updateEventList':
        this.updateEventList(message);
        break;

      default:
        console.warn("Unknown action:", message.action);
    }

    // Return true for asynchronous response
    return true;
  }

  // Inject the script into the active tab
  injectScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        console.log("Active tabId:", tabId);

        const injectedsrc = chrome.runtime.getURL('injectedScript.js');  // Inline this part here
        console.log("Injected Src", injectedsrc);

        chrome.scripting.executeScript({
          target: { tabId },
          func: function (src) {
            const script = document.createElement('script');
            script.src = src;  // Set the script source to the chrome-extension URL
            document.documentElement.appendChild(script);

            script.onload = () => {
              console.log("Injected script loaded successfully!");
            };
            script.onerror = (error) => {
              console.error("Failed to load injected script:", error);
            };
          },
          args: [injectedsrc],  // Pass the inline script URL as an argument to the function
        });
      } else {
        console.error("No active tab found.");
      }
    });
  }

  // Forward the 'trackEventBuses' message to the content script in the active tab
  forwardTrackEventBuses(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {
          action: 'trackEventBuses',
          eventBuses: message.eventBuses,
        });
        console.log("Sent trackEventBuses message to content script.");
      } else {
        console.error("Active tab not found, cannot forward trackEventBuses.");
      }
    });
  }

  // Forward the 'stopTrackingEvents' message to the content script in the active tab
  forwardStopTrackingEvents(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {
          action: 'stopTrackingEvents',
          eventBuses: message.eventBuses,
        });
        console.log("Sent stopTrackingEvents message to content script.");
      } else {
        console.error("Active tab not found, cannot forward stopTrackingEvents.");
      }
    });
  }

  // Handle logging events and store them
  handleLogEvent(message, sendResponse) {
    const { type, eventBusName, eventKey, data } = message.data;

    // Handle event logging or processing here
    console.log(`Received event:`, { type, eventBusName, eventKey, data });

    chrome.storage.local.get({ events: [] }, (result) => {
      const events = result.events;
      events.push({
        type,
        eventBusName,
        eventKey,
        data,
        timestamp: new Date().toISOString(),
      });

      // Save the events back to local storage
      chrome.storage.local.set({ events }, () => {
        console.log('Event logged successfully!');
      });
    });

    // Send a response back if needed
    sendResponse({ success: true });
  }

  // Open a new tab with a specific URL (eventDisplay.html)
  openNewTab() {
    chrome.tabs.create({ url: 'eventDisplay.html' }, (newTab) => {
      this.eventDisplayTabId = newTab.id;
      console.log('New tab opened: ', this.eventDisplayTabId);
    });
  }

  // Forward the event list to the event display tab
  updateEventList(message) {
    console.log("background.js: Received and forwarding updateEventList message to eventDisplay.js");

    if (this.eventDisplayTabId !== null) {
      chrome.tabs.sendMessage(this.eventDisplayTabId, {
        action: 'updateEventList',
        event: message.event,
      });
      console.log("Event list forwarded to eventDisplay tab");
    }
  }
}

// Initialize the background handler class
new BackgroundHandler();
