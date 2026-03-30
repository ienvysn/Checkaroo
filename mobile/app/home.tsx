import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getGroups } from "../utils/api";

type Group = {
  _id: string;
  name: string;
  isPersonal?: boolean;
  members: any[];
};

export default function HomeScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("personalGroupId");
    router.replace("/"); // Go back to login
  };

  const personalGroup = groups.find((g) => g.isPersonal);
  const sharedGroups = groups.filter((g) => !g.isPersonal);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Checkaroo",
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>Select a group to see your shared lists.</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
        ) : groups.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Ionicons name="list" size={64} color="#e5e7eb" />
            <Text style={styles.placeholderText}>Your lists will appear here.</Text>
            <TouchableOpacity style={styles.createBtn}>
              <Text style={styles.createBtnText}>Create New Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {personalGroup && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal</Text>
                <TouchableOpacity 
                  style={styles.groupCard}
                  onPress={() => router.push(`/group/${personalGroup._id}` as any)}
                >
                  <View style={styles.groupIconContainer}>
                    <Ionicons name="person" size={24} color="#4f46e5" />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{personalGroup.name}</Text>
                    <Text style={styles.groupMembers}>Just you</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            )}

            {sharedGroups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shared Groups</Text>
                {sharedGroups.map((group) => (
                  <TouchableOpacity 
                    key={group._id} 
                    style={styles.groupCard}
                    onPress={() => router.push(`/group/${group._id}` as any)}
                  >
                    <View style={[styles.groupIconContainer, { backgroundColor: '#e0e7ff' }]}>
                      <Ionicons name="people" size={24} color="#4f46e5" />
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupMembers}>{group.members?.length || 1} members</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <TouchableOpacity style={[styles.createBtn, { marginTop: 16 }]}>
              <Text style={styles.createBtnText}>Create New Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 24,
  },
  logoutBtn: {
    marginRight: 16,
  },
  welcomeCard: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 64,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 16,
    marginBottom: 24,
  },
  createBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  createBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  groupsContainer: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: "#6b7280",
  },
});
