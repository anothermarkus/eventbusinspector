class PopupEventTracker {
  constructor() {
    this.tracking = false; // To track whether events are being tracked
    this.trackButton = null;
    this.addTabButton = null;
    this.eventBusContainer = null;
  }

  init() {
    // DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', () => {
      this.trackButton = document.getElementById('trackButton');
      this.addTabButton = document.getElementById('openTabEvents');
      this.eventBusContainer = document.getElementById('eventBusList');

      // Handle button actions
      this.addTabButton.addEventListener('click', () => {
        this.openNewTab();
      });

      if (!this.trackButton) {
        console.error("Track button not found");
      } else {
        this.trackButton.addEventListener('click', () => this.toggleTracking());
      }

      // Send message to background.js to inject the script into the active tab
      chrome.runtime.sendMessage({ action: 'injectScript' });

      // Listen for event buses found or update
      chrome.runtime.onMessage.addListener((message) => this.handleMessages(message));
    });
  }

  openNewTab() {
    chrome.runtime.sendMessage({ action: 'openNewTab' });
  }

  toggleTracking() {
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

    if (!this.tracking) {
      console.log("Starting to track event buses");

      chrome.runtime.sendMessage({
        action: 'trackEventBuses',
        eventBuses: selectedEventBuses
      });

      // Update button state to indicate it's being pressed
      this.trackButton.textContent = "Stop Tracking Events";
      this.tracking = true;
      return;
    } 

    chrome.runtime.sendMessage({
      action: 'stopTrackingEvents',
      eventBuses: selectedEventBuses
    });

    // Update button state to indicate it's no longer pressed
    this.trackButton.textContent = "Track Events";
    this.tracking = false;
    
  }

  handleMessages(message) {
    if (message.action === 'eventBusesFound') {
      this.updateEventBusList(message.eventBuses);
    }
  }

  // Update the popup UI with the list of event buses
  updateEventBusList(eventBuses) {
    this.eventBusContainer.innerHTML = ''; // Clear existing content

    // Create checkboxes for each event bus
    eventBuses.forEach((eventBus) => {
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

      this.eventBusContainer.appendChild(listItem);
    });
  }

 
}

// Instantiate the class and initialize
const popupEventTracker = new PopupEventTracker();
popupEventTracker.init();
