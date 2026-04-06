import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInviteInfo, joinGroup } from '../utils/api';

interface JoinGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinGroupModal({ visible, onClose, onSuccess }: JoinGroupModalProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [groupInfo, setGroupInfo] = useState<any>(null);

  const extractToken = (input: string) => {
    // Attempt to extract token from URL if users paste a full Checkaroo link
    const inviteParamPattern = /[?&]inviteToken=([a-zA-Z0-9-]+)/;
    const pathPattern = /\/invite\/([a-zA-Z0-9-]+)/;
    
    let match = input.match(inviteParamPattern);
    if (match) return match[1];
    
    match = input.match(pathPattern);
    return match ? match[1] : input.trim();
  };

  const handlePreview = async () => {
    const rawToken = extractToken(tokenInput);
    if (!rawToken) {
      setError('Please enter a valid invite code or link');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await getInviteInfo(rawToken);
      setGroupInfo(res.data.group);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid invite link or token');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!groupInfo) return;
    setJoining(true);
    setError('');
    try {
      await joinGroup(groupInfo._id);
      handleSuccess();
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message === "Already a member") {
        handleSuccess();
      } else {
        setError(err.response?.data?.message || 'Failed to join group');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleSuccess = () => {
    setTokenInput('');
    setGroupInfo(null);
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    setTokenInput('');
    setGroupInfo(null);
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Join a Group</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!groupInfo ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Invite Code or Link</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Paste code or link here"
                  value={tokenInput}
                  onChangeText={(text) => {
                    setTokenInput(text);
                    if (error) setError('');
                  }}
                  autoFocus
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, (!tokenInput.trim() || loading) && styles.disabledButton]} 
                  onPress={handlePreview} 
                  disabled={!tokenInput.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>Preview</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.groupInfoContainer}>
                 <View style={[styles.groupIconContainer, { backgroundColor: '#e0e7ff' }]}>
                    <Ionicons name="people" size={32} color="#4f46e5" />
                 </View>
                 <Text style={styles.groupName}>{groupInfo.name}</Text>
                 <Text style={styles.groupMembers}>
                   {groupInfo.members?.length || 0} member{(groupInfo.members?.length || 0) !== 1 ? 's' : ''}
                 </Text>
                 <Text style={styles.inviteMessage}>
                   You have been invited to join this group. You will be able to view and manage shared lists with other members.
                 </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setGroupInfo(null)} disabled={joining}>
                  <Text style={styles.cancelButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, joining && styles.disabledButton]} 
                  onPress={handleJoin} 
                  disabled={joining}
                >
                  {joining ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>Join Group</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
  groupInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  groupIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  groupMembers: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12
  },
  inviteMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20
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
  actionButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  disabledButton: {
    opacity: 0.6
  }
});
