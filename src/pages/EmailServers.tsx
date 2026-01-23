import { useEffect, useState } from "react";
import { emailApi } from "@/api/emailApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Server, Trash2, Edit2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type EmailServer = {
  id: number;
  username: string;
  imap_server: string;
  imap_port: number;
  imap_use_ssl: boolean;
  smtp_server: string;
  smtp_port: number;
  smtp_use_tls: boolean;
  smtp_use_ssl: boolean;
};

type ServerForm = {
  username: string;
  password: string;
  account_type: string;
  imap_server: string;
  imap_port: number;
  imap_use_ssl: boolean;
  smtp_server: string;
  smtp_port: number;
  use_tls: boolean;
  use_ssl: boolean;
};

export default function EmailServers() {
  const [servers, setServers] = useState<EmailServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState<ServerForm>({
    username: "",
    password: "",
    account_type: "gmail",
    imap_server: "imap.gmail.com",
    imap_port: 993,
    imap_use_ssl: true,
    smtp_server: "smtp.gmail.com",
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
  });

  const loadServers = async () => {
    try {
      setLoading(true);
      const res = await emailApi.get("/email-servers");
      setServers(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load email servers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      account_type: "gmail",
      imap_server: "imap.gmail.com",
      imap_port: 993,
      imap_use_ssl: true,
      smtp_server: "smtp.gmail.com",
      smtp_port: 587,
      use_tls: true,
      use_ssl: false,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const saveServer = async () => {
    if (!form.username || !form.password) {
      toast({
        title: "Validation Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }

    if (!form.account_type) {
      toast({
        title: "Validation Error",
        description: "Account type is required",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Sending email server data:", form);
      await emailApi.post("/email-servers", form);
      toast({
        title: "Success",
        description: `Email server ${editingId ? "updated" : "created"} successfully`,
      });
      resetForm();
      loadServers();
    } catch (error) {
      console.error("Error saving email server:", error);
      toast({
        title: "Error",
        description: "Failed to save email server",
        variant: "destructive",
      });
    }
  };

  const deleteServer = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete ${username}?`)) return;

    try {
      await emailApi.delete(`/email-servers/${id}`);
      toast({
        title: "Success",
        description: "Email server deleted successfully",
      });
      loadServers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email server",
        variant: "destructive",
      });
    }
  };

  const startEdit = (server: EmailServer) => {
    setForm({
      username: server.username,
      password: "",
      account_type: "gmail", // Default to gmail for existing servers
      imap_server: server.imap_server,
      imap_port: server.imap_port,
      imap_use_ssl: server.imap_use_ssl,
      smtp_server: server.smtp_server,
      smtp_port: server.smtp_port,
      use_tls: server.smtp_use_tls,
      use_ssl: server.smtp_use_ssl,
    });
    setEditingId(server.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Servers</h1>
          <p className="text-gray-600 mt-1">Manage IMAP/SMTP server configurations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Server
            </>
          )}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Email Server" : "Add New Email Server"}</CardTitle>
            <CardDescription>Configure IMAP and SMTP settings for email integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Credentials */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email Address</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="user@example.com"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password / App Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type</Label>
                <Select
                  value={form.account_type}
                  onValueChange={(value) => {
                    // Auto-fill settings based on account type
                    if (value === "gmail") {
                      setForm({
                        ...form,
                        account_type: value,
                        imap_server: "imap.gmail.com",
                        imap_port: 993,
                        imap_use_ssl: true,
                        smtp_server: "smtp.gmail.com",
                        smtp_port: 587,
                        use_tls: true,
                        use_ssl: false,
                      });
                    } else if (value === "outlook") {
                      setForm({
                        ...form,
                        account_type: value,
                        imap_server: "outlook.office365.com",
                        imap_port: 993,
                        imap_use_ssl: true,
                        smtp_server: "smtp.office365.com",
                        smtp_port: 587,
                        use_tls: true,
                        use_ssl: false,
                      });
                    } else {
                      setForm({ ...form, account_type: value });
                    }
                  }}
                >
                  <SelectTrigger id="account_type">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* IMAP Configuration */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" /> IMAP Configuration
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imap_server">IMAP Server</Label>
                  <Input
                    id="imap_server"
                    placeholder="imap.gmail.com"
                    value={form.imap_server}
                    onChange={(e) => setForm({ ...form, imap_server: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imap_port">IMAP Port</Label>
                  <Input
                    id="imap_port"
                    type="number"
                    placeholder="993"
                    value={form.imap_port}
                    onChange={(e) => setForm({ ...form, imap_port: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imap_ssl">Use SSL</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      id="imap_ssl"
                      checked={form.imap_use_ssl}
                      onCheckedChange={(checked) => setForm({ ...form, imap_use_ssl: checked })}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {form.imap_use_ssl ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SMTP Configuration */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" /> SMTP Configuration
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_server">SMTP Server</Label>
                  <Input
                    id="smtp_server"
                    placeholder="smtp.gmail.com"
                    value={form.smtp_server}
                    onChange={(e) => setForm({ ...form, smtp_server: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    placeholder="587"
                    value={form.smtp_port}
                    onChange={(e) => setForm({ ...form, smtp_port: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="use_tls">Use TLS</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      id="use_tls"
                      checked={form.use_tls}
                      onCheckedChange={(checked) => setForm({ ...form, use_tls: checked })}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {form.use_tls ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="use_ssl">Use SSL</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      id="use_ssl"
                      checked={form.use_ssl}
                      onCheckedChange={(checked) => setForm({ ...form, use_ssl: checked })}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {form.use_ssl ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={saveServer}>
                {editingId ? "Update Server" : "Create Server"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Servers List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : servers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Email Servers</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first email server</p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Server
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {servers.map((server) => (
            <Card key={server.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{server.username}</h3>
                        <p className="text-sm text-gray-500">ID: {server.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">IMAP Configuration</p>
                        <p className="text-sm font-mono text-gray-900">
                          {server.imap_server}:{server.imap_port}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {server.imap_use_ssl ? "SSL Enabled" : "SSL Disabled"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">SMTP Configuration</p>
                        <p className="text-sm font-mono text-gray-900">
                          {server.smtp_server}:{server.smtp_port}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {server.smtp_use_tls && "TLS"} {server.smtp_use_ssl && "SSL"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(server)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteServer(server.id, server.username)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
