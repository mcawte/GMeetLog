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
        }[];
      };
    }) {
      const meetings = data.meetingData;
      if (!meetings) return;

      // Map meetings object to an array and calculate the latest start time for each URL
      const meetingsArray = Object.entries(meetings).map(
        ([url, meetingList]) => {
          const latestStartTime = meetingList.reduce(
            (latest, meeting) =>
              Math.max(latest, new Date(meeting.startTime).getTime()),
            0
          );
          return {
            url,
            latestStartTime,
            meetingList,
          };
        }
      );

      // Sort the array based on the latest start time
      meetingsArray.sort((a, b) => b.latestStartTime - a.latestStartTime);

      // Get meetings element in doc
      const meetingsElement = document.getElementById("meetings");

      if (meetingsElement) {
        for (const { url, meetingList } of meetingsArray) {
          // Sort individual meeting list by start time in descending order
          meetingList.sort(
            (a, b) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );

          for (const meeting of meetingList) {
            const listItem = document.createElement("li");
            listItem.className = "meeting";

            const title = document.createElement("h2");
            title.textContent = url;
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
    }
  );
});
