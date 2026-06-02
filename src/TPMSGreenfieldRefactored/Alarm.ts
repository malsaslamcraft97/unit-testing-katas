import { Sensor, ISensor } from "./Sensor";

export class Alarm {
  private _sensor: ISensor; // Now relies on the abstraction, not the concrete class
  private _lowPressureThreshold: number = 17;
  private _highPressureThreshold: number = 21;
  private _alarmOn: boolean = false;

  // 2. We use constructor injection, with the real Sensor as a fallback for backward compatibility
  constructor(sensor: ISensor = new Sensor()) {
    this._sensor = sensor;
  }

  public check(): void {
    const psiPressureValue = this._sensor.popNextPressurePsiValue();
    if (
      psiPressureValue < this._lowPressureThreshold ||
      this._highPressureThreshold < psiPressureValue
    ) {
      this._alarmOn = true;
    }
  }

  public get isAlarmOn(): boolean {
    return this._alarmOn;
  }
}
