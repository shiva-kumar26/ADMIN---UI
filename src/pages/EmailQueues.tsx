import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import AssignAgentsModal from "@/components/AssignAgentsModal";

type EmailQueue = {
  email: string;
  password: string;
};

export default function EmailQueues() {
  const [queues, setQueues] = useState<EmailQueue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);

  // Add new queue form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Edit states
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPwd, setShowEditPwd] = useState(false);

  // Load queues
  useEffect(() => {
    axios
      .get("http://10.16.7.91:8899/email-queues")
      .then((res) => setQueues(res.data));
  }, []);

  // Create queue
  const createQueue = async () => {
    if (!newEmail || !newPassword) {
      alert("Please fill both email and password");
      return;
    }

    try {
      await axios.post("http://10.16.7.91:8899/email-queues", {
        queue_email: newEmail,
        password: newPassword,
      });

      setQueues((prev) => [...prev, { email: newEmail, password: newPassword }]);
      setNewEmail("");
      setNewPassword("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add queue");
    }
  };

  // Delete queue
  const deleteQueue = async (email: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${email}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://10.16.7.91:8899/email-queues/${email}`);
      setQueues((prev) => prev.filter((q) => q.email !== email));
    } catch (err) {
      console.error(err);
      alert("Failed to delete queue");
    }
  };

  // Start editing
  const startEditing = (queue: EmailQueue) => {
    setEditingEmail(queue.email);
    setEditEmail(queue.email);
    setEditPassword(queue.password);
    setShowEditPwd(false);
  };

  // Save edit
  const saveEdit = async (originalEmail: string) => {
    if (!editEmail || !editPassword) {
      alert("Please fill both fields");
      return;
    }

    try {
      await axios.put(`http://10.16.7.91:8899/email-queues/${originalEmail}`, {
        email: editEmail,
        password: editPassword,
      });

      setQueues((prev) =>
        prev.map((q) =>
          q.email === originalEmail
            ? { email: editEmail, password: editPassword }
            : q
        )
      );
      setEditingEmail(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update queue");
    }
  };

  // Mask password
  const maskPassword = (pwd: string) => {
    if (!pwd) return "";
    if (pwd.length <= 4) return "****";
    return "*".repeat(pwd.length - 4) + pwd.slice(-4);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Queues</h1>

        {/* Add Queue Section */}
        <div className="mb-6">
          <Button
            size="lg"
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-4"
          >
            {showAddForm ? "Cancel" : "+ Add Email Queue"}
          </Button>

          {showAddForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold mb-6">Add New Email Queue</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Queue Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="example@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password / App Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                    >
                      {showNewPwd ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={createQueue}>
                  Save New Queue
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Queue List */}
        <div className="space-y-4">
          {queues.map((q) => (
            <div
              key={q.email}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow"
            >
              {editingEmail === q.email ? (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Edit Email Queue</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Queue Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showEditPwd ? "text" : "password"}
                          className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowEditPwd(!showEditPwd)}
                        >
                          {showEditPwd ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setEditingEmail(null)}>
                      Cancel
                    </Button>
                    <Button onClick={() => saveEdit(q.email)}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-gray-900">{q.email}</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Password: {maskPassword(q.password)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setSelectedQueue(q.email)}>
                      Assign Agents
                    </Button>
                    <Button variant="outline" onClick={() => startEditing(q)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => deleteQueue(q.email)}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assign Agents Modal */}
      {selectedQueue && (
        <AssignAgentsModal
          queueEmail={selectedQueue}
          onClose={() => setSelectedQueue(null)}
        />
      )}
    </div>
  );
}