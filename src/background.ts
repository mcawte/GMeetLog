interface Meeting {
  tabId: number;
  url: string;
  startTime: string;
  endTime?: string;
  participants?: string[];
}

let currentMeetings: { [key: number]: Meeting } = {};

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleUrlChange(tabId, changeInfo.url);
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

function handleUrlChange(tabId: number, url: string) {
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

function startMeeting(tabId: number, url: string) {
  currentMeetings[tabId] = {
    tabId,
    url,
    startTime: new Date().toISOString(),
    participants: [],
  };
}

function endMeeting(tabId: number) {
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
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        participants: meeting.participants,
      });
    } else {
      meetingData[meeting.url] = [
        {
          duration,
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender?.tab?.id;
  const meeting = tabId && currentMeetings[tabId];

  if (request.action === "getParticipants") {
    if (meeting) {
      // Remove duplicates using Set and spread operator
      meeting.participants = [
        ...new Set([...(meeting.participants || []), ...request.source]),
      ];
    }
  }

  if (request.action === "endMeeting") {
    if (meeting) {
      endMeeting(tabId);
    }
  }
});
