let storage: { [key: string]: any } = {};

const mockEvent = () => {
  const listeners: Function[] = [];
  return {
    addListener: jest.fn((callback: Function) => listeners.push(callback)),
    hasListener: jest.fn(() => false),
    hasListeners: jest.fn(() => false),
    removeListener: jest.fn(),
    removeListeners: jest.fn(),
    addRules: jest.fn(),
    getRules: jest.fn(),
    removeRules: jest.fn(),
    callListeners: (message: any, sender: any) =>
      listeners.forEach((callback) => callback(message, sender, () => {})),
  };
};

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
          callback({ [key]: storage[key] });
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

export const callOnMessageListeners = (message: any, sender: any = {}) => {
  chromeMock.runtime.onMessage.callListeners(message, sender);
};

export default chromeMock;
