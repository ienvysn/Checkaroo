import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getItems, updateItem, deleteItem, addItem } from "../../utils/api";

type Item = {
  _id: string;
  name: string;
  quantity: number;
  isComplete: boolean;
  assignedTo?: any;
};

export default function GroupListScreen() {
  const { id } = useLocalSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [id]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems(id);
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: Item) => {
    try {
      // Optimistic update
      setItems(items.map(i => i._id === item._id ? { ...i, isComplete: !i.isComplete } : i));
      await updateItem(id, item._id, { isComplete: !item.isComplete });
    } catch (err) {
      console.error("Failed to update item:", err);
      fetchItems(); // Revert on failure
    }
  };

  const handleAdd = async () => {
    if (!newItemName.trim()) return;
    setIsAdding(true);
    try {
      const res = await addItem(id, {
        name: newItemName.trim(),
        quantity: parseInt(newItemQuantity) || 1
      });
      setItems([res.data, ...items]);
      setIsAddModalVisible(false);
      setNewItemName("");
      setNewItemQuantity("1");
    } catch (err) {
      console.error("Failed to add item:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={[styles.itemCard, item.isComplete && styles.itemCardCompleted]}>
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => toggleItem(item)}
      >
        <View style={[styles.checkbox, item.isComplete && styles.checkboxChecked]}>
          {item.isComplete && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.isComplete && styles.itemTextCompleted]}>
          {item.name}
        </Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "List Items" }} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>This list is empty.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              style={[styles.addButton, isAdding && styles.addButtonDisabled]}
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
    paddingBottom: 24,
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
});
