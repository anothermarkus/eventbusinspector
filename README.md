# Event Bus Inspector
Basic Chome Extension to debug events being published and subscribed to event bus

background.js is the mediator between popup.js and content.js
injectedScript.js that sits in the DOM of the target site communicates via window.dispatchEvent(event); which content.js picks up

![image](https://github.com/user-attachments/assets/ff40ac70-348f-48e8-909e-371888827d9f)


Events are sent to this helper page. 
![image](https://github.com/user-attachments/assets/b971adf9-be53-4991-97cb-d751baad96b0)




