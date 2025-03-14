class ContentScriptHandler {
  constructor() {
    this.initialize();
  }

  // Method to initialize the content script and set up listeners
  initialize() {
    console.log("content.js has loaded");

    // Listen for messages from background or popup
    this.setupMessageListener();

    // Listen for custom events from the injected script
    this.setupCustomEventListener();
  }

  // Set up the message listener to handle communication from background or popup
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Content.js: got message", message);
      this.handleAction(message.action, message.eventBuses);
    });
  }

  // Handle the action types by dispatching corresponding events
  handleAction(action, eventBuses) {
    switch (action) {
      case 'trackEventBuses':
        this.dispatchCustomEvent('trackEventBuses', eventBuses);
        break;
      case 'stopTrackingEvents':
        this.dispatchCustomEvent('stopTrackingEvents');
        break;
      default:
        console.warn(`Unknown action received: ${action}`);
    }
  }

  // Dispatch a custom event to the injected script
  // 
  // content.js -> injectedScript.js
  dispatchCustomEvent(action, eventBuses = []) {
    console.log(`Content.js: forwarding ${action} to injectedScript.js`);

    const event = new CustomEvent("FromContentScript", {
      detail: { action, eventBuses }
    });

    window.dispatchEvent(event);
  }

  // Set up the custom event listener to handle events from the injected script
  setupCustomEventListener() {
    window.addEventListener("InjectionEventToContentLayer", (evt) => this.handleInjectionEventToContentLayer(evt), false);
  }

  // Handle the InjectionEventToContentLayer and forward to popup.js
  handleInjectionEventToContentLayer(evt) {
    console.log("content.js: Got InjectionEventToContentLayer message", evt);
    chrome.runtime.sendMessage(evt.detail); // Forward to popup.js
  }
}

// Instantiate and initialize the ContentScriptHandler class
new ContentScriptHandler();
