import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, RefreshCw, X, Eye, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// ✅ NEW: Interface for Agent
interface Agent {
  extension: string;
  full_name: string;
}

interface TranscriptMessage {
  role: 'agent' | 'customer';
  message?: string;
  text?: string;
  timestamp?: string;
}

interface QAScore {
  alert_id: number;
  call_id: string;
  agent_id: string;
  customer_id: string;
  qa_score: number;
  message: string;
  created_at: string;
}

const API_BASE_URL = 'http://10.16.7.96:8001';

const QualityAnalyzerPage = () => {
  const { authState } = useAuth();
  const [data, setData] = useState<QAScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // ✅ FIXED: State is now an array of Agent objects
  const [agents, setAgents] = useState<Agent[]>([]); 
  
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    agent: '',
    customer: '',
    scoreCategory: '',
    startDate: '',
    endDate: '',
  });

  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [selectedQABreakdown, setSelectedQABreakdown] = useState<any>(null);
  const [currentRowData, setCurrentRowData] = useState<QAScore | null>(null);

  const improvementTopics = [
    "Improve communication", "Improve English fluency", "Reduce long pauses",
    "Follow call flow properly", "Maintain polite tone", "Improve empathy",
    "Avoid interruptions", "Give clearer solutions", "Use the script correctly"
  ];

  const [selectedImprovements, setSelectedImprovements] = useState<Record<string, boolean>>({});
  const [manualScores, setManualScores] = useState<Record<string, number>>({
    professionalism: 0, communication: 0, compliance: 0, empathy: 0
  });

  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  const supervisorUsername = authState.user?.user_id;

  useEffect(() => {
    if (supervisorUsername) {
      fetchAgents();
      fetchQualityData();
    } else {
      setError('Could not determine supervisor username from session');
    }
  }, [supervisorUsername]);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/supervisor/agents?supervisor_id=${supervisorUsername}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // ✅ Confirmed: response.data is an array of objects
      setAgents(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching agents:', error);
      setError(`Failed to fetch agents: ${error.response?.data?.detail || error.message}`);
    }
  };

  const fetchQualityData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/qa/supervisor-scores?supervisor_id=${supervisorUsername}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);

      // Extract unique customer IDs
      try {
        const customerSet = new Set<string>();
        response.data.forEach((item: QAScore) => {
          if (item && item.customer_id) {
            const customerId = String(item.customer_id).trim();
            if (customerId && customerId !== 'null' && customerId !== 'undefined' && customerId !== '') {
              customerSet.add(customerId);
            }
          }
        });
        setCustomers(Array.from(customerSet).sort());
      } catch (processError) {
        console.error('⚠️ Error processing customers:', processError);
        setCustomers([]);
      }
      setCurrentPage(1);
    } catch (error: any) {
      console.error('❌ Error fetching QA scores:', error);
      setError(`Failed to fetch QA scores: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HELPER: Get Agent Name from ID
  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.extension === agentId);
    return agent ? agent.full_name : agentId;
  };

  const fetchTranscript = async (callId: string, qaMessage: string, rowData: QAScore) => {
    setLoadingTranscript(true);
    setSelectedCallId(callId);
    setCurrentRowData(rowData);
    try {
      const breakdown = JSON.parse(qaMessage);
      setSelectedQABreakdown(breakdown);
    } catch (e) {
      setSelectedQABreakdown(null);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/qa/transcript/${callId}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.transcript) {
        const transcriptData = response.data.transcript;
        let normalizedTranscript: TranscriptMessage[] = [];

        if (Array.isArray(transcriptData)) {
          normalizedTranscript = transcriptData.map((msg: any) => ({
            role: msg.role?.toLowerCase() || 'customer',
            message: msg.text || msg.message || String(msg),
            timestamp: msg.timestamp
          }));
        } else if (typeof transcriptData === 'object') {
          if (transcriptData.Agent && Array.isArray(transcriptData.Agent)) {
            transcriptData.Agent.forEach((msg: any) => normalizedTranscript.push({
              role: 'agent', message: msg.text || msg.message || String(msg), timestamp: msg.timestamp,
            }));
          }
          if (transcriptData.Customer && Array.isArray(transcriptData.Customer)) {
            transcriptData.Customer.forEach((msg: any) => normalizedTranscript.push({
              role: 'customer', message: msg.text || msg.message || String(msg), timestamp: msg.timestamp,
            }));
          }
          normalizedTranscript.sort((a, b) => (a.timestamp && b.timestamp ? a.timestamp.localeCompare(b.timestamp) : 0));
        }
        setTranscript(normalizedTranscript);
      } else {
        setTranscript([]);
      }
    } catch (error) {
      setTranscript([]);
    } finally {
      setLoadingTranscript(false);
    }
  };

  const closeTranscriptModal = () => {
    setSelectedCallId(null);
    setTranscript([]);
    setSelectedQABreakdown(null);
    setCurrentRowData(null);
    setCalculatedScore(null);
    setSelectedImprovements({});
    setManualScores({ professionalism: 0, communication: 0, compliance: 0, empathy: 0 });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const applyFilters = () => {
    let filtered = [...data];
    if (filters.agent) filtered = filtered.filter(item => item.agent_id === filters.agent);
    if (filters.customer) filtered = filtered.filter(item => item.customer_id === filters.customer);
    if (filters.scoreCategory) {
      if (filters.scoreCategory === 'excellent') filtered = filtered.filter(item => item.qa_score >= 80);
      else if (filters.scoreCategory === 'good') filtered = filtered.filter(item => item.qa_score >= 50 && item.qa_score < 80);
      else if (filters.scoreCategory === 'poor') filtered = filtered.filter(item => item.qa_score < 50);
    }
    if (filters.startDate) {
      filtered = filtered.filter(item => new Date(item.created_at) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.created_at) <= endDate);
    }
    return filtered;
  };

  const resetFilters = () => {
    setFilters({ agent: '', customer: '', scoreCategory: '', startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#d1fae5', text: '#065f46' };
    if (score >= 50) return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#fee2e2', text: '#991b1b' };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
    } catch { return 'Invalid Date'; }
  };

  const parseMessage = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      return Object.entries(parsed).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '8px', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{key.replace(/_/g, ' ').toUpperCase()}</div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>{String(value)}</div>
        </div>
      ));
    } catch { return <div style={{ whiteSpace: 'pre-wrap' }}>{message}</div>; }
  };

  const toggleImprovement = (topic: string) => {
    setSelectedImprovements(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  const handleSliderChange = (field: string, value: number) => {
    setManualScores(prev => ({ ...prev, [field]: value }));
  };

  const calculateScore = (): number => {
    const scores = Object.values(manualScores);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    return Math.round((average / 10) * 100);
  };

  const submitReviewForm = async () => {
    const token = localStorage.getItem("token");
    if (!selectedCallId) return alert("No call selected to review.");
    const calculatedFinalScore = calculateScore();
    setCalculatedScore(calculatedFinalScore);

    const payload = {
      call_id: selectedCallId,
      agent_id: currentRowData?.agent_id || "unknown",
      alert_id: currentRowData?.alert_id || 0,
      improvements: selectedImprovements,
      manual_scores: manualScores,
      calculated_score: calculatedFinalScore
    };

    try {
      await axios.post(`${API_BASE_URL}/qa/manual-review`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      fetchQualityData().catch(err => console.error('Refresh failed:', err));
    } catch (err: any) {
      console.error("Submit error", err);
      alert("Failed to submit review");
    }
  };

  const filteredData = applyFilters();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, endIndex);
  const avgScore = filteredData.length > 0 ? (filteredData.reduce((sum, item) => sum + item.qa_score, 0) / filteredData.length).toFixed(1) : '0';
  const excellentScores = data.filter(item => item.qa_score >= 80).length;
  const goodScores = data.filter(item => item.qa_score >= 50 && item.qa_score < 80).length;
  const poorScores = data.filter(item => item.qa_score < 50).length;

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#2563eb', padding: '32px', borderRadius: '12px', marginBottom: '24px', color: 'white' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, marginBottom: '8px' }}>Quality Analyzer</h1>
        <p style={{ fontSize: '16px', opacity: 0.95, margin: 0 }}>Monitor call quality scores, agent performance, and compliance metrics for your team.</p>
      </div>

      {error && <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}><strong>⚠️ Error:</strong> {error}</div>}

      {/* Debug Info */}
      <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', lineHeight: '1.8' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div><strong style={{ fontWeight: '600' }}>🔑 Supervisor:</strong> <span style={{ fontWeight: '400' }}>{supervisorUsername || 'NOT FOUND'}</span></div>
          <div>
            <strong style={{ fontWeight: '600' }}>👥 Agents:</strong> <span style={{ fontWeight: '400' }}>{agents.length}</span>
            {agents.length > 0 && (
              <span style={{ fontWeight: '400', color: '#0369a1', marginLeft: '8px' }}>
                {/* ✅ FIXED: Map objects to strings */}
                ({agents.map(a => a.full_name || a.extension).join(', ')})
              </span>
            )}
          </div>
          <div><strong style={{ fontWeight: '600' }}>📞 Customers:</strong> <span style={{ fontWeight: '400' }}>{customers.length}</span></div>
          <div><strong style={{ fontWeight: '600' }}>📊 QA Scores:</strong> <span style={{ fontWeight: '400' }}>{data.length}</span></div>
          <div><strong style={{ fontWeight: '600' }}>⭐ Avg Score:</strong> <span style={{ fontWeight: '400' }}>{avgScore}%</span></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Total Scores</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>{data.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Average Score</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{avgScore}%</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Excellent (≥80%)</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>{excellentScores}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Good (50-79%)</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{goodScores}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Needs Improvement (&lt;50%)</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>{poorScores}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <button onClick={() => setShowFilters(!showFilters)} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
          <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button onClick={fetchQualityData} disabled={loading} style={{ backgroundColor: loading ? '#94a3b8' : '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
          <RefreshCw size={18} /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {showFilters && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Agent</label>
              <select name="agent" value={filters.agent} onChange={handleFilterChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                <option value="">All Agents</option>
                {/* ✅ FIXED: Map using extension and full_name */}
                {agents.map(agent => (
                  <option key={agent.extension} value={agent.extension}>{agent.full_name || agent.extension}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Customer</label>
              <select name="customer" value={filters.customer} onChange={handleFilterChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                <option value="">All Customers</option>
                {customers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Score Category</label>
              <select name="scoreCategory" value={filters.scoreCategory} onChange={handleFilterChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                <option value="">All Scores</option>
                <option value="excellent">Excellent (≥80%)</option>
                <option value="good">Good (50-79%)</option>
                <option value="poor">Needs Improvement (&lt;50%)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Start Date</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> End Date</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
            </div>
          </div>
          <button onClick={resetFilters} style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '16px', fontWeight: '500' }}>Reset Filters</button>
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', minHeight: '400px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontSize: '16px', color: '#6b7280' }}>Loading...</div>
        ) : currentPageData.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Alert ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Call ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Agent</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>QA Score</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Created At</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((item, idx) => {
                    const color = getScoreColor(item.qa_score);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>{item.alert_id}</td>
                        <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'monospace', color: '#1f2937' }}>{item.call_id}</td>
                        {/* ✅ FIXED: Use getAgentName helper */}
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{getAgentName(item.agent_id)}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>{item.customer_id || 'N/A'}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <span style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: color.bg, color: color.text, fontWeight: '600' }}>
                            {item.qa_score}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <button onClick={() => fetchTranscript(item.call_id, item.message, item)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                            <Eye size={16} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Show:</label>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>
                    <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
                  </select>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>entries</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return <button key={page} onClick={() => goToPage(page)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: currentPage === page ? '#2563eb' : 'white', color: currentPage === page ? 'white' : '#374151', cursor: 'pointer', fontWeight: currentPage === page ? '600' : '400', minWidth: '40px', fontSize: '14px' }}>{page}</button>;
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} style={{ padding: '8px 4px', color: '#6b7280' }}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No QA scores found</div>
            <div style={{ fontSize: '14px' }}>Data will appear here once available</div>
          </div>
        )}
      </div>

      {selectedMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedMessage(null)}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMessage(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontWeight: '600', fontSize: '18px', color: '#1f2937' }}>QA Score Details</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{parseMessage(selectedMessage)}</div>
          </div>
        </div>
      )}

      {selectedCallId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={closeTranscriptModal}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', maxWidth: '1100px', width: '95%', maxHeight: '120vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Call Transcript & QA Analysis</h2><p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '6px', marginBottom: 0 }}>Call ID: {selectedCallId}</p></div>
                <button onClick={closeTranscriptModal} style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}><X size={20} color="white" /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', height: 'calc(90vh - 100px)', backgroundColor: '#f9fafb' }}>
              <div style={{ padding: '24px', overflowY: 'auto', borderRight: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginTop: 0, marginBottom: '16px' }}>Conversation</h3>
                {loadingTranscript ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>Loading transcript...</div></div>
                ) : transcript.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No transcript available</div><p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>This call does not have a transcript yet.</p></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {transcript.map((msg, idx) => {
                      const messageText = msg.message || msg.text || '';
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: msg.role === 'agent' ? 'row-reverse' : 'row', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: msg.role === 'agent' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>{msg.role === 'agent' ? '🎧' : '👤'}</div>
                          <div style={{ maxWidth: '70%' }}>
                            <div style={{ display: 'inline-block', padding: '10px 14px', borderRadius: '12px', backgroundColor: msg.role === 'agent' ? '#9333ea' : 'white', color: msg.role === 'agent' ? 'white' : '#374151', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                              <div style={{ fontWeight: '600', fontSize: '11px', marginBottom: '3px', opacity: 0.9 }}>{msg.role === 'agent' ? 'Agent' : 'Customer'}</div>
                              <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{messageText}</div>
                            </div>
                            {msg.timestamp && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', textAlign: msg.role === 'agent' ? 'right' : 'left' }}>{msg.timestamp}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ padding: '24px', overflowY: 'auto', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginTop: 0, marginBottom: '16px' }}>QA Score Breakdown</h3>
                {selectedQABreakdown ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedQABreakdown.agent_performance !== undefined && (
                      <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}><div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Agent Performance</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>{selectedQABreakdown.agent_performance}</div></div>
                    )}
                    {selectedQABreakdown.customer_experience !== undefined && (
                      <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}><div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Customer Experience</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{selectedQABreakdown.customer_experience}</div></div>
                    )}
                    {selectedQABreakdown.call_efficiency !== undefined && (
                      <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}><div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Call Efficiency</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{selectedQABreakdown.call_efficiency}</div></div>
                    )}
                    {selectedQABreakdown.components && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Score Components</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.entries(selectedQABreakdown.components).map(([key, value]) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}><span style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span><span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{String(value)}</span></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}><div style={{ fontSize: '16px' }}>No score breakdown available</div></div>
                )}
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Supervisor Review Form</h3>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#374151' }}>Improvement Suggestions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {improvementTopics.map((topic, index) => (
                        <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input type="checkbox" checked={selectedImprovements[topic] || false} onChange={() => toggleImprovement(topic)} />
                          <span style={{ fontSize: '14px', color: '#444' }}>{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#374151' }}>Manual Scoring</h4>
                    {[
                      { key: "professionalism", label: "Professionalism" },
                      { key: "communication", label: "Communication Clarity" },
                      { key: "compliance", label: "Compliance Accuracy" },
                      { key: "empathy", label: "Empathy / Tone" }
                    ].map((item) => (
                      <div key={item.key} style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500' }}>{item.label}: {manualScores[item.key]}</label>
                        <input type="range" min="0" max="10" value={manualScores[item.key]} onChange={(e) => handleSliderChange(item.key, Number(e.target.value))} style={{ width: "100%" }} />
                      </div>
                    ))}
                  </div>
                  <button onClick={submitReviewForm} style={{ width: "100%", backgroundColor: "#2563eb", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginBottom: "12px" }}>Submit Review</button>
                  {calculatedScore !== null && (
                    <div style={{ padding: '14px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '2px solid #10b981', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#047857', marginBottom: '6px', textTransform: 'uppercase' }}>📊 Calculated Score</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669' }}>{calculatedScore}%</div>
                    </div>
                  )}
                  <button onClick={closeTranscriptModal} style={{ width: "100%", backgroundColor: "#6b7280", color: "white", padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", marginTop: "12px" }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityAnalyzerPage;
