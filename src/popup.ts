document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get(
    "meetingData",
    function (data: {
      meetingData?: {
        [key: string]: {
          duration: number;
          startTime: string;
          endTime: string;
          participants: string[];
        };
      };
    }) {
      const meetings = data.meetingData;
      // Convert the data object to an array of meetings
      if (!meetings) return;
      const sortedMeetings = Object.entries(meetings).map(([url, details]) => ({
        url,
        ...details,
      }));

      // Sort the meetings by start time in descending order
      sortedMeetings.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      // Get meetings element in doc
      const meetingsElement = document.getElementById("meetings");

      if (meetingsElement && sortedMeetings) {
        for (const index in sortedMeetings) {
          const meeting = sortedMeetings[index];

          const listItem = document.createElement("li");
          listItem.className = "meeting";

          const title = document.createElement("h2");
          title.textContent = meeting.url;
          listItem.appendChild(title);

          const duration = document.createElement("p");
          const durationMinutes = Math.floor(meeting.duration / 60000);
          const durationSeconds = ((meeting.duration % 60000) / 1000).toFixed(
            0
          );
          duration.textContent = `Duration: ${durationMinutes} minutes and ${durationSeconds} seconds`;
          listItem.appendChild(duration);

          const startTime = document.createElement("p");
          const startDateTime = new Date(meeting.startTime);
          startTime.textContent = `Start Time: ${startDateTime.toLocaleString()}`;
          listItem.appendChild(startTime);

          const endTime = document.createElement("p");
          const endDateTime = new Date(meeting.endTime);
          endTime.textContent = `End Time: ${endDateTime.toLocaleString()}`;
          listItem.appendChild(endTime);

          const participants = document.createElement("p");
          participants.textContent = `Participants: ${meeting.participants.join(
            ", "
          )}`;
          listItem.appendChild(participants);

          meetingsElement.appendChild(listItem);
        }
      }
    }
  );
});
