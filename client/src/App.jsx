import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";
import ListComponent from "./component/ListComponent";
import ResetPasswordPage from "./ResetPasswordPage";
import InviteConfirmModal from "./modal/InviteConfirmModal";
import { ToastProvider } from "./Toast";

function App() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  const [currentPage, setCurrentPage] = useState(""); // Track current page
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Check if this is a reset password page
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    if (resetToken) {
      setCurrentPage("reset-password");
      return;
    }

    // Check if this is OAuth callback
    const oauthToken = urlParams.get("token");
    const personalGroup = urlParams.get("personalGroup");

    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      if (personalGroup) {
        localStorage.setItem("personalGroupId", personalGroup);
      }
      window.history.replaceState({}, "", "/");
      window.location.reload();
      return;
    }

    // Check for invite token
    const urlInviteToken = urlParams.get("inviteToken");

    if (urlInviteToken && token) {
      setInviteToken(urlInviteToken);
      setShowInviteModal(true);
    }

    setCurrentPage("main");
  }, [token]);

  const handleJoinSuccess = (groupInfo) => {
    const url = new URL(window.location);
    url.searchParams.delete("inviteToken");
    window.history.replaceState({}, "", url);

    console.log("Successfully joined group:", groupInfo.name);
    window.location.reload();
  };

  // Show reset password page if reset token in URL
  if (currentPage === "reset-password") {
    return (
      <ToastProvider>
        <ResetPasswordPage />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="app-container">
        {token ? <ListComponent /> : <Login />}

        <InviteConfirmModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          inviteToken={inviteToken}
          onJoinSuccess={handleJoinSuccess}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
