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

    window.addEventListener('FromContentScript', function(event) {
        // Handle the event and data sent from content script
        console.log('Received data from content script:', event.detail);
        // You can also handle the event here

        if (event && event.detail && event.detail.action === 'trackEventBuses'){
            trackEventBusesInPage(event.detail.eventBuses);
        }

        if (event && event.detail && event.detail.action === 'stopTrackingEvents'){
            //TODO
        }
        
    });


    function trackEventBusesInPage(eventBuses) {
        eventBuses.forEach(eventBusName => {
          const eventBus = window[eventBusName];
      
          if (eventBus && (typeof eventBus.publishEvent === 'function' || typeof eventBus.publish === 'function') 
            && (typeof eventBus.subscribeToEvent === 'function' || typeof eventBus.subscribe === 'function')) {
            console.log(`Tracking event bus: ${eventBusName}`);
            
            // Capture and log the publishEvent method
            if (eventBus.publishEvent) {
              const originalPublishEvent = eventBus.publishEvent;
              eventBus.publishEvent = function(eventKey, data) {
                console.log(`Event Published on ${eventBusName}: ${eventKey}`, data);

                var event = new CustomEvent("BusEventPassToContent", { detail:
                    { action: 'updateEventList',
                      event: {
                        type: 'publish',
                             eventBusName: eventBusName,
                             eventKey: eventKey,
                             data: data
                           }
                    } } );

                window.dispatchEvent(event);


                return originalPublishEvent.apply(eventBus, arguments);
              };
            } else if (eventBus.publish) {
              const originalPublish = eventBus.publish;
              eventBus.publish = function(eventKey, data) {
                console.log(`Event Published on ${eventBusName}: ${eventKey}`, data);

                var event = new CustomEvent("BusEventPassToContent", { detail:
                    {    action: 'updateEventList',
                         event: {
                        type: 'publish',
                             eventBusName: eventBusName,
                             eventKey: eventKey,
                             data: data
                           }
                    } } );

                    window.dispatchEvent(event);

                return originalPublish.apply(eventBus, arguments);
              };
            }
            else if (eventBus.subscribe) {
                const originalSubscribe = eventBus.subscribe;
                eventBus.publish = function(eventKey, data) {
                  console.log(`Event Subscribed on ${eventBusName}: ${eventKey}`, data);

                   var event = new CustomEvent("BusEventPassToContent", { detail:
                    {   action: 'updateEventList',
                        event: {
                        type: 'subscribe',
                             eventBusName: eventBusName,
                             eventKey: eventKey,
                             data: data
                           }
                    } } );

                    window.dispatchEvent(event);

                  return originalPublish.apply(eventBus, arguments);
                };
            } 
            else if (eventBus.subscribe) {     
                // Capture and log the subscribeToEvent method
                const originalSubscribe = eventBus.subscribeToEvent;
                eventBus.subscribeToEvent = function(eventKey) {
                console.log(`Event Subscribed on ${eventBusName}: ${eventKey}`);
               
                var event = new CustomEvent("BusEventPassToContent", { detail:
                    {    action: 'updateEventList',
                         event: {
                        type: 'subscribe',
                             eventBusName: eventBusName,
                             eventKey: eventKey,
                             data: data
                           }
                    } } );

                    window.dispatchEvent(event);

                return originalSubscribe.apply(eventBus, arguments);
                };
             }
          } else {
            console.log(`Event bus ${eventBusName} not found or invalid.`);
          }
        });
      }
      

  })();
  