const path = require('path');
const fs = require('fs');

// Path to your extension folder
const extensionPath = path.resolve(__dirname);

console.log("Extension path:",extensionPath);

const getExtensionId = () => {
  // Assuming your extension's directory contains a file `manifest.json` and using it to generate an ID
  const manifestPath = path.join(extensionPath, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Manifest file not found!');
  }
  
  // Read the manifest and find the extension ID dynamically
  const manifest = require(manifestPath);
  return manifest.key; // or manifest.id depending on how your extension is structured
};

exports.config = {
  runner: 'local',
  path: '/wd/hub',
  specs: [
    './test/specs/**/*.js'  // Adjust path to your test files
  ],
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        `--load-extension=${extensionPath}`,
        '--disable-extensions-except=' + extensionPath,
        //'--headless',
        '--disable-gpu',
        '--window-size=1200x800'
      ]
    }
  }],
  services: ['chromedriver'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
// Keeps the browser open
//   afterTest: async function (test, context, { error }) {
//     if (error) {
//       console.log('Test failed. Keeping browser open for inspection.');
//       // Keep the browser open if the test fails
//       await browser.debug();
//     }
//   }

};
