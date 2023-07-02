document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(null, function (data: {[key: string]: {duration: number, startTime: string, endTime: string}}) {
        const meetingsElement = document.getElementById('meetings');
        if (meetingsElement) {
            for (const url in data) {
                const meeting = data[url];
                const listItem = document.createElement('li');
                listItem.textContent = `Meeting: ${url}, Duration: ${meeting.duration} ms, Start Time: ${meeting.startTime}, End Time: ${meeting.endTime}`;
                meetingsElement.appendChild(listItem);
            }
        }
    });
});
