
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AgentDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-600 mt-2">Your communication hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-pointer hover:scale-105 transition-transform">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">📞</div>
            <CardTitle>Phone</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm opacity-90">Handle voice calls</p>
            <Button variant="secondary" className="mt-4 w-full">
              Start Calling
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white cursor-pointer hover:scale-105 transition-transform">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm opacity-90">Live chat support</p>
            <Button variant="secondary" className="mt-4 w-full">
              Open Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white cursor-pointer hover:scale-105 transition-transform">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">📧</div>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm opacity-90">Email management</p>
            <Button variant="secondary" className="mt-4 w-full">
              Check Emails
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Calls Handled</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between">
                <span>Chat Sessions</span>
                <span className="font-semibold">15</span>
              </div>
              <div className="flex justify-between">
                <span>Emails Processed</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span>Average Response Time</span>
                <span className="font-semibold">2m 30s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                View Call Queue
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Check Messages
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Update Status
              </Button>
              <Button className="w-full justify-start" variant="outline">
                View Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDashboard;
