// content.js
function trackEventBuses(eventBuses) {
  eventBuses.forEach(eventBusName => {
    const eventBus = window[eventBusName];

    if (eventBus && (typeof eventBus.publishEvent === 'function' || typeof eventBus.publish === 'function') && typeof eventBus.subscribeToEvent === 'function') {
      console.log(`Tracking event bus: ${eventBusName}`);
      
      // Capture and log the publishEvent method
      if (eventBus.publishEvent) {
        const originalPublishEvent = eventBus.publishEvent;
        eventBus.publishEvent = function(eventKey, data) {
          console.log(`Event Published on ${eventBusName}: ${eventKey}`, data);
          chrome.runtime.sendMessage({
            action: 'logEvent',
            data: { type: 'publish', eventBusName, eventKey, data }
          });
          return originalPublishEvent.apply(eventBus, arguments);
        };
      } else if (eventBus.publish) {
        const originalPublish = eventBus.publish;
        eventBus.publish = function(eventKey, data) {
          console.log(`Event Published on ${eventBusName}: ${eventKey}`, data);
          chrome.runtime.sendMessage({
            action: 'logEvent',
            data: { type: 'publish', eventBusName, eventKey, data }
          });
          return originalPublish.apply(eventBus, arguments);
        };
      }

      // Capture and log the subscribeToEvent method
      const originalSubscribe = eventBus.subscribeToEvent;
      eventBus.subscribeToEvent = function(eventKey) {
        console.log(`Event Subscribed on ${eventBusName}: ${eventKey}`);
        chrome.runtime.sendMessage({
          action: 'logEvent',
          data: { type: 'subscribe', eventBusName, eventKey }
        });
        return originalSubscribe.apply(eventBus, arguments);
      };
    } else {
      console.log(`Event bus ${eventBusName} not found or invalid.`);
    }
  });
}
