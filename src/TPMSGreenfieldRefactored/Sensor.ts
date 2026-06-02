// 1. We create the abstraction
export interface ISensor {
  popNextPressurePsiValue(): number;
}

export class Sensor implements ISensor {
  public popNextPressurePsiValue(): number {
    const pressureTelemetryValue = this.samplePressure();
    return 16 + pressureTelemetryValue;
  }

  private samplePressure(): number {
    return 6 * Math.random();
  }
}
