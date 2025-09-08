import React from "react";
import "./App.css";
import Login from "./Login";
import ListComponent from "./component/ListComponent";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="app-container">{token ? <ListComponent /> : <Login />}</div>
  );
}

export default App;
