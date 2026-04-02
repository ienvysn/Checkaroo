import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroups } from '../utils/api';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';

type Group = {
  _id: string;
  name: string;
  isPersonal?: boolean;
  members: any[];
};

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setJoinModalVisible] = useState(false);

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

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("personalGroupId");
    router.replace("/");
  };

  const personalGroup = groups.find((g) => g.isPersonal);
  const sharedGroups = groups.filter((g) => !g.isPersonal);

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Checkaroo</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#4f46e5" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.groupsContainer}>
            {personalGroup && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal</Text>
                <TouchableOpacity 
                  style={styles.drawerItem}
                  onPress={() => router.push(`/group/${personalGroup._id}` as any)}
                >
                  <Ionicons name="person-outline" size={20} color="#4b5563" style={styles.itemIcon} />
                  <Text style={styles.itemText}>{personalGroup.name}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shared Groups</Text>
              {sharedGroups.length === 0 ? (
                <Text style={styles.emptyText}>No shared groups</Text>
              ) : (
                sharedGroups.map((group) => (
                  <TouchableOpacity 
                    key={group._id} 
                    style={styles.drawerItem}
                    onPress={() => router.push(`/group/${group._id}` as any)}
                  >
                    <Ionicons name="people-outline" size={20} color="#4b5563" style={styles.itemIcon} />
                    <Text style={styles.itemText}>{group.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => setCreateModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#4f46e5" style={styles.footerIcon} />
          <Text style={styles.footerButtonText}>Create Group</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton} onPress={() => setJoinModalVisible(true)}>
          <Ionicons name="enter-outline" size={20} color="#4f46e5" style={styles.footerIcon} />
          <Text style={styles.footerButtonText}>Join Group</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={styles.footerIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <CreateGroupModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={fetchGroups}
      />
      <JoinGroupModal
        visible={isJoinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        onSuccess={fetchGroups}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  groupsContainer: { paddingHorizontal: 12 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 8,
    marginBottom: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  itemIcon: { marginRight: 12 },
  itemText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  emptyText: { fontSize: 14, color: '#9ca3af', paddingHorizontal: 12, fontStyle: 'italic' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
    paddingBottom: 32,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerIcon: { marginRight: 12 },
  footerButtonText: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: { fontSize: 16, color: '#ef4444', fontWeight: '600' },
});
