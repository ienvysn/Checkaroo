const getStorageKey = (groupId, userId) => {
  return `itemOrder_${groupId}_${userId}`;
};

export const getItemOrder = (groupId, userId) => {
  try {
    const key = getStorageKey(groupId, userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Error loading item order:", err);
    return [];
  }
};

export const saveItemOrder = (groupId, userId, itemIds) => {
  try {
    const key = getStorageKey(groupId, userId);
    localStorage.setItem(key, JSON.stringify(itemIds));
    console.log("Saved order:", itemIds);
  } catch (err) {
    console.error("Error saving item order:", err);
  }
};

export const addItemToOrder = (groupId, userId, itemId, position = "top") => {
  const currentOrder = getItemOrder(groupId, userId);

  const filtered = currentOrder.filter((id) => id !== itemId);

  const newOrder =
    position === "top" ? [itemId, ...filtered] : [...filtered, itemId];

  saveItemOrder(groupId, userId, newOrder);
  return newOrder;
};

export const removeItemFromOrder = (groupId, userId, itemId) => {
  const currentOrder = getItemOrder(groupId, userId);
  const newOrder = currentOrder.filter((id) => id !== itemId);
  saveItemOrder(groupId, userId, newOrder);
  return newOrder;
};

export const applyOrderToItems = (items, orderArray) => {
  const orderMap = new Map(orderArray.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    const orderA = orderMap.has(a._id) ? orderMap.get(a._id) : Infinity;
    const orderB = orderMap.has(b._id) ? orderMap.get(b._id) : Infinity;
    return orderA - orderB;
  });
};
