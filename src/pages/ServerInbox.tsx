import { useEffect, useState } from "react";
import { emailApi } from "@/api/emailApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Mail, Inbox, Send, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type EmailServer = {
    id: number;
    username: string;
};

type Email = {
    id: number;
    sender: string;
    subject: string;
    body: string;
    timestamp: string;
};

type Queue = {
    id: number;
    queue_name: string;
};

export default function ServerInbox() {
    const [servers, setServers] = useState<EmailServer[]>([]);
    const [selectedServer, setSelectedServer] = useState<EmailServer | null>(null);
    const [emails, setEmails] = useState<Email[]>([]);
    const [queues, setQueues] = useState<Queue[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadServers();
    }, []);

    useEffect(() => {
        if (selectedServer) {
            loadEmails(selectedServer.username);
            loadQueues(selectedServer.id);
        }
    }, [selectedServer]);

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

    const loadEmails = async (serverEmail: string) => {
        try {
            setLoading(true);
            const res = await emailApi.get(`/server-inbox/${serverEmail}`);
            setEmails(res.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load emails",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadQueues = async (serverId: number) => {
        try {
            const res = await emailApi.get(`/email-queues/by-server/${serverId}`);
            setQueues(res.data);
        } catch (error) {
            console.error("Failed to load queues:", error);
        }
    };

    const viewEmailDetails = (email: Email) => {
        setSelectedEmail(email);
        setShowDetailModal(true);
    };

    const openAssignModal = (email: Email) => {
        setSelectedEmail(email);
        setShowAssignModal(true);
    };

    const assignEmailToQueue = async () => {
        if (!selectedEmail || !selectedQueueId) {
            toast({
                title: "Validation Error",
                description: "Please select a queue",
                variant: "destructive",
            });
            return;
        }

        const queue = queues.find((q) => q.id === selectedQueueId);
        if (!queue) return;

        try {
            await emailApi.post(`/assign-email-to-queue/${selectedEmail.id}`, null, {
                params: { queue_name: queue.queue_name },
            });

            toast({
                title: "Success",
                description: `Email assigned to ${queue.queue_name}`,
            });

            setShowAssignModal(false);
            setSelectedQueueId(null);

            // Refresh emails
            if (selectedServer) {
                loadEmails(selectedServer.username);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to assign email to queue",
                variant: "destructive",
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const extractSenderInfo = (sender: string) => {
        // Parse "Name <email@example.com>" format
        const match = sender.match(/^(.+?)\s*<(.+?)>$/);
        if (match) {
            return { name: match[1].trim(), email: match[2].trim() };
        }
        return { name: sender, email: sender };
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Server Inbox</h1>
                    <p className="text-gray-600 mt-1">View and assign unassigned emails to queues</p>
                </div>
            </div>

            {/* Server Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Email Server</CardTitle>
                    <CardDescription>Choose a server to view its unassigned emails</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select
                        value={selectedServer?.id.toString()}
                        onValueChange={(value) => {
                            const server = servers.find((s) => s.id === parseInt(value));
                            setSelectedServer(server || null);
                        }}
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

            {/* Emails List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : !selectedServer ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Inbox className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Server</h3>
                        <p className="text-gray-600">Choose an email server to view unassigned emails</p>
                    </CardContent>
                </Card>
            ) : emails.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Unassigned Emails</h3>
                        <p className="text-gray-600">All emails have been assigned to queues</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Unassigned Emails ({emails.length})
                        </h2>
                    </div>

                    {emails.map((email) => {
                        const senderInfo = extractSenderInfo(email.sender);
                        return (
                            <Card key={email.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Mail className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {senderInfo.name}
                                                        </h3>
                                                        <Badge variant="secondary" className="text-xs">
                                                            Unassigned
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">{senderInfo.email}</p>
                                                </div>
                                            </div>

                                            <div className="ml-13 space-y-1">
                                                <h4 className="font-medium text-gray-900 line-clamp-1">{email.subject}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">{email.body}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(email.timestamp)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => viewEmailDetails(email)}
                                                className="whitespace-nowrap"
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => openAssignModal(email)}
                                                className="gap-2 whitespace-nowrap"
                                            >
                                                <Send className="w-4 h-4" /> Assign to Queue
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Email Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Email Details</DialogTitle>
                    </DialogHeader>
                    {selectedEmail && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">From</label>
                                <p className="text-gray-900">{selectedEmail.sender}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Subject</label>
                                <p className="text-gray-900">{selectedEmail.subject}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Date</label>
                                <p className="text-gray-900">{formatDate(selectedEmail.timestamp)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Message</label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">{selectedEmail.body}</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        openAssignModal(selectedEmail);
                                    }}
                                    className="gap-2"
                                >
                                    <Send className="w-4 h-4" /> Assign to Queue
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Assign to Queue Modal */}
            <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Email to Queue</DialogTitle>
                        <DialogDescription>
                            Select a queue to assign this email for agent handling
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedEmail && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">Email Subject</p>
                                <p className="text-gray-900">{selectedEmail.subject}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Select Queue</label>
                            <Select
                                value={selectedQueueId?.toString()}
                                onValueChange={(value) => setSelectedQueueId(parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a queue" />
                                </SelectTrigger>
                                <SelectContent>
                                    {queues.map((queue) => (
                                        <SelectItem key={queue.id} value={queue.id.toString()}>
                                            {queue.queue_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedQueueId(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={assignEmailToQueue} disabled={!selectedQueueId}>
                                Assign Email
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
