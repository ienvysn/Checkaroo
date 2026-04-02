import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createGroup } from '../utils/api';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupModal({ visible, onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (name.trim().length < 3) {
      setError('Group name must be at least 3 characters long');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createGroup({ name: name.trim() });
      setName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Group</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Family Shopping List"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError('');
              }}
              autoFocus
            />
            <Text style={styles.helpText}>
              Choose a descriptive name with at least 3 characters. You can invite members after creating the group.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, (!name.trim() || loading) && styles.disabledButton]} 
              onPress={handleCreate} 
              disabled={!name.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden'
  },
  inputContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb'
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 15
  },
  createButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  disabledButton: {
    opacity: 0.6
  }
});
