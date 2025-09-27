import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";
import ListComponent from "./component/ListComponent";
import InviteConfirmModal from "./InviteConfirmModal";
import { ToastProvider } from "./Toast";

function App() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Check for invite token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlInviteToken = urlParams.get("inviteToken");

    if (urlInviteToken && token) {
      // User is logged in and has invite token show modal
      setInviteToken(urlInviteToken);
      setShowInviteModal(true);
    }
  }, [token]);

  const handleJoinSuccess = (groupInfo) => {
    const url = new URL(window.location);
    url.searchParams.delete("inviteToken");
    window.history.replaceState({}, "", url);

    console.log("Successfully joined group:", groupInfo.name);

    // Refresh the page to update the groups list
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
