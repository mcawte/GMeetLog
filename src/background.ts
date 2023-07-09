interface Meeting {
  tabId: number;
  url: string;
  startTime: string;
  endTime?: string;
  participants?: string[];
}

let currentMeeting: Meeting | null = null;

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleUrlChange(tabId, changeInfo.url);
  }
});

// Listen for tab closures
chrome.tabs.onRemoved.addListener(
  (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
    if (currentMeeting && currentMeeting.tabId === tabId) {
      endMeeting(currentMeeting);
    }
  }
);

function handleUrlChange(tabId: number, url: string) {
  // Regular expression to match Google Meet meeting URLs
  const googleMeetUrlPattern = /^https:\/\/meet\.google\.com\/[a-z\-]+$/;

  // If the URL is a Google Meet meeting URL
  if (googleMeetUrlPattern.test(url)) {
    // If there's a current meeting, end it
    if (currentMeeting) {
      endMeeting(currentMeeting);
    }
    // Start a new meeting
    startMeeting(tabId, url);
  } else if (currentMeeting && currentMeeting.tabId === tabId) {
    // If the URL is not a Google Meet meeting URL and there's a current meeting with the same tabId, end it
    endMeeting(currentMeeting);
  }
}

function startMeeting(tabId: number, url: string) {
  currentMeeting = {
    tabId,
    url,
    startTime: new Date().toISOString(),
    participants: [],
  };
}

function endMeeting(meeting: Meeting) {
  meeting.endTime = new Date().toISOString();
  let duration =
    new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime();

  // Retrieve all the existing meeting data
  chrome.storage.sync.get(["meetingData"], (result) => {
    let meetingData = result.meetingData || {};

    // Add the new meeting to the meeting data
    meetingData[meeting.url] = {
      duration,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      participants: meeting.participants,
    };

    // Save the updated meeting data
    chrome.storage.sync.set({ meetingData }, () => {});
  });

  currentMeeting = null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getParticipants" && sender.tab) {
    if (currentMeeting && currentMeeting.tabId === sender.tab.id) {
      // Remove duplicates using Set and spread operator
      currentMeeting.participants = [
        ...new Set([...(currentMeeting.participants || []), ...request.source]),
      ];
    }
  }
});
