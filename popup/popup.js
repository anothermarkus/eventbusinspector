class PopupEventTracker {
  constructor() {
    this.tracking = false; // To track whether events are being tracked
    this.trackButton = null;
    this.addTabButton = null;
    this.eventBusContainer = null;
    this.selectedEventBuses = []; // To store the selected event buses
  }

  init() {
    // DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', () => {
      this.trackButton = document.getElementById('trackButton');
      this.addTabButton = document.getElementById('openTabEvents');
      this.eventBusContainer = document.getElementById('eventBusList');

      // Retrieve stored state for event buses, selected event buses, and tracking status
      chrome.storage.local.get(['selectedEventBuses', 'tracking', 'eventBuses', 'isScriptInjected'], (data) => {
        const eventBuses = data.eventBuses || [];
        this.selectedEventBuses = data.selectedEventBuses || [];

        // Update the event bus list (render checkboxes)
        this.updateEventBusList(eventBuses);

        // Restore selected checkboxes based on saved state
        document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
          if (this.selectedEventBuses.includes(checkbox.value)) {
            checkbox.checked = true;
          }
        });

        // Update tracking button state
        if (data.tracking !== undefined) {
          this.tracking = data.tracking;
          this.trackButton.textContent = this.tracking ? "Stop Tracking Events" : "Track Events";
        }

        // If script hasn't been injected, inject it now
        if (!data.isScriptInjected) {
          chrome.runtime.sendMessage({ action: 'injectScript' }, () => {
            // After script is injected, set the flag to prevent future injections
            chrome.storage.local.set({ isScriptInjected: true });
          });
        }
      });

      // Handle the "open tab events" button click
      this.addTabButton.addEventListener('click', () => {
        this.openNewTab();
      });

      if (!this.trackButton) {
        console.error("Track button not found");
      } else {
        // Handle the "track events" button click
        this.trackButton.addEventListener('click', () => this.toggleTracking());
      }

      // Listen for event buses found or updated
      chrome.runtime.onMessage.addListener((message) => this.handleMessages(message));
    });
  }

  openNewTab() {
    chrome.runtime.sendMessage({ action: 'openNewTab' });
  }

  toggleTracking() {
    // Collect all checked event bus names
    const selectedEventBuses = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach((checkbox) => {
      selectedEventBuses.push(checkbox.value);
    });
  
    // If no event buses are selected, show an alert and exit early
    if (selectedEventBuses.length === 0 && !this.tracking) {
      alert("Please select at least one event bus to track");
      return;
    }
  
    // Toggle the tracking state
    this.tracking = !this.tracking;
  
    // Update the track button text based on the tracking state
    this.trackButton.textContent = this.tracking ? "Stop Tracking Events" : "Track Events";
  
    // Store the updated state in chrome storage
    chrome.storage.local.set({ selectedEventBuses, tracking: this.tracking }, () => {
      console.log('State saved!');
    });
  
    // Send the message to background.js to start/stop tracking events
    chrome.runtime.sendMessage({
      action: this.tracking ? 'trackEventBuses' : 'stopTrackingEvents',
      eventBuses: selectedEventBuses
    });
  }
  

  handleMessages(message) {
    if (message.action === 'eventBusesFound') {
      this.updateEventBusList(message.eventBuses);
    }
  }

  // Update the popup UI with the list of event buses
  updateEventBusList(eventBuses) {
    this.eventBusContainer.innerHTML = ''; // Clear existing content

    // Store event buses in chrome storage
    chrome.storage.local.set({ eventBuses });

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

      // Add event listener to update selectedEventBuses on checkbox change
      checkbox.addEventListener('change', (event) => {
        if (event.target.checked) {
          this.selectedEventBuses.push(event.target.value);
        } else {
          const index = this.selectedEventBuses.indexOf(event.target.value);
          if (index > -1) {
            this.selectedEventBuses.splice(index, 1);
          }
        }

        // Update selectedEventBuses in storage whenever it changes
        chrome.storage.local.set({ selectedEventBuses: this.selectedEventBuses });
      });

      this.eventBusContainer.appendChild(listItem);
    });
  }
}

// Instantiate the class and initialize
const popupEventTracker = new PopupEventTracker();
popupEventTracker.init();
