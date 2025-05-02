'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Mail, Bell, Shield, Database, RefreshCw } from 'lucide-react';

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Sample settings state (would typically come from an API)
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Virginia Discovery Museum',
      enablePublicSignup: true,
      requireAdminApproval: true,
      volunteerReminderHours: 24,
    },
    email: {
      enableNotifications: true,
      sendShiftReminders: true,
      sendAdminReports: true,
      weeklyReportDay: 'Monday',
    },
    security: {
      sessionTimeoutMinutes: 60,
      enforcePasswordComplexity: true,
      requireTwoFactor: false,
    }
  });

  const handleSettingsChange = (category, key, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send the settings to your API
      // const response = await axios.post('/api/admin/settings', settings);
      
      toast({
        title: "Settings saved",
        description: "Your system settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">System Settings</h1>
          <p className="text-muted-foreground">
            Manage application settings and configuration.
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings and volunteer management options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={settings.general.siteName} 
                  onChange={(e) => handleSettingsChange('general', 'siteName', e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="enablePublicSignup">Enable Public Volunteer Signup</Label>
                <Switch
                  id="enablePublicSignup"
                  checked={settings.general.enablePublicSignup}
                  onCheckedChange={(checked) => handleSettingsChange('general', 'enablePublicSignup', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="requireAdminApproval">Require Admin Approval for New Volunteers</Label>
                <Switch
                  id="requireAdminApproval"
                  checked={settings.general.requireAdminApproval}
                  onCheckedChange={(checked) => handleSettingsChange('general', 'requireAdminApproval', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="volunteerReminderHours">Volunteer Shift Reminder (Hours Before)</Label>
                <Input 
                  id="volunteerReminderHours" 
                  type="number"
                  value={settings.general.volunteerReminderHours} 
                  onChange={(e) => handleSettingsChange('general', 'volunteerReminderHours', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure email notifications and reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-0">
                <Label htmlFor="enableNotifications">Enable Email Notifications</Label>
                <Switch
                  id="enableNotifications"
                  checked={settings.email.enableNotifications}
                  onCheckedChange={(checked) => handleSettingsChange('email', 'enableNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="sendShiftReminders">Send Shift Reminders</Label>
                <Switch
                  id="sendShiftReminders"
                  checked={settings.email.sendShiftReminders}
                  onCheckedChange={(checked) => handleSettingsChange('email', 'sendShiftReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="sendAdminReports">Send Admin Weekly Reports</Label>
                <Switch
                  id="sendAdminReports"
                  checked={settings.email.sendAdminReports}
                  onCheckedChange={(checked) => handleSettingsChange('email', 'sendAdminReports', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weeklyReportDay">Weekly Report Day</Label>
                <select 
                  id="weeklyReportDay"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.email.weeklyReportDay}
                  onChange={(e) => handleSettingsChange('email', 'weeklyReportDay', e.target.value)}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security options and user access controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number"
                  value={settings.security.sessionTimeoutMinutes} 
                  onChange={(e) => handleSettingsChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="enforcePasswordComplexity">Enforce Password Complexity</Label>
                <Switch
                  id="enforcePasswordComplexity"
                  checked={settings.security.enforcePasswordComplexity}
                  onCheckedChange={(checked) => handleSettingsChange('security', 'enforcePasswordComplexity', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                <Switch
                  id="requireTwoFactor"
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) => handleSettingsChange('security', 'requireTwoFactor', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Manage database operations and maintenance tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="border border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-900 text-base">Database Backup</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-amber-700 text-sm mb-3">
                    Create a backup of the database. This may take a few minutes depending on the size.
                  </p>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Create Database Backup
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-900 text-base">Optimize Database</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-blue-700 text-sm mb-3">
                    Run optimization routines on the database to improve performance.
                  </p>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Run Optimization
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-900 text-base">Data Cleanup</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-red-700 text-sm mb-3">
                    Clean up old data, logs, and temporary files to free up space.
                  </p>
                  <Button variant="outline" className="w-full sm:w-auto text-red-600">
                    Run Data Cleanup
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center justify-end space-x-4">
        <Button variant="outline" disabled={saving}>
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
} 