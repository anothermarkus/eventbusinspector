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
        console.warn("Unknown action:", JSON.stringify(message));
    }

    // Return true for asynchronous response
    return true;
  }

  // Inject the script into the active tab (if it hasn't been injected already)
  injectScript() {
    // First, check if a tab has already been injected
    chrome.storage.local.get(['injectedTabId'], (result) => {
      const injectedTabId = result.injectedTabId;

      // If there is already a tab ID stored in the storage, we skip injection if it's the same tab
      if (injectedTabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0 && tabs[0].id === injectedTabId) {
            console.log("Script already injected in this tab, skipping.");
            return;
          }
        });
      }

      // Proceed with injecting the script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const tabId = tabs[0].id;

          const injectedsrc = chrome.runtime.getURL('injected/injectedScript.js');

          // Inline injection of the script
          chrome.scripting.executeScript({
            target: { tabId },
            func: function(src) {
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
            args: [injectedsrc],  // Pass the script URL as an argument
          });

          // Store the tab ID in storage to avoid re-injection
          chrome.storage.local.set({ injectedTabId: tabId }, () => {
            console.log("Script injected and tab marked.");
          });
        } else {
          console.error("No active tab found.");
        }
      });
    });
  }

  // Forward the 'trackEventBuses' message to the content script in the active tab
  forwardTrackEventBuses(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

      if (!(tabs.length > 0)) {
        console.error("Active tab not found, cannot forward trackEventBuses.");
        return;
      }
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {
          action: 'trackEventBuses',
          eventBuses: message.eventBuses,
        });

    });
  }

  // Forward the 'stopTrackingEvents' message to the content script in the active tab
  forwardStopTrackingEvents(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

      if (!(tabs.length > 0)) {
        console.error("Active tab not found, cannot forward stopTrackingEvents.");
        return;
      }

        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {
          action: 'stopTrackingEvents',
          eventBuses: message.eventBuses,
        });
    });
  }

  // Handle logging events and store them
  handleLogEvent(message, sendResponse) {
    const { type, eventBusName, eventKey, data } = message.data;

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
    chrome.tabs.create({ url: 'eventDisplay/eventDisplay.html' }, (newTab) => {
      this.eventDisplayTabId = newTab.id;
      console.log('New tab opened: ', this.eventDisplayTabId);
    });
  }

  // Forward the event list to the event display tab
  updateEventList(message) {
    if (this.eventDisplayTabId !== null) {
      chrome.tabs.sendMessage(this.eventDisplayTabId, {
        action: 'updateEventList',
        event: message.event,
      });
    }
  }
}

// Initialize the background handler class
new BackgroundHandler();
