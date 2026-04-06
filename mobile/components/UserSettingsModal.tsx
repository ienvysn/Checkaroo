import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUserProfile, updateUserProfile } from "../utils/api";
import ChangePasswordModal from "./ChangePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";
import { Toast } from "./Toast";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
};

export default function UserSettingsModal({ visible, onClose, onAccountDeleted }: Props) {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (visible) {
      fetchUserProfile();
    }
  }, [visible]);

  useEffect(() => {
    if (user) {
      const changed = username !== user.username || email !== user.email;
      setHasChanges(changed);
    }
  }, [username, email, user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUserProfile();
      setUser(response.data);
      setUsername(response.data.username);
      setEmail(response.data.email);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    setError("");
    try {
      const response = await updateUserProfile({
        username: username.trim(),
        email: email.trim(),
      });
      setUser(response.data);
      setHasChanges(false);
      setToastMessage("Profile updated successfully!");
      setToastVisible(true);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setHasChanges(false);
    }
    onClose();
  };

  const handlePasswordChanged = () => {
    setToastMessage("Password changed successfully!");
    setToastVisible(true);
    setIsPasswordModalOpen(false);
  };

  const isOAuthAccount = user?.authProvider !== "local";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Account Settings</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4f46e5" style={{ marginVertical: 40 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Profile Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Information</Text>

                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  editable={!saving}
                />

                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[styles.input, isOAuthAccount && styles.inputDisabled]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  editable={!saving && !isOAuthAccount}
                />
                {isOAuthAccount && (
                  <Text style={styles.helpText}>
                    Email cannot be changed for Google accounts
                  </Text>
                )}

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value="••••••••"
                    secureTextEntry
                    editable={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.changePasswordBtn,
                      isOAuthAccount && styles.changePasswordBtnDisabled,
                    ]}
                    onPress={() => setIsPasswordModalOpen(true)}
                    disabled={isOAuthAccount}
                  >
                    <Text style={styles.changePasswordText}>Change</Text>
                  </TouchableOpacity>
                </View>
                {isOAuthAccount && (
                  <Text style={styles.helpText}>
                    Password management not available for Google accounts
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              {/* Account Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Member since:</Text>
                  <Text style={styles.infoValue}>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Loading..."}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Danger Zone */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>⚠️ Danger Zone</Text>
                <Text style={styles.dangerDescription}>
                  Once you delete your account, there is no going back. Please be certain.
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setIsDeleteModalOpen(true)}
                >
                  <Text style={styles.deleteBtnText}>Delete Account</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.spacer} />
            </ScrollView>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!hasChanges || saving) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ChangePasswordModal
          visible={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={handlePasswordChanged}
        />

        <DeleteAccountModal
          visible={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            onAccountDeleted();
          }}
          isOAuthAccount={isOAuthAccount}
        />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type="success"
          onHide={() => setToastVisible(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16,
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
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
  },
  inputDisabled: {
    backgroundColor: "#e5e7eb",
    color: "#6b7280",
  },
  helpText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: -12,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  changePasswordBtn: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: "center",
  },
  changePasswordBtnDisabled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  changePasswordText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  dangerTitle: {
    color: "#dc2626",
  },
  dangerDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
  spacer: {
    height: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#c7d2fe",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
