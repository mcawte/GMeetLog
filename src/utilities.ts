import { MeetingData } from "./dataHandler";

export function formatDuration(duration: number) {
  const hours = Math.floor(duration / (60 * 60 * 1000));
  const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((duration % (60 * 1000)) / 1000);

  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
}

export function convertDataToCSV(meetings: MeetingData): string {
  let csvStr = "URL,Start Time,End Time,Duration,Participants\n"; // CSV header

  for (const url in meetings) {
    for (const meeting of meetings[url]) {
      let durationStr = formatDuration(meeting.duration);
      csvStr += `${url},${meeting.startTime},${
        meeting.endTime
      },"${durationStr}","${meeting.participants.join(", ")}"\n`;
    }
  }

  return csvStr;
}

export function convertDataToJSON(meetings: MeetingData): string {
  return JSON.stringify(meetings, null, 2);
}
