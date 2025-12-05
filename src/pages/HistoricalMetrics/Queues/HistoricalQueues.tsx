import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMetricsCounts } from '../MetricsCountsContext';
import moment from 'moment-timezone';
import { CalendarIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQueueMetrics } from '../hooks/useQueueMetrics';
import QueueMetricsTable from '../Queues/QueueMetricsTable';
import TablePagination from '../Pagination/TablePagination';
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

const HistoricalQueues = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [interval, setInterval] = useState('15-minutes-time-interval');
  const [timeZone, setTimeZone] = useState('UTC');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Save report states
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showToast, setShowToast] = useState(false);
  interface SavedReport {
    name: string;
    description: string;
    interval: string;
    startDate?: Date;
    endDate?: Date;
    timeZone: string;
    // Optionally: tableData?: any[];
  }
  const savedReportsRef = useRef<SavedReport[]>([]); // Temporarily store saved reports

  // Get all timezones using moment-timezone
  const timeZones = React.useMemo(() => moment.tz.names(), []);

  // Fetch queue metrics using the custom hook
  const { data, isLoading, error } = useQueueMetrics({
    interval,
    startDate,
    endDate,
    timeZone
  });

  // Set queue count in shared context
  const { setQueues } = useMetricsCounts();
  useEffect(() => {
    if (data) {
      const allQueues = new Set([
        ...data.unique_queue_names,
        ...data.avg_handle_times.map(item => item.queue),
        ...Object.keys(data.contacts_queued),
        ...Object.keys(data.contacts_handled_incoming),
        ...Object.keys(data.contacts_handled_outbound),
        ...Object.keys(data.contacts_handled_per_queue)
      ]);
      setQueues(allQueues.size);
    }
  }, [data, setQueues]);

  // Calculate pagination
  const paginatedData = useMemo(() => {
    if (!data) return null;

    // Get all unique queues from different data sources
    const allQueues = new Set([
      ...data.unique_queue_names,
      ...data.avg_handle_times.map(item => item.queue),
      ...Object.keys(data.contacts_queued),
      ...Object.keys(data.contacts_handled_incoming),
      ...Object.keys(data.contacts_handled_outbound),
      ...Object.keys(data.contacts_handled_per_queue)
    ]);

    // Convert to array and paginate
    const queueArray = Array.from(allQueues);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQueues = queueArray.slice(startIndex, endIndex);

    // Filter the data to only include paginated queues
    return {
      ...data,
      unique_queue_names: paginatedQueues.filter(queue => data.unique_queue_names.includes(queue)),
      avg_handle_times: data.avg_handle_times.filter(item => paginatedQueues.includes(item.queue)),
      service_levels_60_seconds: data.service_levels_60_seconds.filter(item => paginatedQueues.includes(item.queue)),
      service_levels_120_seconds: data.service_levels_120_seconds.filter(item => paginatedQueues.includes(item.queue)),
      avg_after_contact_work_time: data.avg_after_contact_work_time.filter(item => paginatedQueues.includes(item.queue)),
      avg_interaction_times: data.avg_interaction_times.filter(item => paginatedQueues.includes(item.queue)),
      contacts_queued: Object.fromEntries(
        Object.entries(data.contacts_queued).filter(([queue]) => paginatedQueues.includes(queue))
      ),
      contacts_handled_incoming: Object.fromEntries(
        Object.entries(data.contacts_handled_incoming).filter(([queue]) => paginatedQueues.includes(queue))
      ),
      contacts_handled_outbound: Object.fromEntries(
        Object.entries(data.contacts_handled_outbound).filter(([queue]) => paginatedQueues.includes(queue))
      ),
      contacts_handled_per_queue: Object.fromEntries(
        Object.entries(data.contacts_handled_per_queue).filter(([queue]) => paginatedQueues.includes(queue))
      )
    }
  }, [data, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!data) return 0;

    const allQueues = new Set([
      ...data.unique_queue_names,
      ...data.avg_handle_times.map(item => item.queue),
      ...Object.keys(data.contacts_queued),
      ...Object.keys(data.contacts_handled_incoming),
      ...Object.keys(data.contacts_handled_outbound),
      ...Object.keys(data.contacts_handled_per_queue)
    ]);

    return Math.ceil(allQueues.size / itemsPerPage);
  }, [data, itemsPerPage]);

  const totalItems = useMemo(() => {
    if (!data) return 0;

    const allQueues = new Set([
      ...data.unique_queue_names,
      ...data.avg_handle_times.map(item => item.queue),
      ...Object.keys(data.contacts_queued),
      ...Object.keys(data.contacts_handled_incoming),
      ...Object.keys(data.contacts_handled_outbound),
      ...Object.keys(data.contacts_handled_per_queue)
    ]);

    return allQueues.size;
  }, [data]);

  const handleIntervalChange = (value: string) => {
    setInterval(value);
    setShowCustomDateRange(value === 'custom');
  };

  const handleApplySettings = () => {
    setIsSettingsOpen(false);
    setCurrentPage(1); // Reset to first page when applying new settings
    console.log('Applied settings:', { interval, timeZone, startDate, endDate });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Helper to get current table data for export
  const getTableData = () => {
    if (!paginatedData) return [];
    return paginatedData.unique_queue_names.map((queue) => ({
      Queue: queue,
      "Service level 60 seconds":
        paginatedData.service_levels_60_seconds.find((item) => item.queue === queue)?.service_level_60_seconds ?? "",
      "Service level 120 seconds":
        paginatedData.service_levels_120_seconds.find((item) => item.queue === queue)?.service_level_120_seconds ?? "",
      "Average after contact work time":
        paginatedData.avg_after_contact_work_time.find((item) => item.queue === queue)?.avg_time_formatted ?? "",
      "Average agent interaction time":
        paginatedData.avg_interaction_times.find((item) => item.queue === queue)?.avg_time_formatted ?? "",
      "Average handle time":
        paginatedData.avg_handle_times.find((item) => item.queue === queue)?.avg_time_formatted ?? "",
      "Contacts queued": Number(paginatedData.contacts_queued[queue] ?? 0),
      "Contacts abandoned":
        paginatedData.abandoned_contacts?.filter((item: { queue: string }) => item.queue === queue)?.length ?? 0,
      "Contacts handled": Number(paginatedData.contacts_handled_per_queue[queue] ?? 0),
      "Contacts handled incoming": Number(paginatedData.contacts_handled_incoming[queue] ?? 0),
      "Contacts handled outbound": Number(paginatedData.contacts_handled_outbound[queue] ?? 0),
    }));
  };

  // CSV Download
  const handleExportCSV = () => {
    const data = getTableData();
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) => headers.map((field) => `"${row[field]}"`).join(",")),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "queue_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Download
  const handleExportPDF = () => {
    const data = getTableData();
    if (!data.length) return;
    const doc = new jsPDF();
    doc.text("Queue Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [Object.keys(data[0])],
      body: data.map((row) => Object.values(row)),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    } as UserOptions);
    doc.save("queue_report.pdf");
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const handleSaveReport = () => {
    const reportData = {
      name: reportName,
      description: reportDescription,
      interval,
      startDate,
      endDate,
      timeZone,
    };
    savedReportsRef.current.push(reportData);
    console.log("Saved Reports:", savedReportsRef.current); // <-- Add this line
    setIsSaveDialogOpen(false);
    setReportName('');
    setReportDescription('');
    setShowToast(true); // Show toast
    setTimeout(() => setShowToast(false), 3000); // Hide after 3 seconds
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 pt-4 md:pt-6 lg:pt-8">
      <div className="w-[100%] mx-auto overflow-x-hidden">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
          {/* Header Section with gradient */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white" style={{ marginTop: '1rem' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Historical Metrics: Queues</h1>
                <p className="text-blue-100 text-sm">Monitor and analyze your call center queue performance</p>
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-blue-200 min-w-[120px]">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white shadow-lg border border-gray-200">
                    <DropdownMenuItem className="hover:bg-blue-50" onClick={handleExportCSV}>
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-blue-50" onClick={handleExportPDF}>
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-blue-50" onClick={handlePrint}>
                      Print Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="bg-green-600 hover:bg-green-700 shadow-md" onClick={() => setIsSaveDialogOpen(true)}>
                  Save Report
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Interval */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Time Interval
                </label>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-blue-600">
                    {interval}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Current selection
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date Range
                </label>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-blue-600">
                    {startDate && endDate
                      ? `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`
                      : interval === 'Custom Date Range' ? 'Not Selected' : 'Auto'
                    }
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {interval === 'Custom Date Range' ? 'Selected period' : 'Based on interval'}
                  </div>
                </div>
              </div>

              {/* Time Zone */}
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Time Zone
                  </label>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xl font-bold text-blue-600">
                      {timeZone}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Current timezone
                    </div>
                  </div>
                </div>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-4 h-12 w-12 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                      style={{ marginTop: '2rem' }}
                    >
                      <Settings className="h-6 w-6 text-blue-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-800">Configure Report Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-8 py-4">
                      {/* Interval and Timezone Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            Time Interval
                          </label>
                          <Select value={interval} onValueChange={handleIntervalChange}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500">
                              <SelectValue placeholder="Select time interval" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15-minutes-time-interval">15 minutes</SelectItem>
                              <SelectItem value="30-minutes-time-interval">30 minutes</SelectItem>
                              <SelectItem value="today">Today (since 12 AM)</SelectItem>
                              <SelectItem value="custom">Custom Date Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Time Zone Selection */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            Time Zone
                          </label>
                          <Select value={timeZone} onValueChange={setTimeZone}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {timeZones.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                  {tz}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      {showCustomDateRange && (
                        <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="block text-lg font-semibold text-gray-800 mb-4">
                            Select Custom Date Range
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">Start Date</label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400",
                                      !startDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Select start date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">End Date</label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400",
                                      !endDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "Select end date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => setIsSettingsOpen(false)}
                          className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleApplySettings}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Apply Settings
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Queue</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Service level 60s</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Service level 120s</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Avg after contact work</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Avg agent interaction</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Avg handle time</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Queued</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Abandoned</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Handled</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Handled incoming</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Handled outbound</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData && paginatedData.unique_queue_names.length > 0
                    ? paginatedData.unique_queue_names.map((queue, idx) => {
                      return (
                        <tr key={queue} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{queue}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {String(
                              paginatedData.service_levels_60_seconds.find(item => item.queue === queue)?.service_level_60_seconds ?? ''
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {String(
                              paginatedData.service_levels_120_seconds.find(item => item.queue === queue)?.service_level_120_seconds ?? ''
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {String(
                              paginatedData.avg_after_contact_work_time.find(item => item.queue === queue)?.avg_time_formatted ?? ''
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {String(
                              paginatedData.avg_interaction_times.find(item => item.queue === queue)?.avg_time_formatted ?? ''
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {String(
                              paginatedData.avg_handle_times.find(item => item.queue === queue)?.avg_time_formatted ?? ''
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {Number(paginatedData.contacts_queued[queue] ?? 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {paginatedData.abandoned_contacts?.filter((item: { queue: string }) => item.queue === queue)?.length ?? 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {Number(paginatedData.contacts_handled_per_queue[queue] ?? 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {Number(paginatedData.contacts_handled_incoming[queue] ?? 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {Number(paginatedData.contacts_handled_outbound[queue] ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                    : (
                      <tr>
                        <td colSpan={11} className="px-4 py-3 text-center text-sm text-gray-500">
                          No data available for the selected interval
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Section */}
          {!isLoading && !error && totalItems > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span>{isLoading ? 'Loading...' : error ? 'Connection error' : 'Historical data'}</span>
              </div>
            </div>
          </div>

          {/* Save Report Dialog */}
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Report Name"
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                />
                <textarea
                  className="w-full border rounded px-3 py-2"
                  placeholder="Description (optional)"
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveReport} disabled={!reportName}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
              Report saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoricalQueues;