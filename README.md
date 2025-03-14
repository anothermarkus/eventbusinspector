# Event Bus Inspector
Basic Chome Extension to debug events being published and subscribed to event bus

## Why did I create this?

I'm in a unique situation where I the site that I work on, is worked on with others. Each team has their own integration pattern for MFE communication.
Some teams use a 3rd party off the shelf client side eventbus (Postal.js) others use homegrown event buses, all of these are causing confusion.

I did not find anything out there that solves the problem of quickly and clearly outputting information passing through the Event Bus.

Rather than building something within the framework of our app client-side, I wanted to re-usable tool that could be used everywhere (perhaps others could use too!)


## High level overview of this plugin

background.js is the mediator between popup.js and content.js
injectedScript.js that sits in the DOM of the target site communicates via window.dispatchEvent(event); which content.js picks up

### Popup 
![image](https://github.com/user-attachments/assets/ff40ac70-348f-48e8-909e-371888827d9f)


### Event Display
![image](https://github.com/user-attachments/assets/b971adf9-be53-4991-97cb-d751baad96b0)

### Sequence Diagram
![image](https://github.com/user-attachments/assets/4ccb0266-5f7e-410b-8c2c-5e6a61fb82b2)

### PlantUML Sequence
```
participant injectedScript.js
participant content.js
participant popup.js
participant eventDisplay.js
participant background.js

note right of injectedScript.js: Detect Event Buses
injectedScript.js->>injectedScript.js: Detect Event Buses in the page
injectedScript.js->>content.js: Send EventBuses data via postMessage
content.js->>popup.js: Forward event to popup.js

note right of injectedScript.js: Track Event Buses Activities
 content.js->>injectedScript.js: Send trackEventBuses to injectedScript.js
injectedScript.js->>injectedScript.js: Track event buses (publish/subscribe)
popup.js->>popup.js: Update UI with Event List
popup.js->>background.js: Forward event to background.js for logging
background.js->>background.js: Log Event to Local Storage/Sync

note right of injectedScript.js: Send Open Tab
popup.js->>background.js: Send openNewTab message to background.js
background.js->>background.js: Open a new tab (eventDisplay.html)

note right of injectedScript.js: Send Event to Event Display
injectedScript.js->>eventDisplay.js: Send Event to eventDisplay.js (publish/subscribe)
background.js->>eventDisplay.js: Send updateEventList to eventDisplay.js
eventDisplay.js->>eventDisplay.js: Update event table in UI


note right of injectedScript.js: injectedScript.js detects event buses and tracks events on the page
note right of content.js: content.js listens for messages, sends events to popup.js
note right of eventDisplay.js: eventDisplay.js shows event data in the event table
note right of popup.js: popup.js collects event bus info and displays it in the popup interface
note right of background.js: background.js facilitates communication between content.js, popup.js, and eventDisplay.js
```



## TODO

### Features 
- Implement Stop tracking events
- Include function / or stack of what published / subscribed to the eventBus
- Dynamic periodic re-scan of the event bus
- Track all events from all busses by default

### Bugs
- No subscription events, they may have happend PRIOR to loading of the page

### MISC
- Instructional video
- Add unit tests
- Add test framework
- Convert project to Angular / React 
- Put TODO list into Issues section in GitHub




