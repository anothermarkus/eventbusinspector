console.log("content.js has loaded");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content.js: got message",message);

  if (message.action === 'trackEventBuses') {
    console.log("Content.js: got message to track event busses forwarding to injectedScript.js");
    const selectedEventBuses = message.eventBuses;

    var event = new CustomEvent("FromContentScript", {detail: { action: 'trackEventBuses', eventBuses: selectedEventBuses }});
    window.dispatchEvent(event);

    //trackEventBusesInPage(selectedEventBuses);
  
  }

  if (message.action === 'stopTrackingEvents') {
    console.log("Content.js: got message to stop tracking event busses forwarding to injectedScript.js");
    const { eventBuses } = message;
    // Start tracking event buses
    
    var event = new CustomEvent("FromContentScript", {detail: { action: 'stopTrackingEvents' }});
    window.dispatchEvent(event);
  
  }

});


  
// Injected Script -> Content.js -> Popup.js -> updateEventBusList()
window.addEventListener("PassToContent", function(evt) {
  console.log("content.js: Got PassToContent message",evt);
  chrome.runtime.sendMessage(evt.detail); // This should pass it to popup.js (or background.js if necessary)
}, false);


