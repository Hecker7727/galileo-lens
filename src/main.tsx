
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/visual-enhancements.css";
import "./styles/chat-animations.css";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster position="top-right" richColors />
  </>
);  