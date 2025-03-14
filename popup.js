document.addEventListener('DOMContentLoaded', function () {
  console.log("Popup DOM is fully loaded");  // Add a log to check if the DOM is loaded
  
  const trackButton = document.getElementById('trackButton');
  const addTabButton = document.getElementById('openTabEvents');

  addTabButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openNewTab' });  // sends to background.js
  });

  let tracking = false;  // Boolean to track whether events are being tracked or not
  
  if (!trackButton) {
    console.error("Track button not found"); // Log error if trackButton is not found
  }

    console.log("Track button found"); // Log if trackButton is found
    trackButton.addEventListener('click', () => {
      const selectedEventBuses = [];
      
      // Collect all checked event bus names
      document.querySelectorAll('input[type="checkbox"]:checked').forEach((checkbox) => {
        selectedEventBuses.push(checkbox.value);
      });

      // If no event bus is selected, show a warning
      if (selectedEventBuses.length === 0) {
        alert("Please select at least one event bus to track");
        return;
      }
        
      console.log("Selected event buses to track:", selectedEventBuses);

      if (!tracking) {
        console.log("Starting to track event buses");
        
        chrome.runtime.sendMessage({ 
          action: 'trackEventBuses', 
          eventBuses: selectedEventBuses 
        });

          // Update button state to indicate it's being pressed
          trackButton.textContent = "Stop Tracking Events";  // Update the button label
          tracking = true;  // Set the tracking state to true
          return;

      }

      // -->  popup.js
      console.log("popup.js: sending message to content.js");
      chrome.runtime.sendMessage({ 
        action: 'stopTrackingEvents', 
        eventBuses: selectedEventBuses 
      });

      // Update button state to indicate it's no longer pressed
      trackButton.textContent = "Track Events";  // Revert the button label
      tracking = false;  // Set the tracking state to false
          
      
    });
 

  // Use backgroud.js to inject script into the active tab to find event buses
  chrome.runtime.sendMessage({ action: 'injectScript' });






  // Forwarded from content.jss
  // Listen for the event buses found
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'eventBusesFound') {
      console.log("popup.js: Event buses found:", message.eventBuses);
      updateEventBusList(message.eventBuses);
    }

    if (message.action === 'updateEventList') {
      console.log("popup.js: Bus Event Happened!:", message.eventBuses);
      updateEventList(message);
    }

  });

  function updateEventList(){
    //TODO Forward this to background.js
  }

  // Update the popup UI with the list of event buses
  function updateEventBusList(eventBuses) {
    const eventBusContainer = document.getElementById('eventBusList');
    
    // Clear existing content
    eventBusContainer.innerHTML = '';

    // Create checkboxes for each event bus
    eventBuses.forEach(eventBus => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = eventBus;
      checkbox.id = eventBus;

      const label = document.createElement('label');
      label.setAttribute('for', eventBus);
      label.textContent = eventBus;

      const listItem = document.createElement('li');
      listItem.appendChild(checkbox);
      listItem.appendChild(label);

      eventBusContainer.appendChild(listItem);
    });
  }
});

 
    // we are not within the context of chrome extension, we need to communicate
    // in this indirect way
    // 
    //  injectedScript.js
    //  |
    //  | window.postMessage();  // or window.dispatch()
    //  |
    //  V
    // content.js //window.addEventListener("message", callback, false);   <-- WE ARE HERE
    //  |
    //  | chrome.runtime.sendMessage(); // can send to background.js if necessary
    //  |
    //  V
     // background.js 
    //  window.addEventListener("PassToContent", function(evt) {
    //   console.log("popup.js got the PassToContent message",evt);
    //   if (evt.detail && evt.detail.message && evt.detail.message){
    //       const message = evt.detail.message;
    //   } 
      
    //   if (message.action === 'eventBusesFound'){
    //     updateEventBusList(message.eventBuses);
    //   }

    //   //chrome.runtime.sendMessage(evt.detail); // however, no need to propagate again
    // }, false);
    