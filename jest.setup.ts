import chromeMock from "./__mocks__/chromeMocks";

// Set up the global chrome mock
(global as any).chrome = chromeMock;

global.URL.createObjectURL = jest.fn(() => "mockObjectURL");
global.URL.revokeObjectURL = jest.fn();
