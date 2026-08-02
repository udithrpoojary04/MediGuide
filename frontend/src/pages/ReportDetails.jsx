import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import symptomService from '../services/symptomService';
import { Trash2, ArrowLeft, AlertTriangle, MapPin, Sparkles, User, FileText } from 'lucide-react';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await symptomService.getReport(id);
        if (response.success) {
          setReport(response.data);
        }
      } catch (err) {
        setError('Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await symptomService.deleteReport(id);
        navigate('/history');
      } catch (err) {
        setError('Failed to delete report');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center p-20 animate-slide-up">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout>
        <div className="glass-card rounded-3xl text-center p-16 animate-slide-up border border-white/80 shadow-xl shadow-slate-200/50">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Report Not Found</h2>
          <p className="text-slate-500 mb-8 font-medium">{error || 'The requested report could not be found.'}</p>
          <Link to="/history" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] hover:shadow-primary-500/50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 animate-slide-up">
        <div>
          <Link to="/history" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors mb-4 bg-white/50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to History
          </Link>
          <div className="flex items-center">
             <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl mr-3 shadow-lg shadow-primary-500/30">
               <FileText className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Symptom Report</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Recorded on {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                </p>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/healthcare')}
            className="flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all"
          >
            <MapPin className="mr-2 h-4 w-4 text-primary-500" />
            Find Care
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-red-600 shadow-sm border border-red-200 hover:bg-red-50 hover:shadow-md transition-all"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 animate-slide-up border border-white/80">
        <div className="p-8 md:p-10">
          <div className="mb-10 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-2">Summary</h3>
            <p className="text-lg text-slate-700 leading-relaxed font-medium">{report.summary}</p>
          </div>

          {report.urgency && (
            <div className={`mb-10 p-6 rounded-2xl border ${
              report.urgency.level === 'emergency' ? 'bg-red-50 border-red-200 shadow-sm shadow-red-100' :
              report.urgency.level === 'urgent' ? 'bg-orange-50 border-orange-200 shadow-sm shadow-orange-100' :
              report.urgency.level === 'soon' ? 'bg-amber-50 border-amber-200 shadow-sm shadow-amber-100' :
              'bg-blue-50 border-blue-200 shadow-sm shadow-blue-100'
            }`}>
              <div className="flex items-start">
                <AlertTriangle className={`h-8 w-8 mt-1 ${
                  report.urgency.level === 'emergency' ? 'text-red-500' :
                  report.urgency.level === 'urgent' ? 'text-orange-500' :
                  report.urgency.level === 'soon' ? 'text-amber-500' :
                  'text-blue-500'
                }`} />
                <div className="ml-4">
                  <h3 className={`text-xl font-black capitalize ${
                    report.urgency.level === 'emergency' ? 'text-red-700' :
                    report.urgency.level === 'urgent' ? 'text-orange-700' :
                    report.urgency.level === 'soon' ? 'text-amber-700' :
                    'text-blue-700'
                  }`}>
                    Urgency: {report.urgency.level}
                  </h3>
                  <p className="mt-2 text-slate-700 font-medium leading-relaxed">{report.urgency.reason}</p>
                </div>
              </div>
            </div>
          )}

          {report.possibleExplanations && report.possibleExplanations.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">Possible Explanations</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {report.possibleExplanations.map((exp, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-800 text-lg">{exp.name}</h4>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.warningSigns && report.warningSigns.length > 0 && (
            <div className="mb-10 p-6 bg-red-50/50 rounded-2xl border border-red-100">
              <h3 className="text-sm uppercase tracking-widest font-bold text-red-500 mb-4">Warning Signs</h3>
              <ul className="space-y-2">
                {report.warningSigns.map((sign, idx) => (
                  <li key={idx} className="flex items-start text-sm text-red-700 font-medium">
                     <span className="mr-2">•</span>
                     {sign}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.selfCareInformation && report.selfCareInformation.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">General Care Information</h3>
              <ul className="space-y-3">
                {report.selfCareInformation.map((info, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <div className="bg-white p-1 rounded-full shadow-sm mr-3 mt-0.5"><Sparkles className="w-3 h-3 text-primary-500" /></div>
                     {info}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.recommendedAction && (
            <div className="mb-10 p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-lg">
              <h3 className="text-sm uppercase tracking-widest font-bold text-slate-300 mb-2">Recommended Next Step</h3>
              <p className="text-lg font-medium text-white">{report.recommendedAction}</p>
            </div>
          )}
          
          <div className="mt-10 border-t border-slate-100/80 pt-8">
            <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-6">Conversation Transcript</h3>
            <div className="space-y-6 max-h-[500px] overflow-y-auto p-6 bg-slate-50/50 rounded-2xl border border-slate-100 scroll-smooth shadow-inner">
              {report.conversation?.filter(m => m.role !== 'system').map((msg, index) => (
                <div key={index} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md mr-2 mb-1 flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-3xl px-5 py-4 shadow-sm text-sm font-medium leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-br-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow-inner ml-2 mb-1 flex-shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportDetails;
