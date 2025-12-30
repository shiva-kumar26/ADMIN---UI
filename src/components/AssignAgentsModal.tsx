import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

type Agent = {
  agent_name: string;
  agent_extension: string;
};

export default function AssignAgentsModal({
  queueEmail,
  onClose,
}: {
  queueEmail: string;
  onClose: () => void;
}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agentQueueMap, setAgentQueueMap] = useState<Record<string, string[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [agentsRes, assignedRes, mapRes] = await Promise.all([
          axios.get("http://10.16.7.91:8899/admin/agents"),
          axios.get(
            `http://10.16.7.91:8899/email-queues/${queueEmail}/agents`
          ),
          axios.get("http://10.16.7.91:8899/admin/agent-queue-map"),
        ]);

        setAgents(agentsRes.data);
        setSelectedAgents(
          assignedRes.data.map((a: string) => a.trim())
        );
        setAgentQueueMap(mapRes.data);
      } catch (e) {
        console.error("Failed to load agent data", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [queueEmail]);

  const toggleAgent = (agentName: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentName)
        ? prev.filter((a) => a !== agentName)
        : [...prev, agentName]
    );
  };

  const save = async () => {
    await axios.post(
      `http://10.16.7.91:8899/email-queues/${queueEmail}/agents`,
      { agents: selectedAgents }
    );
    alert("Agents assigned successfully");
    onClose();
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="font-bold mb-4">Assign Agents</h2>

        {agents.map((agent) => {
          const agentName = agent.agent_name.trim();
          const queues = agentQueueMap[agentName] || [];

          const assignedHere = selectedAgents.includes(agentName);
          const assignedElsewhere =
            queues.length > 0 && !queues.includes(queueEmail);

          return (
            <label
              key={agentName}
              className={`flex justify-between items-center mb-2 ${
                assignedElsewhere ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {/* 🔒 DISABLED IF ASSIGNED TO OTHER QUEUE */}
                <input
                  type="checkbox"
                  disabled={assignedElsewhere}
                  checked={assignedHere}
                  onChange={() => toggleAgent(agentName)}
                />

                <span>
                  {agentName} ({agent.agent_extension})
                </span>
              </div>

              {assignedElsewhere && (
                <span className="text-xs text-orange-600">
                  Assigned to other queue
                </span>
              )}
            </label>
          );
        })}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}
