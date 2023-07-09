interface MessageData {
  action: string;
  source: string[];
}

interface ParticipantElement extends Element {
  innerText: string;
}

// Ensure the script only runs on a Google Meet call page
const match = window.location.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
if (match) {
  function getParticipants() {
    // This method is based on the Google Meet UI as of the last update of this code.
    // Changes to the Google Meet UI might break this method.

    const participantsButtonSelector = '[aria-label*="Show everyone"]';
    const participantNameSelector = "[data-self-name]";

    // Click the participants button to open the participants pane.
    const participantsButton = document.querySelector(
      participantsButtonSelector
    ) as HTMLElement;
    participantsButton && participantsButton.click();

    const observer = new MutationObserver(() => {
      const names = [
        ...document.querySelectorAll<ParticipantElement>(
          participantNameSelector
        ),
      ].map((e) => e.innerText);
      const message: MessageData = { action: "getParticipants", source: names };

      // Send the names to the background script
      chrome.runtime.sendMessage(message);
    });

    // Start observing the document with the configured parameters.
    observer.observe(document, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  }

  // Call getParticipants when the page loads
  getParticipants();
}
