import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const personalGroup = urlParams.get("personalGroup");

    if (token) {
      // Save to localStorage
      localStorage.setItem("token", token);
      if (personalGroup) {
        localStorage.setItem("personalGroupId", personalGroup);
      }

      // Redirect to main app
      window.location.href = "/";
    } else {
      // No token, redirect to login
      window.location.href = "/";
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#6b7280",
      }}
    >
      Logging you in...
    </div>
  );
};

export default OAuthSuccess;
