import { createRoot } from "react-dom/client";
import { validateEnv } from "./lib/config";
import App from "./App.tsx";
import "./index.css";

// Validate environment variables at startup
validateEnv();

createRoot(document.getElementById("root")!).render(<App />);
