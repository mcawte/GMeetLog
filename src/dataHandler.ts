import { displayData } from "./uiHandler";
import { convertDataToCSV, convertDataToJSON } from "./utilities";

export interface MeetingDetails {
  title: string;
  duration: number;
  startTime: string;
  endTime: string;
  participants: string[];
}

export interface MeetingData {
  [url: string]: MeetingDetails[];
}

export function updateData() {
  chrome.storage.sync.get("meetingData", function (data) {
    const meetings = data.meetingData as MeetingData | undefined;
    if (!meetings) return;
    displayData(meetings);
  });
}

export function deleteMeeting(meetingToDelete: MeetingDetails) {
  chrome.storage.sync.get("meetingData", function (data) {
    const meetings = data.meetingData as MeetingData | undefined;
    if (!meetings) return;

    // loop through each meeting URL and remove the meeting to delete
    for (const url in meetings) {
      meetings[url] = meetings[url].filter(
        (meeting) => meeting.startTime !== meetingToDelete.startTime
      );

      // if we've removed all meetings for this URL, remove the URL entry
      if (meetings[url].length === 0) {
        delete meetings[url];
      }
    }

    // save the updated meeting data back to storage
    chrome.storage.sync.set({ meetingData: meetings }, function () {
      // once the data is saved, update the displayed data
      updateData();
    });
  });
}

export function exportData(format: "csv" | "json") {
  // Retrieve the meeting data
  chrome.storage.sync.get("meetingData", function (data) {
    const meetings = data.meetingData as MeetingData | undefined;
    if (!meetings) return;

    let dataStr, mimeType, fileExtension;

    // Convert the data to CSV or JSON format
    if (format === "csv") {
      dataStr = convertDataToCSV(meetings);
      mimeType = "text/csv";
      fileExtension = "csv";
    } else {
      // json
      dataStr = convertDataToJSON(meetings);
      mimeType = "application/json";
      fileExtension = "json";
    }

    const dataBlob = new Blob([dataStr], { type: mimeType });

    // Create a download link for the data and simulate a click
    const url = window.URL.createObjectURL(dataBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `data.${fileExtension}`;
    downloadLink.click();

    // Revoke the URL to free up memory
    window.URL.revokeObjectURL(url);
  });
}
