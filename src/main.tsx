import React from "react";
import ReactDOM from "react-dom/client";
import {initConfig} from "@joyid/evm";
import App from "./App";
import "./index.css";

initConfig({
  name: "JoyID demo",
  logo: "https://fav.farm/🆔",
  joyidAppURL: "https://testnet.joyid.dev",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
