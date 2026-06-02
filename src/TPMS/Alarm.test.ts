import { Alarm } from "./Alarm";
import { Sensor } from "./Sensor";

jest.mock("./Sensor");

describe("Tire Pressure Alarm (Legacy Module Mocking)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("alarm, when the pressure is below the threshold, turns on the Alarm", () => {
    const mockPopNextPressure = jest.fn().mockReturnValue(16);
    jest.mocked(Sensor).mockImplementation(() => {
      return {
        popNextPressurePsiValue: mockPopNextPressure,
      } as unknown as Sensor;
    });

    const alarm = new Alarm(); // It secretly gets our mock!

    // ACT
    alarm.check();

    // ASSERT (State-based testing, as Chapter 5 recommends over interaction testing)
    expect(alarm.isAlarmOn).toBe(true);
  });

  it("alarm, when pressure is within the normal range, it doesn't have Alarm turned on", () => {
    const mockPopNextPressure = jest.fn().mockReturnValue(19); // Normal range is 17-21
    jest.mocked(Sensor).mockImplementation(() => {
      return {
        popNextPressurePsiValue: mockPopNextPressure,
      } as unknown as Sensor;
    });

    const alarm = new Alarm();

    alarm.check();

    expect(alarm.isAlarmOn).toBe(false);
  });
});
