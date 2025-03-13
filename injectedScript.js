// injectedScript.js
(() => {
    let eventBuses = [];
  
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
 
    // we are not within the context of chrome extension, we need to communicate
    // in this indirect way
    // 
    //  injectedScript.js  
    //  |
    //  | window.postMessage();  // or window.dispatch()   <-- WE ARE HERE
    //  |
    //  V
    // content.js //window.addEventListener("message", callback, false);
    //  |
    //  | chrome.runtime.sendMessage();
    //  |
    //  V
    // background.js // chrome.runtime.onMessage.addListener((message, sender, sendResponse)
 
    var event = new CustomEvent("PassToContent", {detail: { action: 'eventBusesFound', eventBuses: eventBuses }});

    window.dispatchEvent(event);

  })();
  