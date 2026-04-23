import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";

import ActivityLogsModal from "../../../components/ActivityLogsModal";
import { getItems, updateItem, deleteItem, addItem, getGroupById } from "../../../utils/api";
import {
  getItemOrder,
  saveItemOrder,
  addItemToOrder,
  removeItemFromOrder,
  applyOrderToItems,
} from "../../../utils/itemOrderStorage";

type Item = {
  _id: string;
  name: string;
  quantity: number;
  isComplete: boolean;
  assignedTo?: any;
};

// Polyfill atob if not available globally in hermes, though usually provided by Expo
const decodeTokenPayload = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // basic base64 decode for ascii
    const rawData =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    return JSON.parse(rawData);
  } catch (e) {
    return null;
  }
};

export default function GroupListScreen() {
  const { id } = useLocalSearchParams();
  const groupId = typeof id === "string" ? id : id[0];

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [group, setGroup] = useState<any>(null);

  // Add Item State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [isAdding, setIsAdding] = useState(false);

  // Edit Item State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("1");
  const [isEditingState, setIsEditingState] = useState(false);

  // Activity Modal State
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const payload = decodeTokenPayload(token);
        if (payload?.id) setCurrentUserId(payload.id);
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchItems();
      fetchGroup();
    }
  }, [groupId, currentUserId]);

  const fetchGroup = async () => {
    try {
      const res = await getGroupById(groupId);
      setGroup(res.data);
    } catch (err) {
      console.error("Failed to fetch group details:", err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems(groupId);
      if (currentUserId) {
        const savedOrder = await getItemOrder(groupId, currentUserId);
        const orderedItems = applyOrderToItems(res.data, savedOrder);
        setItems(orderedItems);
      } else {
        setItems(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: Item) => {
    try {
      const newComplete = !item.isComplete;
      
      // Gamification: Haptic feedback
      if (newComplete) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, isComplete: newComplete } : i
        )
      );
      await updateItem(groupId, item._id, { isComplete: newComplete });

      if (currentUserId) {
        if (newComplete) {
          // Marking complete - usually removes from active order or pushes to bottom
          await removeItemFromOrder(groupId, currentUserId, item._id);
        } else {
          // Marking incomplete - bring to top
          await addItemToOrder(groupId, currentUserId, item._id, "top");
        }
      }
    } catch (err) {
      console.error("Failed to update item:", err);
      fetchItems(); // Revert on failure
    }
  };

  const handleAdd = async () => {
    if (!newItemName.trim()) return;
    setIsAdding(true);
    try {
      const res = await addItem(groupId, {
        name: newItemName.trim(),
        quantity: parseInt(newItemQuantity) || 1,
      });

      // Gamification: Haptic feedback on add
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let updatedList = [res.data, ...items];

      if (currentUserId) {
        const newOrder = await addItemToOrder(
          groupId,
          currentUserId,
          res.data._id,
          "top"
        );
        updatedList = applyOrderToItems(updatedList, newOrder);
      }

      setItems(updatedList);
      setIsAddModalVisible(false);
      setNewItemName("");
      setNewItemQuantity("1");
    } catch (err) {
      console.error("Failed to add item:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditPress = (item: Item) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemQuantity(item.quantity.toString());
    setIsEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!editingItem || !editItemName.trim()) return;
    setIsEditingState(true);
    try {
      const res = await updateItem(groupId, editingItem._id, {
        name: editItemName.trim(),
        quantity: parseInt(editItemQuantity) || 1,
      });
      setItems((prev) =>
        prev.map((i) => (i._id === editingItem._id ? res.data : i))
      );
      setIsEditModalVisible(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to edit item:", err);
    } finally {
      setIsEditingState(false);
    }
  };

  const handleDeletePress = (item: Item) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setItems((prev) => prev.filter((i) => i._id !== item._id));
              await deleteItem(groupId, item._id);
              if (currentUserId) {
                await removeItemFromOrder(groupId, currentUserId, item._id);
              }
            } catch (err) {
              console.error("Failed to delete item:", err);
              fetchItems();
            }
          },
        },
      ]
    );
  };

  const onDragEnd = async ({ data }: { data: Item[] }) => {
    setItems(data);
    if (currentUserId) {
      const newOrder = data.map((i) => i._id);
      await saveItemOrder(groupId, currentUserId, newOrder);
    }
  };

  const renderRightActions = () => (
    <View style={styles.swipeAction}>
      <Ionicons name="checkmark-done-circle" size={32} color="#fff" />
    </View>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => (
    <ScaleDecorator>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={(direction) => {
          toggleItem(item);
        }}
        containerStyle={{ overflow: "visible" }}
      >
        <View
          style={[
            styles.itemCard,
            item.isComplete && styles.itemCardCompleted,
            isActive && styles.itemCardActive,
          ]}
        >
          <TouchableOpacity
            onLongPress={drag}
            delayLongPress={50}
            style={styles.dragHandle}
          >
            <Ionicons name="reorder-two" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleItem(item)}
          >
            <View
              style={[
                styles.checkbox,
                item.isComplete && styles.checkboxChecked,
              ]}
            >
              {item.isComplete && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.itemInfo}>
            <Text
              style={[
                styles.itemName,
                item.isComplete && styles.itemTextCompleted,
              ]}
            >
              {item.name}
            </Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditPress(item)}
            >
              <Ionicons name="pencil" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePress(item)}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
    </ScaleDecorator>
  );

  const handleShare = async () => {
    if (!group || !group.inviteToken) return;
    try {
      const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://checkaroo.onrender.com';
      await Share.share({
        message: `Join my Checkaroo group!\n\nInvite Code: ${group.inviteToken}\nLink: ${webUrl}/?inviteToken=${group.inviteToken}`,
      });
    } catch (error) {
      console.error("Error sharing invite:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title: group?.name || "List Items",
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => setIsActivityModalVisible(true)} style={{ marginRight: 15 }}>
                <Ionicons name="time-outline" size={24} color="#6b7280" />
              </TouchableOpacity>
              {group?.inviteToken ? (
                <TouchableOpacity onPress={handleShare} style={{ marginRight: 15 }}>
                  <Ionicons name="share-social-outline" size={24} color="#4f46e5" />
                </TouchableOpacity>
              ) : null}
            </View>
          )
        }} 
      />
      <View style={styles.content}>
        {loading && items.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#4f46e5"
            style={{ marginTop: 40 }}
          />
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>This list is empty.</Text>
          </View>
        ) : (
          <DraggableFlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            onDragEnd={onDragEnd}
            containerStyle={{ flex: 1 }}
            contentContainerStyle={styles.listContainer}
            activationDistance={15}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Item</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apples"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              keyboardType="numeric"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
            />

            <TouchableOpacity
              style={[
                styles.addButton,
                isAdding && styles.addButtonDisabled,
              ]}
              onPress={handleAdd}
              disabled={isAdding || !newItemName.trim()}
            >
              {isAdding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Add Item</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apples"
              value={editItemName}
              onChangeText={setEditItemName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              keyboardType="numeric"
              value={editItemQuantity}
              onChangeText={setEditItemQuantity}
            />

            <TouchableOpacity
              style={[
                styles.addButton,
                isEditingState && styles.addButtonDisabled,
              ]}
              onPress={handleEditSave}
              disabled={isEditingState || !editItemName.trim()}
            >
              {isEditingState ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Activity Logs Modal */}
      <ActivityLogsModal 
        visible={isActivityModalVisible} 
        onClose={() => setIsActivityModalVisible(false)} 
        groupId={groupId as string} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 80, // give space for FAB
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 16,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardCompleted: {
    opacity: 0.6,
  },
  itemCardActive: {
    shadowOpacity: 0.2,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  dragHandle: {
    marginRight: 12,
    justifyContent: "center",
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  itemTextCompleted: {
    textDecorationLine: "line-through",
    color: "#6b7280",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4f46e5",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9fafb",
  },
  addButton: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  swipeAction: {
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    marginBottom: 12,
    borderRadius: 12,
    flex: 1,
  },
});
