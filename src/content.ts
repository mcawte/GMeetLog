interface BaseMessageData {
  action: "getParticipants" | "updateTitle" | "endMeeting";
}

export interface ParticipantMessageData extends BaseMessageData {
  participants: string[];
}

export interface TitleMessageData extends BaseMessageData {
  title: string;
}

export type MessageData =
  | ParticipantMessageData
  | TitleMessageData
  | BaseMessageData;

interface ParticipantElement extends Element {
  innerText: string;
}

// Ensure the script only runs on a Google Meet call page
const match = window.location.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
if (match) {
  /**
   * Extract participant names from the Meet interface and
   * send them to the background script.
   */
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
      const message: ParticipantMessageData = {
        action: "getParticipants",
        participants: names,
      };

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

  /**
   * Monitor the Meet interface for a message indicating the user left the meeting,
   * and then notify the background script.
   */
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
                  observer.disconnect(); // Stop observing when the meeting ends
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

  /**
   * Monitor the Meet interface for changes to the meeting title,
   * and then send the updated title to the background script.
   */
  function monitorMeetingTitle() {
    const observerForTitleByDataMeetingTitleTag = new MutationObserver(
      (mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "attributes") {
            const target = mutation.target as HTMLElement;
            const meetingTitle = target.getAttribute("data-meeting-title");
            if (meetingTitle) {
              // Send the title to the background script
              sendUpdateTitleMessage(meetingTitle);
              // Once the title is found, disconnect the observer
              observer.disconnect();
              return;
            }
          }
        }
      }
    );

    const observerForTitleByCssClass = new MutationObserver(
      (mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
            // Check for specific class name. This could change in future
            const elementOfInterest = document.querySelector(".u6vdEc.ouH3xe");

            // This class name is used to say "Meeting details" down the bottom
            // left of the screen at the start. The entire dom is replaced so we have
            // to go through the tree otherwise we won't see the change
            if (
              elementOfInterest?.textContent &&
              elementOfInterest.textContent != "Meeting details"
            ) {
              // Send the title to the background script
              sendUpdateTitleMessage(elementOfInterest.textContent);
              // Once the title is found, disconnect both observers
              observer.disconnect();
              observerForTitleByDataMeetingTitleTag.disconnect();
              return;
            }
          }
        }
      }
    );

    // Monitor changes in data-meeting-title attribute across the document.
    observerForTitleByDataMeetingTitleTag.observe(document, {
      attributes: true, // Watch for attribute changes this time
      attributeFilter: ["data-meeting-title"], // Specifically watch for changes in data-meeting-title attribute
      childList: false,
      subtree: true,
    });

    // Monitor changes in class attribute across the document.
    observerForTitleByCssClass.observe(document, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });

    function sendUpdateTitleMessage(meetingTitle: string) {
      const message = {
        action: "updateTitle",
        title: meetingTitle,
      };
      chrome.runtime.sendMessage(message);
    }
  }

  // Call getParticipants, monitorEndOfMeeting and monitorMeetingTitle when the page loads
  getParticipants();
  monitorEndOfMeeting();
  monitorMeetingTitle();
}
