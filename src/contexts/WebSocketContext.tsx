import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const WebSocketEventContext = createContext<{
  latestEvent: any | null;
  teamMembers: any[];
  setTeamMembers: React.Dispatch<React.SetStateAction<any[]>>;
}>({ 
  latestEvent: null,
  teamMembers: [],
  setTeamMembers: () => {}
});

export const WebSocketEventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [latestEvent, setLatestEvent] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const originalWsRef = useRef<WebSocket | null>(null);
  const supervisorWsRef = useRef<WebSocket | null>(null);

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

    // Supervisor alerts are handled by Notifications.tsx only
    // Don't process them here for teamMembers
    if (latestEvent.type === "supervisor_alert" || latestEvent.type === "supervisor_connected") {
      console.log("Supervisor event received (for notifications only):", latestEvent);
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
  return (
    <WebSocketEventContext.Provider value={{ latestEvent, teamMembers, setTeamMembers }}>
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