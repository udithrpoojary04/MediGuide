import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import symptomService from '../services/symptomService';
import { Clock, Trash2, ChevronRight, AlertTriangle, FileText } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await symptomService.getHistory();
        if (response.success) {
          setHistory(response.data);
        }
      } catch (err) {
        setError('Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all your health history? This cannot be undone.')) {
      try {
        await symptomService.deleteAllHistory();
        setHistory([]);
      } catch (err) {
        setError('Failed to delete history');
      }
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'emergency': return 'text-red-700 bg-red-100 border-red-200';
      case 'urgent': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'soon': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'routine': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-2 animate-slide-up">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl mr-3 shadow-lg shadow-primary-500/30">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Symptom History</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Review your past symptom checks and AI-generated insights.
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="mt-4 md:mt-0 flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm border border-red-200 hover:bg-red-50 hover:shadow-md transition-all"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 font-medium animate-slide-up">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-20 animate-slide-up">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card rounded-3xl border border-white/80 p-16 text-center shadow-xl shadow-slate-200/50 animate-slide-up">
          <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-800">No history</h3>
          <p className="mt-2 text-base font-medium text-slate-500">
            You haven't completed any symptom checks yet.
          </p>
          <div className="mt-8">
            <Link
              to="/symptom-checker"
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] hover:shadow-primary-500/50"
            >
              Start Symptom Check
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-white/80 animate-slide-up">
          <ul role="list" className="divide-y divide-slate-100/50">
            {history.map((report, index) => (
              <li key={report._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <Link to={`/history/${report._id}`} className="block hover:bg-white/80 transition-colors p-6">
                  <div className="flex items-center sm:justify-between">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="truncate text-lg font-bold text-slate-800">
                            {report.summary || 'Symptom Check'}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm font-medium text-slate-500">
                            <Clock className="mr-2 h-4 w-4 flex-shrink-0 text-slate-400" />
                            <p>
                              {new Date(report.createdAt).toLocaleDateString()} at{' '}
                              {new Date(report.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex items-center gap-4">
                          {report.urgency && (
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black border ${getUrgencyColor(report.urgency.level)} shadow-sm capitalize`}>
                              {report.urgency.level === 'emergency' && <AlertTriangle className="mr-1 h-3 w-3" />}
                              {report.urgency.level}
                            </span>
                          )}
                          <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                             <ChevronRight className="h-5 w-5 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
};

export default History;
