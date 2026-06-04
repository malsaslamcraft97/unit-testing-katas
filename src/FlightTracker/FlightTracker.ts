// The expected shape of the API response
export interface FlightData {
  flightNumber: string;
  delayMinutes: number;
}

export type FetchAdapter = (flightNumber: string) => Promise<FlightData>;

// Extracted Pure Logic
export function getCalculatedFlightStatus(flightData: FlightData): string {
  let statusMessage = "On Time";
  if (flightData.delayMinutes > 60) {
    statusMessage = "Severely Delayed - Issue Vouchers";
  } else if (flightData.delayMinutes > 0) {
    statusMessage = "Slightly Delayed";
  }
  return statusMessage;
}

export async function startFlightTracker(
  flightNumber: string,
  elementId: string,
  fetchFlight: FetchAdapter,
): Promise<void> {
  try {
    // 1. The Async Fetch (Needs Adapter)
    // Note: Assuming Node 18+ or a browser environment where fetch is global.
    const data = await fetchFlight(flightNumber);

    // 2. The Pure Logic (Needs Extracted Entry Point)
    const statusMessage = getCalculatedFlightStatus(data);

    // 3. The DOM Event/Update (Needs DOM Testing)
    const displayElement = document.getElementById(elementId);
    if (displayElement) {
      displayElement.innerHTML = statusMessage;
    }

    // 4. The Timer (Needs Timer Control)
    setTimeout(() => {
      // void keyword used to explicitly ignore the floating promise in the recursive call
      void startFlightTracker(flightNumber, elementId, fetchFlight);
    }, 60000);
  } catch (error) {
    const displayElement = document.getElementById(elementId);
    if (displayElement) {
      displayElement.innerHTML = "Error fetching flight";
    }
  }
}
