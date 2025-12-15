import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Server,
  Shield,
  Mail,
  Users,
  Bell,
  Save,
  RefreshCw,
  Lock,
  Globe
} from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    serverTimeout: '30',
    maxConcurrentCalls: '100',
    callRecording: true,
    autoBackup: true,
    maintenanceMode: false,
  });

  // User Management Settings
  const [userSettings, setUserSettings] = useState({
    sessionTimeout: '60',
    passwordExpiry: '90',
    twoFactorAuth: false,
    autoLogout: true,
    maxLoginAttempts: '3',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    performanceAlerts: true,
  });

  // Email Configuration
  const [emailConfig, setEmailConfig] = useState({
    smtpServer: 'smtp.company.com',
    smtpPort: '587',
    smtpUsername: 'admin@company.com',
    smtpPassword: '',
    enableSSL: true,
  });

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Settings Saved",
        description: `${section} settings have been successfully updated.`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl">
          Manage your global system configuration, security preferences, and notification channels.
        </p>
      </div>

      <Tabs defaultValue="system" className="space-y-8">
        <div className="bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm inline-flex">
          <TabsList className="bg-transparent h-auto p-0 gap-1 flex-wrap justify-start">
            <TabTrigger value="system" icon={Server} label="System" />
            <TabTrigger value="users" icon={Users} label="Users" />
            <TabTrigger value="notifications" icon={Bell} label="Notifications" />
            <TabTrigger value="email" icon={Mail} label="Email" />
            <TabTrigger value="security" icon={Shield} label="Security" />
          </TabsList>
        </div>

        <TabsContent value="system" className="space-y-6 mt-0">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Server className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">System Configuration</CardTitle>
                  <CardDescription>Core settings for server performance and maintenance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="serverTimeout" className="text-sm font-medium text-gray-700">Server Timeout (seconds)</Label>
                  <Input
                    id="serverTimeout"
                    value={systemSettings.serverTimeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, serverTimeout: e.target.value }))}
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="maxCalls" className="text-sm font-medium text-gray-700">Max Concurrent Calls</Label>
                  <Input
                    id="maxCalls"
                    value={systemSettings.maxConcurrentCalls}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxConcurrentCalls: e.target.value }))}
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>

              <Separator className="bg-gray-100" />

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">Call Recording</Label>
                    <p className="text-sm text-gray-500">Automatically record all incoming and outgoing calls</p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600"
                    checked={systemSettings.callRecording}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, callRecording: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">Auto Backup</Label>
                    <p className="text-sm text-gray-500">Perform daily system backups at 00:00 UTC</p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600"
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50/50 rounded-lg border border-yellow-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-yellow-900">Maintenance Mode</Label>
                    <p className="text-sm text-yellow-700">Temporarily disable access for non-admin users</p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-yellow-600"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveSettings('System')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm rounded-lg h-10 px-6"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-0">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">User Management</CardTitle>
                  <CardDescription>Configure user access, sessions, and authentication policies</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="sessionTimeout" className="text-sm font-medium text-gray-700">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    value={userSettings.sessionTimeout}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    className="h-10 border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="passwordExpiry" className="text-sm font-medium text-gray-700">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    value={userSettings.passwordExpiry}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, passwordExpiry: e.target.value }))}
                    className="h-10 border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="maxAttempts" className="text-sm font-medium text-gray-700">Max Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    value={userSettings.maxLoginAttempts}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                    className="h-10 border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <Separator className="bg-gray-100" />

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Enforce 2FA for all user accounts</p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-purple-600"
                    checked={userSettings.twoFactorAuth}
                    onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">Auto Logout</Label>
                    <p className="text-sm text-gray-500">Automatically log out users after inactivity</p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-purple-600"
                    checked={userSettings.autoLogout}
                    onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, autoLogout: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveSettings('User Management')}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px] shadow-sm rounded-lg h-10 px-6"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Notification Preferences</CardTitle>
                  <CardDescription>Manage how and when you receive system alerts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email', checked: notificationSettings.emailNotifications },
                  { id: 'smsNotifications', label: 'SMS Notifications', desc: 'Get urgent alerts sent directly to your phone', checked: notificationSettings.smsNotifications },
                  { id: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time browser notifications for active sessions', checked: notificationSettings.pushNotifications },
                  { id: 'systemAlerts', label: 'System Alerts', desc: 'Notifications about system maintenance and downtime', checked: notificationSettings.systemAlerts },
                  { id: 'performanceAlerts', label: 'Performance Alerts', desc: 'Alerts when system load exceeds expected thresholds', checked: notificationSettings.performanceAlerts },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium text-gray-900">{item.label}</Label>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      className="data-[state=checked]:bg-orange-500"
                      checked={item.checked as boolean}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [item.id]: checked }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveSettings('Notification')}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] shadow-sm rounded-lg h-10 px-6"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6 mt-0">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Email Configuration</CardTitle>
                  <CardDescription>SMTP settings for outgoing system emails</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="smtpServer" className="text-sm font-medium text-gray-700">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={emailConfig.smtpServer}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpServer: e.target.value }))}
                    className="h-10 border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="smtpPort" className="text-sm font-medium text-gray-700">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                    className="h-10 border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="smtpUsername" className="text-sm font-medium text-gray-700">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailConfig.smtpUsername}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUsername: e.target.value }))}
                    className="h-10 border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="smtpPassword" className="text-sm font-medium text-gray-700">SMTP Password</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailConfig.smtpPassword}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      className="h-10 border-gray-200 rounded-lg pr-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium text-gray-900">Enable SSL</Label>
                  <p className="text-sm text-gray-500">Use Secure Sockets Layer for encrypted communication</p>
                </div>
                <Switch
                  className="data-[state=checked]:bg-green-600"
                  checked={emailConfig.enableSSL}
                  onCheckedChange={(checked) => setEmailConfig(prev => ({ ...prev, enableSSL: checked }))}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveSettings('Email')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[140px] shadow-sm rounded-lg h-10 px-6"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-0">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Security Settings</CardTitle>
                  <CardDescription>Advanced security configurations and audit logs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Security Status: Good</h3>
                    <p className="text-sm text-green-700 mt-1">Your system security settings are optimized. No vulnerabilities detected.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">IP Whitelist</Label>
                  <Input placeholder="Enter IP addresses (comma separated)" className="h-10 border-gray-200 rounded-lg" />
                  <p className="text-sm text-gray-500">Only allow administrative access from these IP addresses</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Audit Log Retention</Label>
                  <Select defaultValue="90">
                    <SelectTrigger className="h-10 border-gray-200 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 h-10">
                  <Shield className="w-4 h-4 mr-2" />
                  Run Security Scan
                </Button>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveSettings('Security')}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[140px] shadow-sm rounded-lg h-10 px-6"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
