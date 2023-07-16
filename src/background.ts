import {
  MessageData,
  ParticipantMessageData,
  TitleMessageData,
} from "./content";

interface Meeting {
  tabId: number;
  url: string;
  startTime: string;
  endTime?: string;
  title: string;
  participants?: string[];
}

export let currentMeetings: { [key: number]: Meeting } = {};

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleUrlChange(tabId, changeInfo.url);
  }
  // Check if the tab's title has changed
  if (changeInfo.title && currentMeetings[tabId]) {
    const newTitle = changeInfo.title;
    if (newTitle.startsWith("Meet - ")) {
      const title = newTitle.substring("Meet - ".length);

      // Update the title if it does not match the current meeting title and doesn't include the meeting URL params
      if (
        title !== currentMeetings[tabId].title &&
        !title.includes(currentMeetings[tabId].title)
      ) {
        currentMeetings[tabId].title = title;
      }
    }
  }
});

// Listen for tab closures
chrome.tabs.onRemoved.addListener(
  (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
    if (currentMeetings[tabId]) {
      endMeeting(tabId);
    }
  }
);

// This encodes whether popup is active
let popupPort: chrome.runtime.Port | null = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    popupPort = port;
    port.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});

export function handleUrlChange(tabId: number, url: string) {
  // Regular expression to match Google Meet meeting URLs.
  // Allows trailing query params but not paths
  const googleMeetUrlPattern = /^https:\/\/meet\.google\.com\/[a-z\-]+(\?.*)?$/;

  // If the URL is a Google Meet meeting URL
  if (googleMeetUrlPattern.test(url)) {
    // If there's a current meeting, end it
    if (tabId) {
      endMeeting(tabId);
    }
    // Start a new meeting
    startMeeting(tabId, url);
  } else if (currentMeetings[tabId]) {
    // If the URL is not a Google Meet meeting URL and there's a current meeting with the same tabId, end it
    endMeeting(tabId);
  }
}

export function startMeeting(tabId: number, url: string) {
  const meetingIdPattern = /meet\.google\.com\/([^?]+)/;
  const match = url.match(meetingIdPattern);
  const meetingId = match ? match[1] : "";

  currentMeetings[tabId] = {
    tabId,
    url,
    title: meetingId, // Set title as the meetingId initially
    startTime: new Date().toISOString(),
    participants: [],
  };
}

export function endMeeting(tabId: number) {
  let meeting = currentMeetings[tabId];
  if (!meeting) return;

  meeting.endTime = new Date().toISOString();
  let duration =
    new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime();

  // Retrieve all the existing meeting data
  chrome.storage.sync.get(["meetingData"], (result) => {
    let meetingData = result.meetingData || {};

    // If there are already meetings for this URL, push this meeting into the array.
    // Otherwise, initialize the array with this meeting.
    if (meetingData[meeting.url]) {
      meetingData[meeting.url].push({
        duration,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        participants: meeting.participants,
      });
    } else {
      meetingData[meeting.url] = [
        {
          duration,
          title: meeting.title,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          participants: meeting.participants,
        },
      ];
    }

    // Save the updated meeting data
    chrome.storage.sync.set({ meetingData }, () => {});
    // Let popup know to refresh data
    if (popupPort) {
      popupPort.postMessage({ action: "updateData" });
    }
  });

  delete currentMeetings[tabId];
}

chrome.runtime.onMessage.addListener(
  (request: MessageData, sender, sendResponse) => {
    const tabId = sender?.tab?.id;
    const meeting = tabId && currentMeetings[tabId];

    if (meeting) {
      switch (request.action) {
        case "getParticipants": {
          // Remove duplicates using Set and spread operator
          const requestAsParticipantMessage = request as ParticipantMessageData;
          meeting.participants = [
            ...new Set([
              ...(meeting.participants || []),
              ...requestAsParticipantMessage.participants,
            ]),
          ];
          break;
        }

        case "updateTitle": {
          const requestAsTitleMessage = request as TitleMessageData;
          // check if title isn't just query params
          if (
            requestAsTitleMessage.title &&
            !requestAsTitleMessage.title.includes(meeting.title)
          ) {
            meeting.title = requestAsTitleMessage.title;
          }
          break;
        }

        case "endMeeting": {
          endMeeting(tabId);
          break;
        }

        default:
          break;
      }
    }
  }
);
