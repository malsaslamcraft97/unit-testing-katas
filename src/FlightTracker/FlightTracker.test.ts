// flightTracker.test.ts
import {
  FetchAdapter,
  FlightData,
  getCalculatedFlightStatus,
  startFlightTracker,
} from "./FlightTracker";

describe("Step 1: Extracted Pure Logic - calculateFlightStatus", () => {
  test("returns 'On Time' for 0 minutes of delay", () => {
    const mockFlightData: FlightData = {
      flightNumber: "EY5CX",
      delayMinutes: 0,
    };
    const statusMsg = getCalculatedFlightStatus(mockFlightData);
    expect(statusMsg).toBe("On Time");
  });

  test("returns 'Slightly Delayed' for delays between 1 and 60 minutes", () => {
    const mockFlightData: FlightData = {
      flightNumber: "EY5CX",
      delayMinutes: 45, // Your code here!
    };
    const statusMsg = getCalculatedFlightStatus(mockFlightData);
    expect(statusMsg).toBe("Slightly Delayed");
  });

  test("returns 'Severely Delayed - Issue Vouchers' for delays over 60 minutes", () => {
    // Just need one more here for a delay > 60!
  });
});

describe("Step 2 & 3: Extracted Adapter and Taming Timers", () => {
  beforeAll(() => {
    (globalThis as any).document = {
      getElementById: jest.fn().mockReturnValue({ innerHTML: "" }),
    };
  });

  // Always clean up fake timers after the test!
  afterEach(() => {
    jest.useRealTimers();
  });

  test("uses the injected adapter and triggers a refresh after 60 seconds", async () => {
    // 1. HIJACK TIME: Tell Jest to replace setTimeout with a fake version
    jest.useFakeTimers();

    // 2. We use a Jest Mock Function so we can track how many times it was called
    const fakeAdapter = jest.fn().mockResolvedValue({
      flightNumber: "AA123",
      delayMinutes: 120,
    });

    // 3. Call the function (Initial run)
    await startFlightTracker("AA123", "status-div", fakeAdapter);

    // It should have called our adapter exactly once to get the first data
    expect(fakeAdapter).toHaveBeenCalledTimes(1);

    // 4. TIME TRAVEL: Fast-forward time by exactly 60 seconds (60,000 ms)
    jest.advanceTimersByTime(60000);

    // Wait for any asynchronous promises triggered by the timer to resolve
    await Promise.resolve();

    // 5. Assert that the timer worked and called our adapter a second time!
    expect(fakeAdapter).toHaveBeenCalledTimes(2);
  });

  test("updates the DOM with the correct flight status", async () => {
    // 1. Create a fake HTML element
    const mockHtmlElement = { innerHTML: "" };

    // 2. Tell our fake document to return this specific element when asked
    (globalThis as any).document.getElementById = jest
      .fn()
      .mockReturnValue(mockHtmlElement);

    // 3. Create an adapter that simulates a 45-minute delay
    const fakeAdapter = jest.fn().mockResolvedValue({
      flightNumber: "AA123",
      delayMinutes: 45,
    });

    // 4. Run the tracker
    await startFlightTracker("AA123", "airport-screen-1", fakeAdapter);

    // 5. Assert that the DOM was searched for the right ID
    expect((globalThis as any).document.getElementById).toHaveBeenCalledWith(
      "airport-screen-1",
    );

    // 6. Assert the end result: The user sees the right message!
    expect(mockHtmlElement.innerHTML).toBe("Slightly Delayed");
  });
});
