

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Database, 
  Shield, 
  Mail, 
  Phone, 
  Users, 
  Settings as SettingsIcon,
  Save,
  RefreshCw
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

  // cation Settings
  const [cationSettings, setcationSettings] = useState({
    emailcations: true,
    smscations: false,
    pushcations: true,
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

  return (
    <div className="space-y-6 mt-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Manage your call center system configuration</p>
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="cations">cations</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>System Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serverTimeout">Server Timeout (seconds)</Label>
                  <Input
                    id="serverTimeout"
                    value={systemSettings.serverTimeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, serverTimeout: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCalls">Max Concurrent Calls</Label>
                  <Input
                    id="maxCalls"
                    value={systemSettings.maxConcurrentCalls}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxConcurrentCalls: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call Recording</Label>
                    <p className="text-sm text-gray-500">Enable automatic call recording</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={systemSettings.callRecording}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, callRecording: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-gray-500">Enable daily automatic backups</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Put system in maintenance mode</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('System')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    value={userSettings.sessionTimeout}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    value={userSettings.passwordExpiry}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, passwordExpiry: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    value={userSettings.maxLoginAttempts}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={userSettings.twoFactorAuth}
                    onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Logout</Label>
                    <p className="text-sm text-gray-500">Auto logout inactive users</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={userSettings.autoLogout}
                    onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, autoLogout: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('User Management')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save User Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5" />
                <span>cation Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email cations</Label>
                    <p className="text-sm text-gray-500">Receive cations via email</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={cationSettings.emailcations}
                    onCheckedChange={(checked) => setcationSettings(prev => ({ ...prev, emailcations: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS cations</Label>
                    <p className="text-sm text-gray-500">Receive cations via SMS</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={cationSettings.smscations}
                    onCheckedChange={(checked) => setcationSettings(prev => ({ ...prev, smscations: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push cations</Label>
                    <p className="text-sm text-gray-500">Receive browser push cations</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={cationSettings.pushcations}
                    onCheckedChange={(checked) => setcationSettings(prev => ({ ...prev, pushcations: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-500">Receive system status alerts</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={cationSettings.systemAlerts}
                    onCheckedChange={(checked) => setcationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Performance Alerts</Label>
                    <p className="text-sm text-gray-500">Receive performance-related alerts</p>
                  </div>
                  <Switch
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={cationSettings.performanceAlerts}
                    onCheckedChange={(checked) => setcationSettings(prev => ({ ...prev, performanceAlerts: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('cation')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save cation Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={emailConfig.smtpServer}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpServer: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailConfig.smtpUsername}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUsername: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailConfig.smtpPassword}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable SSL</Label>
                  <p className="text-sm text-gray-500">Use SSL encryption for email</p>
                </div>
                <Switch
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  checked={emailConfig.enableSSL}
                  onCheckedChange={(checked) => setEmailConfig(prev => ({ ...prev, enableSSL: checked }))}
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings('Email')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Email Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800">Security Status</h3>
                  <p className="text-sm text-yellow-700 mt-1">Your system security is currently up to date.</p>
                </div>

                <div className="space-y-2">
                  <Label>IP Whitelist</Label>
                  <Input placeholder="Enter IP addresses (comma separated)" />
                  <p className="text-sm text-gray-500">Only allow access from specified IP addresses</p>
                </div>

                <div className="space-y-2">
                  <Label>Audit Log Retention</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
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

                <Button variant="outline" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  Run Security Scan
                </Button>
              </div>

              <Button 
                onClick={() => handleSaveSettings('Security')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
