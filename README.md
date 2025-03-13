# Event Bus Inspector
Basic Chome Extension to debug events being published and subscribed to event bus

background.js is the middleman between popup.js and content.js
injectedScript.js that sits in the DOM of the target site communicates via window.dispatchEvent(event); which content.js picks up

![image](https://github.com/user-attachments/assets/d46ab952-5745-47bb-bac3-854ff1a0d36d)

Last step to get communication flowing is to finally see the console logs when event is published or subscribed!




