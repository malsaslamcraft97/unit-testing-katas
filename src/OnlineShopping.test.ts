import OnlineShopping from "./OnlineShopping";
import Session from "./Session";
import Cart from "./Cart";
import DeliveryInformation from "./DeliveryInformation";
import { IModelObject } from "./ModelObject";
import Store from "./Store";
import LocationService from "./LocationService";
import Item from "./Item";

// ================================
// STUBS & MOCKS FACTORIES METHODS
// ================================

const createMockDeliveryInfo = (): Partial<DeliveryInformation> => ({
  setType: jest.fn(),
  setPickUpLocation: jest.fn(),
  setTotalWeight: jest.fn(),
});

const createMockSession = (
  mockCart: Partial<Cart> | null,
  mockDeliveryInfo: Partial<DeliveryInformation> | null,
): Partial<Session> => ({
  get: jest.fn((key: string): IModelObject | undefined => {
    if (key === "CART") return mockCart as unknown as IModelObject;
    if (key === "DELIVERY_INFO")
      return mockDeliveryInfo as unknown as IModelObject;
    return undefined;
  }),

  put: jest.fn(),
  saveAll: jest.fn(),
});

const createStubStore = (supportsDrones: boolean): Partial<Store> => ({
  hasDroneDelivery: () => supportsDrones,
  hasItem: () => true,
});

const createStubLocationService = (
  isWithinRange: boolean,
): Partial<LocationService> => ({
  isWithinDeliveryRange: (store: Store, deliveryAddress: string) =>
    isWithinRange,
});

// STUB: Feeds data into the calculation loop
const createStubItem = (
  name: string,
  type: string,
  weight: number,
): Partial<Item> => ({
  getName: () => name,
  getType: () => type,
  getWeight: () => weight,
});

// MOCK & STUB: Provides items to the loop, and records interactions
const createMockCart = (
  initialItems: Partial<Item>[],
  unavailableItems: Partial<Item>[] = [],
): Partial<Cart> => ({
  // STUB capabilities
  getItems: () => initialItems as Item[],
  getUnavailableItems: () => unavailableItems as Item[],

  // MOCK capabilities
  markAsUnavailable: jest.fn(),
  addItem: jest.fn(),
});

// ==================
// THE TESTS
// ==================

describe("OnlineShopping - switchStore Interactions", () => {
  it("switchStore, when store is set to NULL, sets DELIVERY_TYPE to SHIPPING", () => {
    // 1. ARRANGE
    const mockDeliveryInfo = createMockDeliveryInfo();
    const mockSession = createMockSession(null, mockDeliveryInfo);

    const shopping = new OnlineShopping(mockSession as unknown as Session);

    // 2. ACT
    shopping.switchStore(null);

    // 3. ASSERT
    // Did it interact with our DeliveryInfo mock correctly?
    expect(mockDeliveryInfo.setType).toHaveBeenCalledWith("SHIPPING");
    expect(mockDeliveryInfo.setPickUpLocation).toHaveBeenCalledWith(null);

    // Did it save the session?
    expect(mockSession.saveAll).toHaveBeenCalled();
  });

  it("switchStore, when out of delivery range, reverts to pickup at CURRENT_STORE", () => {
    // 1. ARRANGE
    // We create two stores. We don't need names anymore because we assert on the object reference itself.
    const currentStore = createStubStore(false);
    const newStore = createStubStore(false);

    // Force the location service to return FALSE (out of range)
    const stubLocationService = createStubLocationService(false);

    // Set the initial state to HOME_DELIVERY with a valid dummy address
    const mockDeliveryInfo = createMockDeliveryInfo();
    mockDeliveryInfo.getType = () => "HOME_DELIVERY";
    mockDeliveryInfo.getDeliveryAddress = () => "123 Test Ave";

    // Empty cart to bypass the item weight loop for this specific test
    const stubCart: Partial<Cart> = {
      getItems: () => [],
      getUnavailableItems: () => [],
    };

    const mockSession = createMockSession(stubCart, mockDeliveryInfo);

    // Now we must inject the currentStore and locationService into the session's 'get' stub
    mockSession.get = jest.fn((key: string): IModelObject | undefined => {
      if (key === "CART") return stubCart as unknown as IModelObject;
      if (key === "DELIVERY_INFO")
        return mockDeliveryInfo as unknown as IModelObject;
      if (key === "STORE") return currentStore as unknown as IModelObject;
      if (key === "LOCATION_SERVICE")
        return stubLocationService as unknown as IModelObject;
      return undefined;
    });

    const shopping = new OnlineShopping(mockSession as unknown as Session);

    // 2. ACT
    // We try to switch to the new store
    shopping.switchStore(newStore as unknown as Store);

    // 3. ASSERT
    // Because it is out of range, it should change the delivery type to PICKUP
    expect(mockDeliveryInfo.setType).toHaveBeenCalledWith("PICKUP");

    // It should set the pickup location to the OLD store (currentStore), not the new one
    expect(mockDeliveryInfo.setPickUpLocation).toHaveBeenCalledWith(
      currentStore,
    );

    // It should also log the new store in the session
    expect(mockSession.put).toHaveBeenCalledWith("STORE", newStore);
  });

  it("switchStore, when within the range, calculates the weight of cart items and sets PICKUP_LOCATION", () => {
    // 1. ARRANGE
    // Create our test items
    const heavyFridge = createStubItem("Heavy Fridge", "PRODUCT", 50);
    const missingLamp = createStubItem("Out of Stock Lamp", "PRODUCT", 5);

    // Create the Store and override 'hasItem' so it only has the fridge
    const newStore = createStubStore(true);
    newStore.hasItem = (item) => item.getName() === "Heavy Fridge";

    // Set up the Cart double.
    // We must manually pass 'missingLamp' into the unavailable array because our
    // test double doesn't actually contain the internal array logic to do it automatically.
    const mockCart = createMockCart([heavyFridge, missingLamp], [missingLamp]);

    // Set up DeliveryInfo for HOME_DELIVERY
    const mockDeliveryInfo = createMockDeliveryInfo();
    mockDeliveryInfo.getType = () => "HOME_DELIVERY";
    mockDeliveryInfo.getDeliveryAddress = () => "123 Nearby Street";

    // Set LocationService to TRUE (Within range!)
    const stubLocationService = createStubLocationService(true);

    // Build the Session and inject everything
    const mockSession = createMockSession(mockCart, mockDeliveryInfo);
    mockSession.get = jest.fn((key: string): IModelObject | undefined => {
      if (key === "CART") return mockCart as unknown as IModelObject;
      if (key === "DELIVERY_INFO")
        return mockDeliveryInfo as unknown as IModelObject;
      if (key === "LOCATION_SERVICE")
        return stubLocationService as unknown as IModelObject;
      return undefined;
    });

    const shopping = new OnlineShopping(mockSession as unknown as Session);

    // 2. ACT
    shopping.switchStore(newStore as unknown as Store);

    // 3. ASSERT
    // Did it identify the missing lamp and try to mark it?
    expect(mockCart.markAsUnavailable).toHaveBeenCalledWith(missingLamp);

    // Did it correctly subtract the missing item's weight from the total? (50 + 5 - 5 = 50)
    expect(mockDeliveryInfo.setTotalWeight).toHaveBeenCalledWith(50);

    // Did it successfully set the pickup location to the new store?
    expect(mockDeliveryInfo.setPickUpLocation).toHaveBeenCalledWith(newStore);

    // Did it save?
    expect(mockSession.saveAll).toHaveBeenCalled();
  });
});
