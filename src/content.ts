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

  function monitorEndOfMeeting() {
    const observer = new MutationObserver((mutationsList) => {
      // Loop over each mutation that just occured
      for (let mutation of mutationsList) {
        // If the mutation was a childList mutation
        if (mutation.type === "childList") {
          // Loop over each node that was added
          for (let node of mutation.addedNodes) {
            // If the node is an Element node
            if (node instanceof Element) {
              // Look for an 'h1' element within this node's subtree
              let h1Elements = node.getElementsByTagName("h1");
              for (let h1 of h1Elements) {
                // If this h1's text is 'You left the meeting'
                if (h1.textContent === "You left the meeting") {
                  // Send a message to the background script
                  chrome.runtime.sendMessage({
                    action: "endMeeting",
                  });
                  return; // Stop searching through mutations after found
                }
              }
            }
          }
        }
      }
    });

    // Start observing the document with the configured parameters.
    observer.observe(document, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  }

  // Call getParticipants and monitorEndOfMeeting when the page loads
  getParticipants();
  monitorEndOfMeeting();
}
