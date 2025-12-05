import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface QueueMetric {
  id: number;
  queue: string;
  serviceLevel60Seconds: string;
  serviceLevel120Seconds: string;
  avgAfterContactWorkTime: string;
  avgAgentInteractionTime: string;
  avgHandleTime: string;
  contactsQueued: number;
  contactsAbandoned: number;
  contactsHandled: number;
  contactsHandledIncoming: number;
  contactsHandledOutbound: number;
}

interface QueueMetricsTableProps {
  data?: QueueMetric[];
  isLoading: boolean;
  error: Error | null;
}

const QueueMetricsTable: React.FC<QueueMetricsTableProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Service level 60 seconds</TableHead>
                <TableHead>Service level 120 seconds</TableHead>
                <TableHead>Average after contact work time</TableHead>
                <TableHead>Average agent interaction time</TableHead>
                <TableHead>Average handle time</TableHead>
                <TableHead>Contacts queued</TableHead>
                <TableHead>Contacts abandoned</TableHead>
                <TableHead>Contacts handled</TableHead>
                <TableHead>Contacts handled incoming</TableHead>
                <TableHead>Contacts handled outbound</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 11 }).map((_, i) => (
                    <TableCell key={i}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center">
        <div className="text-red-800 font-medium mb-2">Error loading queue metrics</div>
        <div className="text-red-600 text-sm">{error.message || 'Failed to load data'}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="text-gray-800 font-medium mb-2">No data available</div>
        <div className="text-gray-600 text-sm">No queue metrics found for the selected criteria</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Queue</TableHead>
            <TableHead className="font-semibold">Service level 60 seconds</TableHead>
            <TableHead className="font-semibold">Service level 120 seconds</TableHead>
            <TableHead className="font-semibold">Average after contact work time</TableHead>
            <TableHead className="font-semibold">Average agent interaction time</TableHead>
            <TableHead className="font-semibold">Average handle time</TableHead>
            <TableHead className="font-semibold">Contacts queued</TableHead>
            <TableHead className="font-semibold">Contacts abandoned</TableHead>
            <TableHead className="font-semibold">Contacts handled</TableHead>
            <TableHead className="font-semibold">Contacts handled incoming</TableHead>
            <TableHead className="font-semibold">Contacts handled outbound</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((metric) => (
            <TableRow key={metric.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{metric.queue}</TableCell>
              <TableCell>{metric.serviceLevel60Seconds}</TableCell>
              <TableCell>{metric.serviceLevel120Seconds}</TableCell>
              <TableCell>{metric.avgAfterContactWorkTime}</TableCell>
              <TableCell>{metric.avgAgentInteractionTime}</TableCell>
              <TableCell>{metric.avgHandleTime}</TableCell>
              <TableCell>{metric.contactsQueued}</TableCell>
              <TableCell>{metric.contactsAbandoned}</TableCell>
              <TableCell>{metric.contactsHandled}</TableCell>
              <TableCell>{metric.contactsHandledIncoming}</TableCell>
              <TableCell>{metric.contactsHandledOutbound}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QueueMetricsTable;
