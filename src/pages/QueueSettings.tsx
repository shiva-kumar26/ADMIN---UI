import { useEffect, useState } from "react";
import { emailApi } from "@/api/emailApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Clock, Users, Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

type EmailServer = {
    id: number;
    username: string;
};

type Queue = {
    id: number;
    queue_name: string;
};

type QueueSettings = {
    queue_id: number;
    queue_name: string;
    office_start_time: string;
    office_end_time: string;
    working_days: string[];
    out_of_office_message: string;
    assigned_agents: string[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function QueueSettings() {
    const [servers, setServers] = useState<EmailServer[]>([]);
    const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
    const [queues, setQueues] = useState<Queue[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddQueue, setShowAddQueue] = useState(false);
    const [newQueueName, setNewQueueName] = useState("");
    const [availableAgents, setAvailableAgents] = useState<string[]>([]);
    const { toast } = useToast();

    // Queue settings state
    const [queueSettings, setQueueSettings] = useState<Record<number, QueueSettings>>({});

    // Load email servers
    useEffect(() => {
        loadServers();
        loadAvailableAgents();
    }, []);

    // Load queues when server is selected
    useEffect(() => {
        if (selectedServerId) {
            loadQueues(selectedServerId);
        }
    }, [selectedServerId]);

    const loadServers = async () => {
        try {
            const res = await emailApi.get("/email-servers");
            setServers(res.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load email servers",
                variant: "destructive",
            });
        }
    };

    const loadQueues = async (serverId: number) => {
        try {
            setLoading(true);
            const res = await emailApi.get(`/email-queues/by-server/${serverId}`);
            setQueues(res.data);

            // Load settings for each queue
            for (const queue of res.data) {
                await loadQueueSettings(queue.id, queue.queue_name);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load queues",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadQueueSettings = async (queueId: number, queueName: string) => {
        try {
            // Load agents
            const agentsRes = await emailApi.get(`/email-queues/${queueId}/agents`);

            // For office hours, we'll need to add an endpoint or use default values
            // Since the backend doesn't have a GET endpoint for office hours yet,
            // we'll use default values
            setQueueSettings((prev) => ({
                ...prev,
                [queueId]: {
                    queue_id: queueId,
                    queue_name: queueName,
                    office_start_time: "09:00",
                    office_end_time: "18:00",
                    working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    out_of_office_message: "Thank you for contacting us. We will respond during office hours.",
                    assigned_agents: agentsRes.data || [],
                },
            }));
        } catch (error) {
            console.error("Failed to load queue settings:", error);
        }
    };

    const loadAvailableAgents = async () => {
        try {
            // Fetch agents from the backend API
            const res = await emailApi.get("/agents");
            // Extract user_id from the response
            const agentNames = res.data.map((agent: any) => agent.user_id);
            setAvailableAgents(agentNames);
        } catch (error) {
            console.error("Failed to load agents:", error);
            toast({
                title: "Warning",
                description: "Failed to load agents. Using empty list.",
                variant: "destructive",
            });
            setAvailableAgents([]);
        }
    };

    const createQueue = async () => {
        if (!selectedServerId || !newQueueName) {
            toast({
                title: "Validation Error",
                description: "Please enter a queue name",
                variant: "destructive",
            });
            return;
        }

        try {
            await emailApi.post("/email-queues", {
                queue_name: newQueueName,
                server_id: selectedServerId,
            });

            toast({
                title: "Success",
                description: "Queue created successfully",
            });

            setNewQueueName("");
            setShowAddQueue(false);
            loadQueues(selectedServerId);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create queue",
                variant: "destructive",
            });
        }
    };

    const saveQueueSettings = async (queueId: number) => {
        const settings = queueSettings[queueId];
        if (!settings) return;

        try {
            // Save agents
            await emailApi.post(`/email-queues/${queueId}/agents`, {
                agents: settings.assigned_agents,
            });

            // Note: You'll need to add an endpoint to save office hours
            // For now, we're only saving agents
            toast({
                title: "Success",
                description: "Queue settings saved successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save queue settings",
                variant: "destructive",
            });
        }
    };

    const updateQueueSetting = (queueId: number, field: keyof QueueSettings, value: any) => {
        setQueueSettings((prev) => ({
            ...prev,
            [queueId]: {
                ...prev[queueId],
                [field]: value,
            },
        }));
    };

    const toggleDay = (queueId: number, day: string) => {
        const settings = queueSettings[queueId];
        if (!settings) return;

        const days = settings.working_days.includes(day)
            ? settings.working_days.filter((d) => d !== day)
            : [...settings.working_days, day];

        updateQueueSetting(queueId, "working_days", days);
    };

    const toggleAgent = (queueId: number, agent: string) => {
        const settings = queueSettings[queueId];
        if (!settings) return;

        const agents = settings.assigned_agents.includes(agent)
            ? settings.assigned_agents.filter((a) => a !== agent)
            : [...settings.assigned_agents, agent];

        updateQueueSetting(queueId, "assigned_agents", agents);
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Queue Settings</h1>
                    <p className="text-gray-600 mt-1">Configure office hours and agents for email queues</p>
                </div>
            </div>

            {/* Server Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Email Server</CardTitle>
                    <CardDescription>Choose a server to manage its queues</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select
                        value={selectedServerId?.toString()}
                        onValueChange={(value) => setSelectedServerId(parseInt(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an email server" />
                        </SelectTrigger>
                        <SelectContent>
                            {servers.map((server) => (
                                <SelectItem key={server.id} value={server.id.toString()}>
                                    {server.username}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Add Queue Button */}
            {selectedServerId && (
                <div className="flex justify-end">
                    <Button onClick={() => setShowAddQueue(!showAddQueue)} className="gap-2">
                        {showAddQueue ? (
                            <>
                                <X className="w-4 h-4" /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> Add Queue
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Add Queue Form */}
            {showAddQueue && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="queue_name">Queue Name</Label>
                            <Input
                                id="queue_name"
                                placeholder="e.g., Support, Sales, Billing"
                                value={newQueueName}
                                onChange={(e) => setNewQueueName(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAddQueue(false)}>
                                Cancel
                            </Button>
                            <Button onClick={createQueue}>Create Queue</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Queues List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : queues.length === 0 && selectedServerId ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Queues Found</h3>
                        <p className="text-gray-600 mb-4">Create your first queue to get started</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {queues.map((queue) => {
                        const settings = queueSettings[queue.id];
                        if (!settings) return null;

                        return (
                            <Card key={queue.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{queue.queue_name}</CardTitle>
                                            <CardDescription>Queue ID: {queue.id}</CardDescription>
                                        </div>
                                        <Button onClick={() => saveQueueSettings(queue.id)} className="gap-2">
                                            <Save className="w-4 h-4" /> Save Settings
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Office Hours */}
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5" /> Office Hours
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <Label>Start Time</Label>
                                                <Input
                                                    type="time"
                                                    value={settings.office_start_time}
                                                    onChange={(e) =>
                                                        updateQueueSetting(queue.id, "office_start_time", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Time</Label>
                                                <Input
                                                    type="time"
                                                    value={settings.office_end_time}
                                                    onChange={(e) =>
                                                        updateQueueSetting(queue.id, "office_end_time", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Working Days</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {DAYS.map((day) => (
                                                    <Button
                                                        key={day}
                                                        variant={settings.working_days.includes(day) ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => toggleDay(queue.id, day)}
                                                    >
                                                        {day}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            <Label>Out of Office Message</Label>
                                            <Textarea
                                                rows={3}
                                                value={settings.out_of_office_message}
                                                onChange={(e) =>
                                                    updateQueueSetting(queue.id, "out_of_office_message", e.target.value)
                                                }
                                                placeholder="Message sent when emails arrive outside office hours"
                                            />
                                        </div>
                                    </div>

                                    {/* Assigned Agents */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5" /> Assigned Agents
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {availableAgents.map((agent) => (
                                                <Button
                                                    key={agent}
                                                    variant={settings.assigned_agents.includes(agent) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleAgent(queue.id, agent)}
                                                >
                                                    {agent}
                                                </Button>
                                            ))}
                                        </div>
                                        {settings.assigned_agents.length === 0 && (
                                            <p className="text-sm text-gray-500 mt-2">No agents assigned to this queue</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
