import { updateData, exportData } from "./dataHandler";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateData") {
    updateData();
  }
});

// Get things running on page load
document.addEventListener("DOMContentLoaded", function () {
  const exportSelect = document.getElementById(
    "exportSelect"
  ) as HTMLSelectElement;
  const exportButton = document.getElementById(
    "exportButton"
  ) as HTMLButtonElement;

  exportButton.addEventListener("click", function () {
    const format = exportSelect.value;
    if (format === "csv" || format === "json") {
      exportData(format);
    } else {
      console.error(`Unexpected export format: ${format}`);
    }
  });

  // Call updateData function to load the meetings when the popup is opened:
  updateData();
});
