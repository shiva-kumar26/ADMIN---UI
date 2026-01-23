import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  category: "system" | "user" | "performance" | "security" | "customer-call";
  detailed_scores?: Record<string, number>;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  call_id?: string;
  agent_id?: string;
  extension?: string;
  transcripts?: Array<{
    speaker: string;
    text: string;
    sentiment?: { label: string; score: number };
    timestamp: string;
  }>;
}

export const WebSocketEventContext = createContext<{
  latestEvent: any | null;
  teamMembers: any[];
  setTeamMembers: React.Dispatch<React.SetStateAction<any[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}>({
  latestEvent: null,
  teamMembers: [],
  setTeamMembers: () => { },
  notifications: [],
  setNotifications: () => { },
  markAsRead: () => { },
  deleteNotification: () => { },
  clearAllNotifications: () => { },
});

export const WebSocketEventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [latestEvent, setLatestEvent] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Initialize notifications from localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem("admin_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load notifications from storage", error);
      return [];
    }
  });

  const { toast } = useToast();

  // Persist notifications whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("admin_notifications", JSON.stringify(notifications));
      console.log("[WS Context] Persisted notifications:", notifications.length);
    } catch (error) {
      console.error("Failed to save notifications to storage", error);
    }
  }, [notifications]);

  const originalWsRef = useRef<WebSocket | null>(null);
  const supervisorWsRef = useRef<WebSocket | null>(null);

  // Track processed alerts to prevent duplicates and side-effects in render
  const processedAlertsRef = useRef<Set<string>>(new Set());

  /* -------------------------------------------------
   *  ORIGINAL AGENT WebSocket (team status, calls…)
   * ------------------------------------------------- */
  useEffect(() => {
    originalWsRef.current = new WebSocket("wss://10.16.7.96:5050");

    originalWsRef.current.onopen = () => {
      console.log("[Original WebSocket] Connected");
    };

    originalWsRef.current.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        console.log("[Original Event] Received:", data);
        setLatestEvent(data);
      } catch (err) {
        console.error("Invalid Original WebSocket data", err);
      }
    };

    originalWsRef.current.onclose = () => {
      console.log("[Original WebSocket] Disconnected");
    };

    return () => {
      console.log("[Original WebSocket] Cleaning up");
      originalWsRef.current?.close();
    };
  }, []);

  /* -------------------------------------------------
   *  SUPERVISOR WebSocket (alerts only)
   * ------------------------------------------------- */
  useEffect(() => {
    // Read supervisor ID from sessionStorage where AuthContext stores it
    const getStoredSupervisorId = () => {
      try {
        const loginDetails = sessionStorage.getItem("loginDetails");
        if (loginDetails) {
          const user = JSON.parse(loginDetails);
          console.log("[DEBUG] Parsed user from sessionStorage:", user);
          return user.user_id?.toLowerCase() || "supervisorone";
        }
      } catch (error) {
        console.error("[ERROR] Failed to read supervisor ID:", error);
      }
      return "supervisorone";
    };
    const supervisorId = getStoredSupervisorId();
    console.log(`[DEBUG] Connecting WebSocket as supervisor: ${supervisorId}`);
    const wsUrl = `wss://10.16.7.130:2700/transcripts/${supervisorId}`;
    supervisorWsRef.current = new WebSocket(wsUrl);
    supervisorWsRef.current.onopen = () => {
      console.log(`[Supervisor WebSocket] Connected as ${supervisorId}`);
    };
    supervisorWsRef.current.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        console.log("[Supervisor Event] Received:", data);
        // Always set the event, regardless of type
        setLatestEvent(data);
      } catch (err) {
        console.error("Invalid Supervisor WebSocket data", err);
      }
    };
    supervisorWsRef.current.onclose = () => {
      console.log(`[Supervisor WebSocket] Disconnected for ${supervisorId}`);
    };
    return () => {
      console.log(`[Supervisor WebSocket] Cleaning up for ${supervisorId}`);
      supervisorWsRef.current?.close();
    };
  }, []); // Run once on mount

  /* -------------------------------------------------
   *  TEAM MEMBERS STATE UPDATE (for agent events)
   * ------------------------------------------------- */
  useEffect(() => {
    if (!latestEvent) return;

    // Supervisor alerts are handled within this Effect now
    if (latestEvent.type === "supervisor_alert") {
      console.log("Supervisor event received:", latestEvent);

      let title = "Continuous Negative Tone Detected";
      let message = latestEvent.reason || "Negative tone detected";
      let priority: "low" | "medium" | "high" = "high";

      // Check if this is QA alert
      if (latestEvent.alert_category === "qa_analysis") {
        title = "Low QA Score Detected";
        message = `QA Score: ${latestEvent.qa_score}/100 — Supervisor review required.`;
        priority = "high";
      }

      // Unique ID for the alert event
      const alertId = latestEvent.call_id;

      console.log("[WS Context] Checking duplicate for ID:", alertId);

      // Check if we already processed this alert ID recently
      if (processedAlertsRef.current.has(alertId)) {
        console.log("[WS Context] Duplicate alert ignored:", alertId);
        return;
      }

      // Add to processed set
      processedAlertsRef.current.add(alertId);

      // Cleanup old alerts from ref after 10 seconds to allow re-alerting if needed later
      setTimeout(() => {
        processedAlertsRef.current.delete(alertId);
      }, 10000);

      console.log("[WS Context] Processing new alert. Triggering Toast...");

      // Trigger global toast (Side effect is safe here)
      if (latestEvent.alert_category === "qa_analysis") {
        toast({
          title: "QA Alert",
          description: `Low QA Score Detected for call ${latestEvent.call_id}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Supervisor Alert",
          description: `Negative tone in call ${latestEvent.call_id}`,
          variant: "destructive",
        });
      }

      const newNotification: Notification = {
        id: `${latestEvent.call_id}-${Date.now()}`,
        type: "warning",
        category: "customer-call",
        title,
        message,
        timestamp: latestEvent.timestamp || new Date().toISOString(),
        read: false,
        priority,
        call_id: latestEvent.call_id,
        agent_id: latestEvent.agent_id,
        extension: latestEvent.extension,
        transcripts: latestEvent.transcripts || [],
        detailed_scores: {
          qa_score: latestEvent.qa_score,
          ...(latestEvent.detailed_scores || {})
        },
      };

      console.log("[WS Context] calling setNotifications with:", newNotification);

      setNotifications((prev) => {
        console.log("[WS Context] Updater running. Previous count:", prev.length);
        return [newNotification, ...prev];
      });
      return;
    }

    if (latestEvent.type === "supervisor_connected") {
      return;
    }

    const {
      Event,
      EventType,
      Agent,
      Status,
      Username,
      From,
      Event: CallEvent,
    } = latestEvent;

    console.log("Processing agent event for teamMembers:", latestEvent);
    console.log("Current teamMembers count:", teamMembers.length);

    setTeamMembers((prev) => {
      if (prev.length === 0) {
        console.warn("teamMembers is empty - skipping update");
        return prev;
      }

      return prev.map((member) => {
        const extension = member.extension;

        // Register / UnRegister
        if (Event === "Register" && Username === extension) {
          console.log(`✅ Agent ${extension} registered - setting to Available`);
          return { ...member, status: "Available" };
        }
        if (Event === "UnRegister" && Username === extension) {
          console.log(`❌ Agent ${extension} unregistered - setting to Logged Out`);
          return { ...member, status: "Logged Out" };
        }

        // Agent status change
        if (
          Event === "Agent-Status" &&
          extension &&
          Agent?.startsWith(extension)
        ) {
          console.log(`🔄 Agent ${extension} status changed to ${Status}`);
          return { ...member, status: Status };
        }

        // Call events
        if (EventType === "CALL_EVENT" && From === extension) {
          if (CallEvent === "CHANNEL_ANSWER") {
            console.log(`📞 Agent ${extension} answered call - setting to On Call`);
            return { ...member, status: "On Call" };
          }
          if (CallEvent === "CHANNEL_HANGUP") {
            console.log(`📴 Agent ${extension} hung up - setting to Available`);
            return { ...member, status: "Available" };
          }
        }

        return member;
      });
    });
  }, [latestEvent, teamMembers.length]);

  /* -------------------------------------------------
   *  PROVIDER - Export latestEvent, teamMembers AND setTeamMembers
   * ------------------------------------------------- */

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === String(id) ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  /* -------------------------------------------------
   *  PROVIDER
   * ------------------------------------------------- */
  return (
    <WebSocketEventContext.Provider
      value={{
        latestEvent,
        teamMembers,
        setTeamMembers,
        notifications,
        setNotifications,
        markAsRead,
        deleteNotification,
        clearAllNotifications
      }}
    >
      {children}
    </WebSocketEventContext.Provider>
  );
};

/* -------------------------------------------------
 *  Helper hook for consumers
 * ------------------------------------------------- */
export const useWebSocketEvent = () => {
  const ctx = useContext(WebSocketEventContext);
  if (!ctx) {
    throw new Error(
      "useWebSocketEvent must be used within a WebSocketEventProvider"
    );
  }
  return ctx;
};