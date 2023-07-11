import chromeMock from "./mocks/chromeMocks";

// Set up the global chrome mock
(global as any).chrome = chromeMock;

global.URL.createObjectURL = jest.fn(() => "mockObjectURL");
global.URL.revokeObjectURL = jest.fn();
