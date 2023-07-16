# Google Meet Logger

Google Meet Logger is a Google Chrome Extension that helps you log your Google Meet sessions. It captures the start and end times, duration, participants, and title of the meeting, and stores this data for your reference later.

You can download and install Google Meet Logger from the [Chrome Web Store](https://chrome.google.com/webstore/detail/gmeetlog/bmhfkmjmobpbkjfbnjhninekkackdnhj).

## Features

- Logs Google Meet session duration
- Records participants of the meeting
- Captures the title of the meeting
- Logs are available for review at any time
- Data export functionality (JSON and CSV)

## How It Works

### Meeting Duration

The extension starts logging the meeting duration as soon as you join a Google Meet session and stops when you leave. It records both the start and end times of the meeting.

### Participants

The extension logs the participants by monitoring the participants pane in Google Meet.

### Meeting Title

The meeting title is captured in three ways:

1. Via chrome.tabs.onUpdated event: This method listens for updates in the Google Chrome tabs. When the title of a tab changes, it checks if the title starts with "Meet - ". If so, it removes "Meet - " from the start of the title and sets it as the meeting title. This method takes precedence over the other methods.

2. Via data-meeting-title attribute: This is the secondary method, the extension observes for changes in the data-meeting-title attribute in the document.

3. Via specific CSS class names: As a fallback method, the extension also looks for certain CSS class names that are known to contain the meeting title. Currently, it watches for elements with the classes "u6vdEc" and "ouH3xe". This method initially checks if the title is "Meeting details", which is the default value set by Google Meet at the start of the session. However, since the DOM gets replaced entirely afterwards, it continues to traverse the entire document to look for changes. As Google may change their class names at any time, this method may not always work.

Each method, before setting the meeting title, checks if the new title is not just the meeting id (i.e., the Google Meet URL query parameters) which is set initially as the meeting title.

The title set by chrome.tabs.onUpdated event takes precedence, then the data-meeting-title attribute, and finally the title is extracted from the CSS class names if the other methods fail.

### Data Export

The extension allows you to export your logged data into two formats: JSON and CSV. This allows for easy integration with other data processing tools or for archival purposes.

### Limitations

This extension relies heavily on the current Google Meet UI structure and naming conventions for class names, which may change without notice. In particular, the method for capturing the meeting title by class names is quite fragile. If the UI changes, some features of the extension might stop working.

### Future Work

Enable data sync across browsers.

## Installing in developer mode

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
   - Click the "Load unpacked" button and select the dist folder inside the project directory. You should now see your extension in the list.

4. **Pin the extension**:

   - In the Chrome toolbar, click on the Extensions button (it looks like a puzzle piece).
   - Find your extension in the dropdown list and click the pin icon next to it. This will add the extension's icon to the toolbar.

5. **Test the extension**:

   - Open a Google Meet meeting in a new tab. The extension should automatically track the duration of the meeting.
   - After the meeting, click on the extension's icon in the toolbar to view the meeting times in the popup.
