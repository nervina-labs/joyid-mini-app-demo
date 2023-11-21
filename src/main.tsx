import React from "react";
import ReactDOM from "react-dom/client";
import {QueryClient, QueryClientProvider} from "react-query";
import {initConfig} from "@joyid/evm";
import App from "./App";

const cacheTime = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime,
    },
  },
});

initConfig({
  name: "JoyID Bot",
  logo: "https://fav.farm/🆔",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
