import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import store from "./store";
import App from "./App";
import "./styles/globals.css";

// Quick startup log to help debug blank-screen issues
console.log("src/main.jsx — app starting");

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <Provider store={store}>
    <App />
  </Provider>
);
