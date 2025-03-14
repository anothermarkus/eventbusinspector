# Event Bus Inspector
Basic Chome Extension to debug events being published and subscribed to event bus

background.js is the mediator between popup.js and content.js
injectedScript.js that sits in the DOM of the target site communicates via window.dispatchEvent(event); which content.js picks up

![image](https://github.com/user-attachments/assets/ff40ac70-348f-48e8-909e-371888827d9f)


Events are sent to this helper page. 
![image](https://github.com/user-attachments/assets/b971adf9-be53-4991-97cb-d751baad96b0)

![image](https://github.com/user-attachments/assets/dd5402ae-5dbc-421e-b601-1391a36b3f9d)


https://www.planttext.com/

@startuml

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
@enduml



TODO
- Instructional video
- Persist selections, and refresh list rather than abandoning the state each time the button is clicked
- Clean up reundancy in the code
- Add unit tests
- Add test framework
- Convert project to Angular ?




