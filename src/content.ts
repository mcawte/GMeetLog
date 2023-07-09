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
    const names = [...document.querySelectorAll(participantNameSelector)].map(
      (e) => (e as HTMLElement).innerText
    );

    // Send the names to the background script
    chrome.runtime.sendMessage({ action: "getParticipants", source: names });
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
