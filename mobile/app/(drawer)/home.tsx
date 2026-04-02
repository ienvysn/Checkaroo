import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DrawerHomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const checkPersonalGroup = async () => {
      try {
        const personalId = await AsyncStorage.getItem("personalGroupId");
        if (personalId) {
          router.replace(`/group/${personalId}` as any);
        }
      } catch (err) {
        console.error("Failed to load personal group ID", err);
      }
    };
    checkPersonalGroup();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="chatbubbles-outline" size={64} color="#e5e7eb" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Welcome to Checkaroo</Text>
        <Text style={styles.subtitle}>Swipe right or select a group from the sidebar to get started.</Text>
        
        <TouchableOpacity 
          style={styles.openBtn} 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Text style={styles.openBtnText}>Open Sidebar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  openBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  openBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
