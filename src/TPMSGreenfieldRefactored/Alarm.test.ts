import { Alarm } from "./Alarm";
import { ISensor } from "./Sensor";

describe("Tire Pressure Alarm (Greenfield Abstraction)", () => {
  it("Alarm_WhenPressureIsBelowThreshold_TurnsAlarmOn", () => {
    // 1. ARRANGE
    // We create a simple, lightweight stub that satisfies the ISensor interface
    const stubSensor: ISensor = {
      popNextPressurePsiValue: () => 16, // Below threshold
    };

    // We inject our stub cleanly through the constructor
    const alarm = new Alarm(stubSensor);

    // 2. ACT
    alarm.check();

    // 3. ASSERT
    expect(alarm.isAlarmOn).toBe(true);
  });

  it("Alarm_WhenPressureIsWithinNormalRange_DoesNotTurnAlarmOn", () => {
    const stubSensor: ISensor = {
      popNextPressurePsiValue: () => 19, // Normal range
    };

    const alarm = new Alarm(stubSensor);

    alarm.check();

    expect(alarm.isAlarmOn).toBe(false);
  });
});
