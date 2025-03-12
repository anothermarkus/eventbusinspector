// injectedScript.js
(() => {
    let eventBuses = [];
  
    // Look for globalEventBus and other event buses in the page's window
    if (window.globalEventBus) {
      eventBuses.push('globalEventBus');
    } else {
      chrome.runtime.sendMessage({ action: 'NoGlobalEventBus', bus: window.globalEventBus });
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
  })();
  