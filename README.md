# Event Bus Inspector
Basic Chome Extension to debug events being published and subscribed to event bus

background.js is the mediator between popup.js and content.js
injectedScript.js that sits in the DOM of the target site communicates via window.dispatchEvent(event); which content.js picks up

![image](https://github.com/user-attachments/assets/ff40ac70-348f-48e8-909e-371888827d9f)


Events are sent to this helper page. 
![image](https://github.com/user-attachments/assets/b971adf9-be53-4991-97cb-d751baad96b0)

![image](https://github.com/user-attachments/assets/4ccb0266-5f7e-410b-8c2c-5e6a61fb82b2)



https://www.planttext.com/

@startuml
actor User

entity "popup.js" as popup
entity "background.js" as background
entity "content.js" as content
entity "injectedScript.js" as injected
entity "eventDisplay.js" as eventDisplay

== Scenario 1: Extension Automatically Injects Script ==
User -> popup : Extension loads
popup -> background
background -> injected : Injects injectedScript.js into active tab

== Scenario 2: Detect Event Buses and Send to Popup ==
injected -> injected : Detect event buses on the page
injected -> content : Dispatches event (InjectionEventToContentLayer)
content -> background : Forwards custom event to background.js (InjectionEventToContentLayer)
background -> popup : Sends message (eventBusesFound)

popup -> popup : Populates event bus list UI

== Scenario 3: User Selects Event Buses to Track ==
User -> popup : Selects event buses (checkboxes)
popup -> background : Sends message (trackEventBuses, selected event buses)
background -> injected : Updates tracked event buses in injected script

== Scenario 4: Publish/Subscribe Event Tracking ==
injected -> injected : Wraps event bus methods for tracking
injected -> content : Dispatches event (publish or subscribe event detected)
content -> background : Forwards event to background.js
background -> eventDisplay : Sends event data (updateEventList)

eventDisplay -> eventDisplay : Captures and displays event in table

@enduml




TODO
- Instructional video
- Persist selections, and refresh list rather than abandoning the state each time the button is clicked
- Add unit tests
- Add test framework
- Convert project to Angular ?
- Organize folders, extract inline styles to external css
- Implement Stop tracking events




