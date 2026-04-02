import AsyncStorage from '@react-native-async-storage/async-storage';

const getStorageKey = (groupId: string, userId: string) => {
  return `itemOrder_${groupId}_${userId}`;
};

export const getItemOrder = async (groupId: string, userId: string): Promise<string[]> => {
  try {
    const key = getStorageKey(groupId, userId);
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Error loading item order:", err);
    return [];
  }
};

export const saveItemOrder = async (groupId: string, userId: string, itemIds: string[]) => {
  try {
    const key = getStorageKey(groupId, userId);
    await AsyncStorage.setItem(key, JSON.stringify(itemIds));
    console.log("Saved order:", itemIds);
  } catch (err) {
    console.error("Error saving item order:", err);
  }
};

export const addItemToOrder = async (groupId: string, userId: string, itemId: string, position: "top" | "bottom" = "top") => {
  const currentOrder = await getItemOrder(groupId, userId);

  const filtered = currentOrder.filter((id) => id !== itemId);

  const newOrder =
    position === "top" ? [itemId, ...filtered] : [...filtered, itemId];

  await saveItemOrder(groupId, userId, newOrder);
  return newOrder;
};

export const removeItemFromOrder = async (groupId: string, userId: string, itemId: string) => {
  const currentOrder = await getItemOrder(groupId, userId);
  const newOrder = currentOrder.filter((id) => id !== itemId);
  await saveItemOrder(groupId, userId, newOrder);
  return newOrder;
};

export const applyOrderToItems = (items: any[], orderArray: string[]) => {
  const orderMap = new Map(orderArray.map((id, index) => [id, index] as [string, number]));

  return [...items].sort((a, b) => {
    const orderA = orderMap.has(a._id) ? orderMap.get(a._id)! : Infinity;
    const orderB = orderMap.has(b._id) ? orderMap.get(b._id)! : Infinity;
    return orderA - orderB;
  });
};
