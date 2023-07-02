# Google Meet Tracker Chrome Extension

This is a Chrome extension that tracks the duration of your Google Meet meetings.

## Installation

~~### Installing from the .crx file~~

~~1. **Download the .crx file**: Download the `.crx` file from the repository.~~

~~2. **Install the extension into Chrome**:~~

   ~~- Open Chrome and navigate to `chrome://extensions`.~~
   ~~- Enable Developer mode by clicking the toggle switch in the top right corner.~~
   ~~- Drag and drop the `.crx` file into the Chrome extensions page. You should now see your extension in the list.~~

~~3. **Pin the extension**:~~

   ~~- In the Chrome toolbar, click on the Extensions button (it looks like a puzzle piece).~~
   ~~- Find your extension in the dropdown list and click the pin icon next to it. This will add the extension's icon to the toolbar.~~

~~4. **Test the extension**:~~

   ~~- Open a Google Meet meeting in a new tab. The extension should automatically track the duration of the meeting.~~
   ~~- After the meeting, click on the extension's icon in the toolbar to view the meeting times in the popup.~~

As of Chrome 91, Google has disabled the ability to install non-web store extensions or CRX files. To allow installation I need to publish it to the Chrome Web Store. It costs 5 bux and I can't be bothered yet.


### Installing in developer mode

1. **Clone the repository**: Clone this repository to your local machine using `git clone`.

   ```bash
   git clone https://github.com/mcawte/gmeet-extension.git
   ```

2. **Build the project**: Navigate into the project directory and build the project using npm.

   ```bash
   cd gmeet-extension
   npm install
   npm run build
   ```

3. **Load the extension into Chrome**:

   - Open Chrome and navigate to `chrome://extensions`.
   - Enable Developer mode by clicking the toggle switch in the top right corner.
   - Click the "Load unpacked" button and select the project directory. You should now see your extension in the list.

4. **Pin the extension**:

   - In the Chrome toolbar, click on the Extensions button (it looks like a puzzle piece).
   - Find your extension in the dropdown list and click the pin icon next to it. This will add the extension's icon to the toolbar.

5. **Test the extension**:

   - Open a Google Meet meeting in a new tab. The extension should automatically track the duration of the meeting.
   - After the meeting, click on the extension's icon in the toolbar to view the meeting times in the popup.
