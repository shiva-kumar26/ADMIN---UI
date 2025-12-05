
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, MessageSquare, Network, Database } from 'lucide-react';

export const LoadingQueues = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2 mb-4">
      <Users className="w-5 h-5 text-blue-600 animate-pulse" />
      <span className="text-sm text-gray-600">Loading Queues...</span>
    </div>
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const LoadingTemplates = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2 mb-4">
      <MessageSquare className="w-5 h-5 text-green-600 animate-pulse" />
      <span className="text-sm text-gray-600">Loading Templates...</span>
    </div>
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const LoadingDialplan = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2 mb-4">
      <Network className="w-5 h-5 text-purple-600 animate-pulse" />
      <span className="text-sm text-gray-600">Loading Dialplan...</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const LoadingIVRFlows = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2 mb-4">
      <Database className="w-5 h-5 text-blue-600 animate-pulse" />
      <span className="text-sm text-gray-600">Loading IVR Flows...</span>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex space-x-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const SystemLoadingState = () => (
  <div className="space-y-8 p-6">
    <div className="text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <h2 className="text-xl font-semibold text-gray-900">Loading System Components</h2>
      </div>
      <p className="text-gray-600">Please wait while we load queues, templates, and dialplan...</p>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Call Queues</span>
        </h3>
        <LoadingQueues />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <span>Templates</span>
        </h3>
        <LoadingTemplates />
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
        <Network className="w-5 h-5 text-purple-600" />
        <span>Dialplan Configuration</span>
      </h3>
      <LoadingDialplan />
    </div>
  </div>
);