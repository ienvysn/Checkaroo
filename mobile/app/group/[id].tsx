import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
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
});
