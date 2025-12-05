import React, { useState, useCallback, useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Trash2,
  Settings as SettingsIcon,
  Users,
  Activity,
  Server,
  Phone,
  FileText,
  X,
  Headphones,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WebSocketEventContext } from "@/contexts/WebSocketContext";
import { Value } from "@radix-ui/react-select";

interface Notification {
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

const Notifications = () => {
  const { toast } = useToast();
  const { latestEvent } = useContext(WebSocketEventContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    performanceAlerts: true,
    securityAlerts: true,
    userActivityAlerts: false,
  });

  // Transcript Modal State
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreDetails, setScoreDetails] = useState<any>(null);

  const getAlertSeverity = (score?: number | null) => {
    if (typeof score !== "number" || Number.isNaN(score)) return null;

    if (score < 50) {
      return {
        level: "critical",
        color: "bg-red-50 border-red-300 text-red-700",
        label: "Critical Alert",
        message: "Supervisor must review this call immediately.",
      };
    }

    if (score > 50) {
      return {
        level: "warning",
        color: "bg-yellow-50 border-yellow-300 text-yellow-700",
        label: "Warning Alert",
        message: "Supervisor review recommended.",
      };
    }

    return null;
  };


  const openScoreModal = (scores: any) => {
  setScoreDetails(scores);
  setShowScoreModal(true);
};

  const [modalTranscripts, setModalTranscripts] = useState<
    Array<{
      speaker: string;
      text: string;
      sentiment?: { label: string; score: number };
      timestamp: string;
    }>
  >([]);
  const [modalTitle, setModalTitle] = useState<string>("");

  const openTranscriptModal = useCallback((transcripts: any[], title: string) => {
    setModalTranscripts(transcripts);
    setModalTitle(title);
    setShowTranscriptModal(true);
  }, []);

  const handleJoinCall = useCallback(
    (callId: string) => {
      toast({
        title: "Joining Call...",
        description: `Connecting to call ${callId}...`,
      });
      console.log("Joining call:", callId);
    },
    [toast]
  );

  // WebSocket: Listen for supervisor_alert
// WebSocket: Listen for supervisor_alert
useEffect(() => {
  if (!latestEvent || latestEvent.type !== "supervisor_alert") return;

  let title = "Continuous Negative Tone Detected";
  let message = latestEvent.reason || "Negative tone detected";
  let priority: "low" | "medium" | "high" = "high";

  // 🔥 Check if this is QA alert
  if (latestEvent.alert_category === "qa_analysis") {
    title = "Low QA Score Detected";
    message = `QA Score: ${latestEvent.qa_score}/100 — Supervisor review required.`;
    priority = "high";
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
    qa_score: latestEvent.qa_score,   // ⭐ ADD THIS
  ...(latestEvent.detailed_scores || {})
},

  };

  setNotifications((prev) => {
    const exists = prev.some(
      (n) =>
        n.call_id === newNotification.call_id &&
        Math.abs(
          new Date(n.timestamp).getTime() - new Date(newNotification.timestamp).getTime()
        ) < 5000
    );
    if (exists) return prev;
    return [newNotification, ...prev];
  });

  // ✅ FIX: Proper popup based on alert type
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

}, [latestEvent, toast]);  // ✅ THIS WAS MISSING


  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "system":
        return <Server className="w-4 h-4" />;
      case "user":
        return <Users className="w-4 h-4" />;
      case "performance":
        return <Activity className="w-4 h-4" />;
      case "security":
        return <SettingsIcon className="w-4 h-4" />;
      case "customer-call":
        return <Phone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "negative":
        return "bg-red-100 text-red-700";
      case "positive":
        return "bg-green-100 text-green-700";
      case "neutral":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || notification.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 1. Fixed markAsRead with useCallback + String() coercion
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === String(id) ? { ...n, read: true } : n
      )
    );
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: "All marked as read",
      description: "All notifications updated.",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Deleted", description: "Notification removed." });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({ title: "Cleared", description: "All notifications removed." });
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Bell className="w-8 h-8" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time alerts from customer calls and system events
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="default"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            variant="default"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Alerts</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search alerts..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="customer-call">Customer Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">All quiet for now</p>
                    <p className="text-sm">Real-time alerts will appear here when detected.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      // 2. Enhanced card styling + smooth transition
                      className={`p-4 border rounded-lg transition-all duration-300 ease-in-out hover:shadow-md ${
                        notification.read
                          ? "bg-gray-50 border-gray-200 opacity-80"
                          : "bg-white border-blue-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {/* 3. Emphasized title for unread */}
                              <h3
                                className={`font-semibold transition-colors duration-300 ${
                                  notification.read ? "text-gray-500" : "text-gray-900"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                <div className="flex items-center space-x-1">
                                  {getCategoryIcon(notification.category)}
                                  <span className="capitalize">
                                    {notification.category.replace("-", " ")}
                                  </span>
                                </div>
                              </Badge>
                              <Badge
                                className={`text-xs ${getPriorityColor(
                                  notification.priority
                                )}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>

                          <p
    

  className={`text-base leading-relaxed ${
    notification.read ? "text-gray-600" : "text-gray-900"
  } mb-2`}
  dangerouslySetInnerHTML={{
    __html: notification.message
      .replace(
        /QA Score:/gi,
        '<span class="font-bold text-gray-900">QA Score:</span>'
      )
      .replace(
        /(\d{1,3}(\.\d{1,2})?\/100)/g,
        '<span class="font-bold text-gray-900">$1</span>'
      )
  }}
/>



                            {notification.call_id && (
                              <p className="text-xs text-gray-600 mb-2">
                                <strong>Agent:</strong>{" "}
                                {notification.agent_id || notification.extension} |
                                <strong> Call:</strong> {notification.call_id}
                              </p>
                            )}

                           {/* Dynamic QA Alert */}
{notification.detailed_scores?.qa_score !== undefined && (() => {
  const score = notification.detailed_scores.qa_score;
  const severity = getAlertSeverity(score);

  if (!severity) return null;

  return (
    <div className={`rounded p-2 mb-2 text-xs border ${severity.color}`}>
      <strong>{severity.label}:</strong> {severity.message}
    </div>
  );
})()}


                            {notification.transcripts && notification.transcripts.length > 0 && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mb-2"
                                onClick={() =>
                                  openTranscriptModal(
                                    notification.transcripts!,
                                    `Call ${notification.call_id}`
                                  )
                                }
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View Transcripts ({notification.transcripts.length})
                              </Button>
                            )}

                            {notification.detailed_scores && (
  <Button
    size="sm"
    variant="outline"
    className="mt-1"
    onClick={() => openScoreModal(notification.detailed_scores)}
  >
    QA Breakdown
  </Button>
)}


                            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {notification.category === "customer-call" && notification.call_id && (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              onClick={() => handleJoinCall(notification.call_id!)}
                            >
                              <Headphones className="w-4 h-4 mr-1" />
                              Join Call
                            </Button>
                          )}

                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <p className="text-sm text-gray-600">
                Configure how you receive notifications
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Add toggle switches here in the future */}
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transcript Modal */}
      <Dialog open={showTranscriptModal} onOpenChange={setShowTranscriptModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-3 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {modalTitle} - Call Transcript
              </span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="p-6 max-h-[60vh]">
            <div className="space-y-4">
              {modalTranscripts.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    entry.speaker === "Customer"
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-semibold text-sm ${
                        entry.speaker === "Customer" ? "text-red-700" : "text-blue-700"
                      }`}
                    >
                      {entry.speaker}
                    </span>
                    {entry.sentiment && (
                      <Badge
                        className={`text-xs ${getSentimentColor(entry.sentiment.label)}`}
                      >
                        {entry.sentiment.label} (
                        {(entry.sentiment.score * 100).toFixed(0)}%)
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{entry.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      {/* QA SCORE BREAKDOWN MODAL */}
<Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>QA Score Breakdown</DialogTitle>
    </DialogHeader>

    {scoreDetails ? (
      <div className="space-y-3 mt-4">
        {Object.entries(scoreDetails).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between border p-2 rounded-md"
          >
            <span className="capitalize">{key.replace(/_/g, " ")}</span>
            <span className="font-bold">{String(value)}</span>
          </div>
        ))}
      </div>
    ) : (
      <p>No score details available</p>
    )}
  </DialogContent>
</Dialog>
  </div>
  );
};

export default Notifications;