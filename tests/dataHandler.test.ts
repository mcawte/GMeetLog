import * as dataHandler from "../src/dataHandler";
import * as uiHandler from "../src/uiHandler";
import { convertDataToCSV } from "../src/utilities";

describe("dataHandler", () => {
  // Define the spies
  let displayDataSpy: jest.SpyInstance;
  let getSpy: jest.SpyInstance;
  let setSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;
  let createElementSpy: jest.SpyInstance;

  const fakeMeetingData = {
    "https://meet.google.com/abc-def-ghi": [
      {
        duration: 1234,
        startTime: "2023-01-01T00:00:00Z",
        endTime: "2023-01-01T00:20:34Z",
        title: "test-title",
        participants: ["Participant 1", "Participant 2"],
      },
    ],
  };

  beforeEach(() => {
    // Create the spies
    displayDataSpy = jest.spyOn(uiHandler, "displayData");
    getSpy = jest.spyOn(chrome.storage.sync, "get");
    setSpy = jest.spyOn(chrome.storage.sync, "set");
    createObjectURLSpy = jest.spyOn(window.URL, "createObjectURL");
    revokeObjectURLSpy = jest.spyOn(window.URL, "revokeObjectURL");
    createElementSpy = jest.spyOn(document, "createElement");
  });

  afterEach(() => {
    // Restore the spies
    displayDataSpy.mockRestore();
    getSpy.mockRestore();
    setSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  test("updateData", async () => {
    getSpy.mockImplementation((key, callback) =>
      callback({ meetingData: fakeMeetingData })
    );

    dataHandler.updateData();

    expect(displayDataSpy).toHaveBeenCalledWith(fakeMeetingData);
  });

  test("deleteMeeting", async () => {
    const meetingToDelete =
      fakeMeetingData["https://meet.google.com/abc-def-ghi"][0];

    getSpy.mockImplementation((key, callback) =>
      callback({ meetingData: fakeMeetingData })
    );
    setSpy.mockImplementation((data, callback) => callback());

    dataHandler.deleteMeeting(meetingToDelete);

    expect(getSpy).toHaveBeenCalledWith("meetingData", expect.any(Function));
    expect(setSpy).toHaveBeenCalledWith(
      { meetingData: {} },
      expect.any(Function)
    );
    expect(displayDataSpy).toHaveBeenCalled();
  });
});
