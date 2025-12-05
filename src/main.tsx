import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WebSocketEventProvider } from './contexts/WebSocketContext.tsx';

createRoot(document.getElementById("root")!).render

(
<WebSocketEventProvider>
<App />
</WebSocketEventProvider>
);
