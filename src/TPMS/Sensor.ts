export class Sensor {
  public popNextPressurePsiValue(): number {
    const pressureTelemetryValue = this.samplePressure();
    return 16 + pressureTelemetryValue;
  }

  private samplePressure(): number {
    // Simulated hardware: Returns a random number!
    return 6 * Math.random();
  }
}
