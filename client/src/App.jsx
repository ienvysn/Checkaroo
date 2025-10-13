import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";
import ListComponent from "./component/ListComponent";
import InviteConfirmModal from "./modal/InviteConfirmModal";
import { ToastProvider } from "./Toast";

function App() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Check if this is OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get("token");
    const personalGroup = urlParams.get("personalGroup");

    if (oauthToken) {
      // OAuth success - save token and reload
      localStorage.setItem("token", oauthToken);
      if (personalGroup) {
        localStorage.setItem("personalGroupId", personalGroup);
      }
      // Clean URL and reload
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
  }, [token]);

  const handleJoinSuccess = (groupInfo) => {
    const url = new URL(window.location);
    url.searchParams.delete("inviteToken");
    window.history.replaceState({}, "", url);

    console.log("Successfully joined group:", groupInfo.name);
    window.location.reload();
  };

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
