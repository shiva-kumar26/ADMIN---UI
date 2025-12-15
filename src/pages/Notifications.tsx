import React, { useState, useCallback, useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Sliders,
  Shield,
  Save,
  RefreshCw
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
  const [loading, setLoading] = useState(false);

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
        color: "bg-red-50 border-red-200 text-red-800",
        label: "Critical Alert",
        message: "Supervisor must review this call immediately.",
      };
    }

    if (score > 50) {
      return {
        level: "warning",
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
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
      // In a real app this would connect to the softphone
      toast({
        title: "Joining Interaction",
        description: `Connecting to call session ${callId}...`,
        className: "bg-green-50 border-green-200 text-green-900"
      });
      console.log("Joining call:", callId);
    },
    [toast]
  );

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated.",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        qa_score: latestEvent.qa_score,
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

  }, [latestEvent, toast]);


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
        return <Shield className="w-4 h-4" />;
      case "customer-call":
        return <Phone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
      default:
        return "bg-green-50 text-green-700 border-green-200";
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
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
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
      description: "All notifications have been marked as read.",
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

  const TabTrigger = ({ value, icon: Icon, label }: { value: string, icon: any, label: string }) => (
    <TabsTrigger
      value={value}
      className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-blue-100 rounded-lg px-4 py-2 transition-all"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </TabsTrigger>
  );

  return (
    <div className="space-y-8 p-6 mt-8 w-full max-w-full overflow-x-hidden bg-gray-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-6 px-2 rounded-full text-xs font-semibold shadow-sm animate-pulse">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Real-time alerts from customer calls, system events, and performance metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="bg-white hover:bg-red-50 text-red-600 border-red-100 hover:border-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-8">
        <div className="bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm inline-flex">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabTrigger value="notifications" icon={Bell} label="Live Alerts" />
            <TabTrigger value="settings" icon={Sliders} label="Settings" />
          </TabsList>
        </div>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                className="pl-10 h-10 border-gray-200 focus:border-blue-500 rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 border-gray-200 rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="customer-call">Customer Calls</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm border-dashed">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                <p className="text-gray-500 mt-1">No notifications match your current criteria.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                        group relative p-5 rounded-xl border transition-all duration-200
                        ${notification.read
                      ? "bg-white border-gray-100 hover:border-gray-200"
                      : "bg-white border-blue-200 shadow-md ring-1 ring-blue-50"
                    }
                      `}
                >
                  {!notification.read && (
                    <div className="absolute top-5 right-5 w-2 h-2 bg-blue-500 rounded-full animate-pulse md:hidden"></div>
                  )}

                  <div className="flex gap-4">
                    {/* Icon Column */}
                    <div className={`
                            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                            ${notification.type === 'error' ? 'bg-red-50 text-red-600' :
                        notification.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                          notification.type === 'success' ? 'bg-green-50 text-green-600' :
                            'bg-blue-50 text-blue-600'}
                         `}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-y-2 mb-2">
                        <div className="space-y-1">
                          <h3 className={`text-base font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="bg-white text-gray-600 border-gray-200 font-normal px-2 py-0.5 h-6">
                              {getCategoryIcon(notification.category)}
                              <span className="ml-1.5 capitalize">{notification.category.replace("-", " ")}</span>
                            </Badge>
                            <Badge className={`px-2 py-0.5 h-6 font-medium border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority} priority
                            </Badge>
                            <span className="flex items-center text-xs text-gray-400 ml-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button size="sm" variant="ghost" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => markAsRead(notification.id)}>
                              Mark Read
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 p-0" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div
                        className={`text-sm leading-relaxed mb-4 max-w-3xl ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}
                        dangerouslySetInnerHTML={{
                          __html: notification.message
                            .replace(/QA Score:/gi, '<span class="font-bold text-gray-900">QA Score:</span>')
                            .replace(/(\d{1,3}(\.\d{1,2})?\/100)/g, '<span class="font-bold text-gray-900">$1</span>')
                        }}
                      />

                      {/* Additional Context & Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        {notification.call_id && (
                          <div className="flex items-center gap-3 text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              <span className="font-medium">Agent: {notification.agent_id || notification.extension || 'Unknown'}</span>
                            </div>
                            <div className="w-px h-3 bg-gray-300"></div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              <span className="font-mono">{notification.call_id}</span>
                            </div>
                          </div>
                        )}

                        {notification.detailed_scores?.qa_score !== undefined && (() => {
                          const score = notification.detailed_scores.qa_score;
                          const severity = getAlertSeverity(score);
                          if (!severity) return null;
                          return (
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${severity.color}`}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{severity.message}</span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {notification.category === "customer-call" && notification.call_id && (
                          <Button size="sm" className="h-8 gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm" onClick={() => handleJoinCall(notification.call_id!)}>
                            <Headphones className="w-3.5 h-3.5" />
                            Join Call
                          </Button>
                        )}
                        {notification.transcripts && notification.transcripts.length > 0 && (
                          <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => openTranscriptModal(notification.transcripts!, `Call ${notification.call_id}`)}>
                            <FileText className="w-3.5 h-3.5" />
                            Transcripts
                          </Button>
                        )}
                        {notification.detailed_scores && (
                          <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => openScoreModal(notification.detailed_scores)}>
                            <Activity className="w-3.5 h-3.5" />
                            QA Score
                          </Button>
                        )}

                        <div className="ml-auto md:hidden flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>Delete</Button>
                          {!notification.read && <Button size="sm" variant="secondary" onClick={() => markAsRead(notification.id)}>Read</Button>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-0">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Sliders className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Notification Preference</CardTitle>
                  <CardDescription>Control which alerts you want to receive and how.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Channels</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive digests and alerts via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(c) => setNotificationSettings(p => ({ ...p, emailNotifications: c }))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Real-time browser notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(c) => setNotificationSettings(p => ({ ...p, pushNotifications: c }))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Alert Types</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">System Alerts</Label>
                      <p className="text-sm text-gray-500">Maintenance and downtime</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(c) => setNotificationSettings(p => ({ ...p, systemAlerts: c }))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Performance Alerts</Label>
                      <p className="text-sm text-gray-500">Server load and latency spikes</p>
                    </div>
                    <Switch
                      checked={notificationSettings.performanceAlerts}
                      onCheckedChange={(c) => setNotificationSettings(p => ({ ...p, performanceAlerts: c }))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Security Alerts</Label>
                      <p className="text-sm text-gray-500">Login attempts and role changes</p>
                    </div>
                    <Switch
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(c) => setNotificationSettings(p => ({ ...p, securityAlerts: c }))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
                <Button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transcript Modal */}
      <Dialog open={showTranscriptModal} onOpenChange={setShowTranscriptModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b bg-gray-50/50">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                {modalTitle}
              </span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="p-6 max-h-[60vh]">
            <div className="space-y-4">
              {modalTranscripts.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${entry.speaker === "Customer"
                      ? "bg-red-50/50 border-red-100"
                      : "bg-blue-50/50 border-blue-100"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-semibold text-sm px-2 py-0.5 rounded-md ${entry.speaker === "Customer" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {entry.speaker}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed pl-1">{entry.text}</p>
                  {entry.sentiment && (
                    <div className="mt-2 flex">
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${getSentimentColor(entry.sentiment.label)}`}
                      >
                        {entry.sentiment.label} ({(entry.sentiment.score * 100).toFixed(0)}%)
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* QA SCORE BREAKDOWN MODAL */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              QA Score Breakdown
            </DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
            {scoreDetails ? (
              <div className="space-y-3">
                {Object.entries(scoreDetails).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                  >
                    <span className="capitalize text-sm font-medium text-gray-700">{key.replace(/_/g, " ")}</span>
                    <Badge variant="secondary" className="font-mono text-sm">{String(value)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No score details available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;