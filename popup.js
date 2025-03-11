document.addEventListener('DOMContentLoaded', function () {
  console.log("Popup DOM is fully loaded");  // Add a log to check if the DOM is loaded
  
  const trackButton = document.getElementById('trackButton');
  
  if (trackButton) {
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
      } else {
        console.log("Selected event buses to track:", selectedEventBuses);

        // Send the selected event buses to background.js
        chrome.runtime.sendMessage({ 
          action: 'trackEventBuses', 
          eventBuses: selectedEventBuses 
        });
      }
    });
  } else {
    console.error("Track button not found"); // Log error if trackButton is not found
  }

  // Inject script into the active tab to find event buses
  chrome.runtime.sendMessage({ action: 'injectScript' });

  // Listen for the event buses found
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'eventBusesFound') {
      console.log("Event buses found:", message.eventBuses);
      updateEventBusList(message.eventBuses);
    }
  });

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
