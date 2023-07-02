document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(null, function (data: {[key: string]: {duration: number, startTime: string, endTime: string}}) {
        const meetingsElement = document.getElementById('meetings');
        if (meetingsElement) {
            for (const url in data) {
                const meeting = data[url];
                const listItem = document.createElement('li');
                listItem.className = 'meeting';

                const title = document.createElement('h2');
                title.textContent = url;
                listItem.appendChild(title);

                const duration = document.createElement('p');
                const durationMinutes = Math.floor(meeting.duration / 60000);
                const durationSeconds = ((meeting.duration % 60000) / 1000).toFixed(0);
                duration.textContent = `Duration: ${durationMinutes} minutes and ${durationSeconds} seconds`;
                listItem.appendChild(duration);

                const startTime = document.createElement('p');
                const startDateTime = new Date(meeting.startTime);
                startTime.textContent = `Start Time: ${startDateTime.toLocaleString()}`;
                listItem.appendChild(startTime);

                const endTime = document.createElement('p');
                const endDateTime = new Date(meeting.endTime);
                endTime.textContent = `End Time: ${endDateTime.toLocaleString()}`;
                listItem.appendChild(endTime);

                meetingsElement.appendChild(listItem);
            }
        }
    });
});
