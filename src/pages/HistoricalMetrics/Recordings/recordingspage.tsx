import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Loader2, Filter, Download } from "lucide-react";

const RecordingsPage: React.FC = () => {
  console.log(import.meta.env);
  console.log("API BASE URL FROM ENV:", import.meta.env.VITE_API_BASE_URL);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchAgent, setSearchAgent] = useState("");
  const [searchCaller, setSearchCaller] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [searchQueue, setSearchQueue] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  // 🔹 PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchAgent) params.append("agent", searchAgent);
      if (searchCaller) params.append("caller_id_number", searchCaller);
      if (searchDest) params.append("destination_number", searchDest);
      if (searchQueue) params.append("queue_name", searchQueue);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/recordings?${params.toString()}`
      );

      const data = await response.json();
      setRecordings(data || []);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (err) {
      console.error("Error loading recordings:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  // 🔹 CALCULATE PAGINATION
  const totalRecordings = recordings.length;
  const totalPages = Math.ceil(totalRecordings / pageSize);
  const paginatedRecordings = recordings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      {/* 🔹 BLUE HEADER LIKE HISTORICAL REPORTS */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-semibold">Call Recordings</h1>
        <p className="text-blue-100 mt-1">
          Monitor and playback recorded calls for quality and compliance.
        </p>
      </div>

      <Card className="shadow-md">
        <CardContent>
          {/* 🔹 FILTER TOGGLE BUTTON */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 mb-4"
          >
            <Filter size={16} />
            Filters
          </button>

          {/* SHOW FILTERS WHEN BUTTON CLICKED */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 border animate-fadeIn">
              {/* INPUT GRID */}
              <div className="grid grid-cols-4 gap-4">
                <input
                  className="border border-gray-300 p-2 rounded-md text-sm"
                  placeholder="Search Agent"
                  value={searchAgent}
                  onChange={(e) => setSearchAgent(e.target.value)}
                />

                <input
                  className="border border-gray-300 p-2 rounded-md text-sm"
                  placeholder="Caller ID"
                  value={searchCaller}
                  onChange={(e) => setSearchCaller(e.target.value)}
                />

                <input
                  className="border border-gray-300 p-2 rounded-md text-sm"
                  placeholder="Destination"
                  value={searchDest}
                  onChange={(e) => setSearchDest(e.target.value)}
                />

                <input
                  className="border border-gray-300 p-2 rounded-md text-sm"
                  placeholder="Queue Name"
                  value={searchQueue}
                  onChange={(e) => setSearchQueue(e.target.value)}
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={fetchRecordings}
                  className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded-md shadow hover:bg-blue-700"
                >
                  Search
                </button>

                <button
                  onClick={() => {
                    setSearchAgent("");
                    setSearchCaller("");
                    setSearchDest("");
                    setSearchQueue("");
                    fetchRecordings();
                  }}
                  className="bg-gray-300 text-black px-4 py-1.5 text-sm rounded-md shadow hover:bg-gray-400"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* 🔹 ROWS PER PAGE SELECTOR */}
          {!loading && recordings.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Rows per page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 p-2 rounded-md text-sm"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}

          {/* 🔹 LOADING */}
          {loading ? (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
              <span className="ml-2 text-gray-600">Loading recordings...</span>
            </div>
          ) : recordings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No recordings found.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto mt-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 text-gray-700">
                      <TableHead>Call ID</TableHead>
                      <TableHead>Caller ID</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Queue</TableHead>
                      <TableHead>Recording File</TableHead>
                      <TableHead>Play</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedRecordings.map((rec, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>{rec.call_log_id}</TableCell>
                        <TableCell>{rec.caller_id_number}</TableCell>
                        <TableCell>{rec.destination_number}</TableCell>
                        <TableCell>{rec.agent}</TableCell>
                        <TableCell>{rec.queue_name}</TableCell>
                        <TableCell className="max-w-xs break-words">
                          {rec.record_filename}
                        </TableCell>

                        {/* 🔹 PLAY + DOWNLOAD */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {/* BIG AUDIO PLAYER */}
                            <audio
                              controls
                              preload="metadata"
                              className="w-72 h-10"
                            >
                              <source
                                src={`${
                                  import.meta.env.VITE_API_BASE_URL
                                }/api/recordings/play/${rec.id}`}
                                type="audio/mpeg"
                              />
                            </audio>

                            {/* DOWNLOAD ICON */}
                            <a
                              href={`${
                                import.meta.env.VITE_API_BASE_URL
                              }/api/recordings/play/${rec.id}`}
                              download
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Download size={22} />
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 🔹 PAGINATION CONTROLS */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalRecordings)} of{" "}
                  {totalRecordings} recordings
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordingsPage;
