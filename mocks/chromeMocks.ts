// __mocks__/chromeMock.ts

let storage: { [key: string]: any } = {};

const mockEvent = () => ({
  addListener: jest.fn(),
  hasListener: jest.fn(() => false),
  hasListeners: jest.fn(() => false),
  removeListener: jest.fn(),
  removeListeners: jest.fn(),
  addRules: jest.fn(),
  getRules: jest.fn(),
  removeRules: jest.fn(),
});

const chromeMock = {
  runtime: {
    onMessage: mockEvent(),
    onConnect: mockEvent(),
    sendMessage: jest.fn(),
  },
  tabs: {
    onUpdated: mockEvent(),
    onRemoved: mockEvent(),
  },
  storage: {
    sync: {
      get: jest.fn((key, callback) => {
        process.nextTick(() => {
          callback({[key]: storage[key]});
        });
      }),
      set: jest.fn((data, callback) => {
        storage = { ...storage, ...data };
        if (callback) {
          process.nextTick(callback);
        }
      }),
    },
  },
};

export default chromeMock;
