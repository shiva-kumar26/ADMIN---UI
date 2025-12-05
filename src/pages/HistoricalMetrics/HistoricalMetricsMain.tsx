import React from 'react';
import { useMetricsCounts } from './MetricsCountsContext';
import { Phone, Users, Headphones, LogIn, FileText } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  description: string;
  bgGradient: string;
  onButtonClick?: () => void; 
}

const MetricCard = ({ title, icon, value, description, bgGradient, onButtonClick }: MetricCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className={`${bgGradient} p-6 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <div className="text-3xl font-bold">{value}</div>
          </div>
          <div className="text-white opacity-80">
            {icon}
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-green-600 font-medium text-sm">↗ Active</span>
          <button
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            onClick={onButtonClick}
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoricalMetricsMain = () => {
  const navigate = useNavigate(); 
  const { queues, agents, loginLogout, cdrReports } = useMetricsCounts();

  return (
    <div className="h-[(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 pt-4" style={{ marginTop: '3rem' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Historical Metrics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor your call center performance with real-time insights
          </p>
        </div>

        {/* Metrics Cards Grid */}
        <div className="w-full overflow-x-auto" style={{ marginTop: '2.5rem' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
              <MetricCard
                title="Queues"
                icon={<Headphones size={40} />}
                value={queues.toString()}
                description="Active call queues handling customer inquiries across different departments and priority levels."
                bgGradient="bg-gradient-to-r from-blue-500 to-blue-600"
                onButtonClick={() => navigate('/historical-queues')}
              />
            
            
            <MetricCard
              title="Agents"
              icon={<Users size={40} />}
              value={agents.toString()}
              description="Available agents ready to assist customers with professional support and expertise."
              bgGradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
              onButtonClick={() => navigate('/historical-agents')}
            />

            <MetricCard
              title="Login/Logout"
              icon={<LogIn size={40} />}
              value={loginLogout.toString()}
              description="Track agent login and logout activities for better workforce management."
              bgGradient="bg-gradient-to-r from-orange-500 to-orange-600"
              onButtonClick={() => navigate('/agent-login-logout')}
            />

            {/* New CDR Reports Card */}
           <MetricCard
              title="CDR Reports"
              icon={<FileText size={40} />}
              value={cdrReports.toString()}
              description="Access detailed call records and export CDR reports for compliance and analytics."
              bgGradient="bg-gradient-to-r from-violet-500 to-violet-600"
              onButtonClick={() => navigate('/cdr-reports')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalMetricsMain;
