import {
  startMeeting,
  endMeeting,
  currentMeetings,
  handleUrlChange,
} from "../src/background";

describe("background.ts", () => {
  beforeEach(() => {
    // Clear the currentMeetings before each test
    for (let tabId in currentMeetings) {
      delete currentMeetings[tabId];
    }
    // clear storage before each test
    chrome.storage.sync.set({}, () => {});
  });

  test("startMeeting should add a meeting to currentMeetings", () => {
    const tabId = 1;
    const url = "https://meet.google.com/abc-def-ghi";

    startMeeting(tabId, url);

    const meeting = currentMeetings[tabId];
    expect(meeting).toBeDefined();
    expect(meeting.url).toBe(url);
    expect(meeting.participants).toEqual([]);
    expect(meeting.startTime).toBeDefined();
  });

  test("endMeeting should remove a meeting from currentMeetings", () => {
    const tabId = 1;

    startMeeting(tabId, "https://meet.google.com/abc-def-ghi");
    expect(currentMeetings[tabId]).toBeDefined();

    endMeeting(tabId);

    const meeting = currentMeetings[tabId];
    expect(meeting).toBeUndefined();
  });

  test("handleUrlChange should start a meeting when a Google Meet URL is visited", () => {
    const tabId = 1;
    const googleMeetUrl = "https://meet.google.com/abc-def-ghi";

    handleUrlChange(tabId, googleMeetUrl);

    const meeting = currentMeetings[tabId];
    expect(meeting).toBeDefined();
    expect(meeting.url).toBe(googleMeetUrl);
  });

  test("handleUrlChange should not start a meeting when a non-Google Meet URL is visited", () => {
    const tabId = 1;
    const nonGoogleMeetUrl = "https://not-a-google-meet-url.com";

    handleUrlChange(tabId, nonGoogleMeetUrl);

    const meeting = currentMeetings[tabId];
    expect(meeting).toBeUndefined();
  });

  test("handleUrlChange should end a meeting when navigating away from a Google Meet URL", () => {
    const tabId = 1;
    const googleMeetUrl = "https://meet.google.com/abc-def-ghi";
    const nonGoogleMeetUrl = "https://not-a-google-meet-url.com";

    // Start a meeting
    startMeeting(tabId, googleMeetUrl);
    expect(currentMeetings[tabId]).toBeDefined();

    // Navigate away
    handleUrlChange(tabId, nonGoogleMeetUrl);

    const meeting = currentMeetings[tabId];
    expect(meeting).toBeUndefined();
  });

  test("handleUrlChange should not start a new meeting when navigating from one Google Meet URL to another", () => {
    const tabId = 1;
    const googleMeetUrl1 = "https://meet.google.com/abc-def-ghi";
    const googleMeetUrl2 = "https://meet.google.com/jkl-mno-pqr";

    // Start a meeting
    startMeeting(tabId, googleMeetUrl1);
    const initialStartTime = currentMeetings[tabId]?.startTime;

    // Navigate to a new Google Meet URL
    handleUrlChange(tabId, googleMeetUrl2);

    const meeting = currentMeetings[tabId];
    expect(meeting).toBeDefined();
    expect(meeting?.url).toBe(googleMeetUrl2);
    expect(meeting?.startTime).toBe(initialStartTime); // The start time should not have changed
  });

  test("handleUrlChange should handle multiple tabs correctly", async () => {
    const tabId1 = 1;
    const tabId2 = 2;
    const googleMeetUrl = "https://meet.google.com/abc-def-ghi";

    // Start a meeting in the first tab
    startMeeting(tabId1, googleMeetUrl);
    const meeting1StartTime = currentMeetings[tabId1]?.startTime;

    // Wait for 1 millisecond
    await new Promise((resolve) => setTimeout(resolve, 1));

    // Start a meeting in the second tab
    startMeeting(tabId2, googleMeetUrl);
    const meeting2StartTime = currentMeetings[tabId2]?.startTime;

    expect(meeting1StartTime).toBeDefined();
    expect(meeting2StartTime).toBeDefined();
    expect(meeting1StartTime).not.toBe(meeting2StartTime); // The start times should be different

    // End the meeting in the first tab
    endMeeting(tabId1);

    const meeting1 = currentMeetings[tabId1];
    const meeting2 = currentMeetings[tabId2];
    expect(meeting1).toBeUndefined(); // The first meeting should have ended
    expect(meeting2).toBeDefined(); // The second meeting should still be ongoing
  });
});
