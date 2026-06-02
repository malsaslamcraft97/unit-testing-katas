import { Sensor } from "./Sensor";

export class Alarm {
  private _sensor: Sensor;
  private _lowPressureThreshold: number = 17;
  private _highPressureThreshold: number = 21;
  private _alarmOn: boolean = false;

  constructor() {
    // THE PROBLEM: Hardcoded dependency on a random number generator
    this._sensor = new Sensor();
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
