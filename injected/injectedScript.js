
// injectedScript.js 
// This is injected through the background.js script into the DOM of the target page we have intended based on it's tabId
class EventBusTracker {
  constructor() {
    this.eventBuses = [];
    this.EVENT_ACTIONS = {
      EVENT_BUS_FOUND: 'eventBusesFound',
      TRACK_EVENT_BUSES: 'trackEventBuses',
      STOP_TRACKING_EVENTS: 'stopTrackingEvents',
      UPDATE_EVENT_LIST: 'updateEventList',
      PUBLISH: 'publish',
      SUBSCRIBE: 'subscribe',
    };
  }

  // Internal method to find all event buses
  detectEventBuses() {
    for (let prop in window) {
      if (
        window[prop] &&
        typeof window[prop] === 'object' &&
        (window[prop].publishEvent || window[prop].publish || window[prop].subscribeToEvent || window[prop].subscribe)
      ) {
        this.eventBuses.push(prop);
      }
    }
  }

  // Helper function to dispatch events to content script
  //
  // injected.js -> content.js 
  //
  dispatchCustomEvent(action, eventData) {
    const event = new CustomEvent("InjectionEventToContentLayer", {
      detail: { action, ...eventData },
    });
    window.dispatchEvent(event);
  }

  // Dispatch detected event buses to content script
  dispatchDetectedEventBuses() {
    this.dispatchCustomEvent(this.EVENT_ACTIONS.EVENT_BUS_FOUND, { eventBuses: this.eventBuses });
  }

  // Function to handle events from content script
  handleContentScriptEvent(event) {
    const { action, eventBuses } = event.detail || {};

    switch (action) {
      case this.EVENT_ACTIONS.TRACK_EVENT_BUSES:
        this.trackEventBusesInPage(eventBuses);
        break;
      case this.EVENT_ACTIONS.STOP_TRACKING_EVENTS:
        // TODO: Implement stop tracking functionality
        break;
      default:
        console.warn(`Unknown action received: ${action}`);
    }
  }

  // Helper function to log publish/subscribe events and dispatch to the content layer
  logEventBusAction(eventBusName, eventType, args) {
    const eventDetail = {
      action: this.EVENT_ACTIONS.UPDATE_EVENT_LIST,
      event: {
        type: eventType,
        eventBusName,
        eventKey: args[0],
        data: args[1],
      },
    };
    this.dispatchCustomEvent(this.EVENT_ACTIONS.UPDATE_EVENT_LIST, eventDetail);
  }

  // Function to wrap event bus methods for logging
  wrapMethod(eventBus, eventBusName, methodName, eventType) {
    if (eventBus[methodName]) {
      const originalMethod = eventBus[methodName];
      eventBus[methodName] = (...args) => {
        this.logEventBusAction(eventBusName, eventType, args);
        return originalMethod.apply(eventBus, args);
      };
    } else {
      console.warn(`Method ${methodName} not found on event bus: ${eventBusName}`);
    }
  }

  // Function to track event buses in the page
  trackEventBusesInPage(eventBuses) {
    eventBuses.forEach((eventBusName) => {
      const eventBus = window[eventBusName];
      if (
        !(eventBus &&
          (typeof eventBus.publishEvent === 'function' || typeof eventBus.publish === 'function') &&
          (typeof eventBus.subscribeToEvent === 'function' || typeof eventBus.subscribe === 'function'))
      ) {
        console.log(`Event bus ${eventBusName} not found or invalid.`);
        return;
      }
      // Wrap methods for publish/subscribe and log actions
      this.wrapMethod(eventBus, eventBusName, 'publishEvent', this.EVENT_ACTIONS.PUBLISH);
      this.wrapMethod(eventBus, eventBusName, 'publish', this.EVENT_ACTIONS.PUBLISH);
      this.wrapMethod(eventBus, eventBusName, 'subscribeToEvent', this.EVENT_ACTIONS.SUBSCRIBE);
      this.wrapMethod(eventBus, eventBusName, 'subscribe', this.EVENT_ACTIONS.SUBSCRIBE);
    });
  }

  // Initialize detection of event buses and setup event listeners
  initialize() {
    this.detectEventBuses();
    this.dispatchDetectedEventBuses();
    window.addEventListener('FromContentScript', (event) => this.handleContentScriptEvent(event));
  }
}

// Create a new instance of EventBusTracker and initialize it
const eventBusTracker = new EventBusTracker();
eventBusTracker.initialize();
