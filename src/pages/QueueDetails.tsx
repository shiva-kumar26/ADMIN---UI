import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Queue {
  id: string;
  name: string;
  extension: string;
  port: string;
  maxWaitTime: string;
  strategy: string;
  createdAt: string;
}

const QueueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [queue, setQueue] = useState<any>(null);
  const [editedQueue, setEditedQueue] = useState<any>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') {
      setIsEditing(true);
    }
    if (id) {
      axios.get(`https://10.16.7.96/api/api/queue/${id}`)
        .then(res => {
          setQueue(res.data);
          setEditedQueue(res.data);
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to fetch queue details.",
            variant: "destructive",
          });
          navigate('/queues');
        });
    }
  }, [id, navigate, toast]);

  const handleSave = async () => {
    try {
      await axios.put(`https://10.16.7.96/api/api/queue/${id}`, editedQueue);
      setQueue(editedQueue);
      setIsEditing(false);
      toast({
        title: "Queue Updated",
        description: "Queue details have been successfully updated.",
      });
      navigate('/queues');
    } catch {
      toast({
        title: "Error",
        description: "Failed to update queue.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedQueue(queue);
    setIsEditing(false);
  };

  if (!queue || !editedQueue) {
    return (
      <div className="flex justify-center items-center h-64">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/queues')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queues</span>
          </Button>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Queue</span>
            </Button>
          )}
        </div>
      </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Queue Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={isEditing ? editedQueue.name : queue.name}
                onChange={e => setEditedQueue({ ...editedQueue, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
              <div className="space-y-2">
              <Label>Strategy</Label>
              <Select
                value={isEditing ? editedQueue.strategy : queue.strategy}
                onValueChange={v => setEditedQueue({ ...editedQueue, strategy: v })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ring-all">ring-all</SelectItem>
                  <SelectItem value="longest-idle-agent">longest-idle-agent</SelectItem>
                  <SelectItem value="round-robin">round-robin</SelectItem>
                  <SelectItem value="top-down">top-down</SelectItem>
                  <SelectItem value="agent-with-least-talk-time">agent-with-least-talk-time</SelectItem>
                  <SelectItem value="agent-with-fewest-calls">agent-with-fewest-calls</SelectItem>
                  <SelectItem value="sequentially-by-agent-order">sequentially-by-agent-order</SelectItem>
                  <SelectItem value="random">random</SelectItem>
                  <SelectItem value="ring-progressively">ring-progressively</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>MOH sound</Label>
              <Select
                value={isEditing ? editedQueue.moh_sound : queue.moh_sound}
                onValueChange={v => setEditedQueue({ ...editedQueue, moh_sound: v })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local_stream://moh">local_stream://moh</SelectItem>
                  <SelectItem value="local_stream://default">local_stream://default</SelectItem>
                  <SelectItem value="Recordings">Recordings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time base score</Label>
                <Select
                value={isEditing ? editedQueue.time_base_score : queue.time_base_score}
                onValueChange={v => setEditedQueue({ ...editedQueue, time_base_score: v })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queue">Queue</SelectItem>
                  <SelectItem value="system">system</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tier rules apply</Label>
                           <Select
                value={isEditing ? editedQueue.tier_rules_apply : queue.tier_rules_apply}
                onValueChange={v => setEditedQueue({ ...editedQueue, tier_rules_apply: v })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tier rule wait second</Label>
              <Input
                type="number"
                value={isEditing ? editedQueue.tier_rule_wait_second : queue.tier_rule_wait_second}
                onChange={e => setEditedQueue({ ...editedQueue, tier_rule_wait_second: Number(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Tier rule wait multiply level</Label>
              <Select
                 value={isEditing ? editedQueue.tier_rule_wait_multiply_level : queue.tier_rule_wait_multiply_level}
                onValueChange={v => setEditedQueue({ ...editedQueue, tier_rule_wait_multiply_level: v })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tier rule no agent no wait</Label>
              <Select
                value={isEditing ? editedQueue.tier_rule_no_agent_no_wait : queue.tier_rule_no_agent_no_wait}
                onValueChange={v => setEditedQueue({ ...editedQueue, tier_rule_no_agent_no_wait: v })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discard abandoned after</Label>
              <Input
                type="number"
                value={isEditing ? editedQueue.discard_abandoned_after : queue.discard_abandoned_after}
                onChange={e => setEditedQueue({ ...editedQueue, discard_abandoned_after: Number(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Abandoned resume allowed</Label>
              <Select
                value={isEditing ? editedQueue.abandoned_resume_allowed : queue.abandoned_resume_allowed}
                onValueChange={v => setEditedQueue({ ...editedQueue, abandoned_resume_allowed: v })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max wait time</Label>
              <Input
                type="number"
                value={isEditing ? editedQueue.max_wait_time : queue.max_wait_time}
                onChange={e => setEditedQueue({ ...editedQueue, max_wait_time: Number(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Max wait time no agent</Label>
              <Input
                type="number"
                value={isEditing ? editedQueue.max_wait_time_with_no_agent : queue.max_wait_time_with_no_agent}
                onChange={e => setEditedQueue({ ...editedQueue, max_wait_time_with_no_agent: Number(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Max wait time no agent reached</Label>
              <Input
                type="number"
                value={isEditing ? editedQueue.max_wait_time_with_no_agent_time_reached : queue.max_wait_time_with_no_agent_time_reached}
                onChange={e => setEditedQueue({ ...editedQueue, max_wait_time_with_no_agent_time_reached: Number(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Record template</Label>
              <Input
                value={isEditing ? editedQueue.record_template : queue.record_template}
                onChange={e => setEditedQueue({ ...editedQueue, record_template: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueDetails;
