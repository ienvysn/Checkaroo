import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActivities } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const decodeTokenPayload = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const rawData =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    return JSON.parse(rawData);
  } catch (e) {
    return null;
  }
};

interface ActivityLogsModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
}

export default function ActivityLogsModal({ visible, onClose, groupId }: ActivityLogsModalProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    if (visible && groupId) {
      fetchLogs();
    }
  }, [visible, groupId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getActivities(groupId);
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityText = (activity: any) => {
    const isCurrentUser = activity.user === currentUserId;
    const userName = isCurrentUser ? "You" : activity.username;

    switch (activity.action) {
      case "added_item":
        return `${userName} added ${activity.itemName}`;
      case "marked_bought":
        return `${userName} marked ${activity.itemName} as bought`;
      case "unmarked_bought":
        return `${userName} unmarked ${activity.itemName}`;
      case "removed_item":
        return `${userName} removed ${activity.itemName}`;
      case "assigned":
        return `${userName} assigned ${activity.itemName}`;
      case "unassigned":
        return `${userName} unassigned ${activity.itemName}`;
      case "edited_item":
        return `${userName} edited ${activity.itemName}`;
      case "created_group":
        return `${userName} created the group`;
      case "joined_group":
        return `${userName} joined the group`;
      case "left_group":
        return `${userName} left the group`;
      case "removed_member":
        return `${userName} removed a member`;
      case "edited_group_name":
        return `${userName} changed the group name`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.logItem}>
      <View style={styles.iconContainer}>
        <Ionicons name="time-outline" size={20} color="#6b7280" />
      </View>
      <View style={styles.logContent}>
        <Text style={styles.logText}>{getActivityText(item)}</Text>
        <Text style={styles.logTime}>{getTimeAgo(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Activity Logs</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No activity recorded yet.</Text>
            </View>
          ) : (
            <FlatList
              data={activities}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9ca3af',
  },
  listContainer: {
    paddingBottom: 20,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 16,
  },
  logText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  logTime: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
});
