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

### Running tests

[WebDriver IO](https://webdriver.io/docs/api/) E2E Tests have a robust open source framework that easily bootstrap and test Chrome Extensions

```
npm install
npm run test
```



## TODO

### Features 
- Implement Stop tracking events
- Include function / or stack of what published / subscribed to the eventBus
- Dynamic periodic re-scan of the event bus
- Track all events from all busses by default

### Bugs
- No subscription events, they may have happend PRIOR to loading of the page
- Lifecycle of catching bus events is not consistent, switching tabs through the process seems to break the app

### MISC
- Instructional video
- Put TODO list into Issues section in GitHub




