import { useEffect, useState } from "react";
import { emailApi } from "@/api/emailApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X, Trash2, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type EmailServer = {
  id: number;
  username: string;
};

type Queue = {
  id: number;
  queue_name: string;
};

export default function EmailQueues() {
  const [servers, setServers] = useState<EmailServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddQueue, setShowAddQueue] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load email servers
  useEffect(() => {
    loadServers();
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

  const deleteQueue = async (queueId: number, queueName: string) => {
    if (!confirm(`Are you sure you want to delete queue "${queueName}"?`)) {
      return;
    }

    try {
      await emailApi.delete(`/email-queues/${queueId}`);

      toast({
        title: "Success",
        description: `Queue "${queueName}" deleted successfully`,
      });

      // Refresh the queue list
      if (selectedServerId) {
        loadQueues(selectedServerId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete queue",
        variant: "destructive",
      });
    }
  };

  const configureQueue = (queueId: number) => {
    navigate("/queue-settings");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Queues</h1>
          <p className="text-gray-600 mt-1">Create and manage email queues for your servers</p>
        </div>
      </div>

      {/* Server Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Email Server</CardTitle>
          <CardDescription>Choose a server to view and manage its queues</CardDescription>
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
            <CardDescription>Add a new email queue to this server</CardDescription>
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Queues Found</h3>
            <p className="text-gray-600 mb-4">Create your first queue to get started</p>
            <Button onClick={() => setShowAddQueue(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Queue
            </Button>
          </CardContent>
        </Card>
      ) : selectedServerId ? (
        <Card>
          <CardHeader>
            <CardTitle>Queues ({queues.length})</CardTitle>
            <CardDescription>Manage queues for the selected server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queues.map((queue) => (
                <div
                  key={queue.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {queue.queue_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{queue.queue_name}</h4>
                      <p className="text-sm text-gray-500">Queue ID: {queue.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => configureQueue(queue.id)}
                      className="gap-2"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteQueue(queue.id, queue.queue_name)}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <SettingsIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Server</h3>
            <p className="text-gray-600">Choose an email server to view and manage its queues</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
