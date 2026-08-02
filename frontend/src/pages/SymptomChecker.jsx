import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import symptomService from '../services/symptomService';
import { Send, Loader2, AlertTriangle, Mic, Sparkles, User, ChevronRight } from 'lucide-react';

const SymptomChecker = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am MediGuide AI. Please describe your symptoms in detail so I can help you understand what might be going on.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, result, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || result) return;

    const userMsg = input.trim();
    setInput('');
    setError('');
    
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await symptomService.sendMessage(newMessages.filter(m => m.role !== 'system')); 
      
      if (response.success && response.data) {
        if (response.data.type === 'question') {
          setMessages([...newMessages, { role: 'assistant', content: response.data.message }]);
        } else if (response.data.type === 'result') {
          setResult(response.data.data);
          try {
            await symptomService.saveReport(newMessages, response.data.data);
          } catch(err) {
             console.error("Failed to save report automatically", err);
          }
        }
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setMessages([{ role: 'assistant', content: 'Hello! I am MediGuide AI. Please describe your symptoms in detail so I can help you understand what might be going on.' }]);
    setResult(null);
    setError('');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl animate-slide-up">
        <div className="flex items-center mb-2 mt-2">
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl mr-3 shadow-lg shadow-primary-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Symptom Checker</h1>
        </div>
        <p className="text-base text-slate-500 mb-8 ml-11">
          Provide your symptoms to receive an AI-powered preliminary analysis. <br/>
          <span className="text-xs font-semibold text-slate-400">Note: This is not a medical diagnosis. Consult a professional for advice.</span>
        </p>

        {result ? (
          <div className="glass-card rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 animate-slide-up">
            <div className="p-8 md:p-10">
              <div className="flex items-center border-b border-slate-100 pb-6 mb-8">
                <div className="bg-emerald-100 p-3 rounded-full mr-4 text-emerald-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Analysis Complete</h2>
              </div>
              
              <div className="mb-10 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-2">Summary</h3>
                <p className="text-lg text-slate-700 leading-relaxed font-medium">{result.summary}</p>
              </div>

              {result.urgency && (
                <div className={`mb-10 p-6 rounded-2xl border ${
                  result.urgency.level === 'emergency' ? 'bg-red-50 border-red-200 shadow-sm shadow-red-100' :
                  result.urgency.level === 'urgent' ? 'bg-orange-50 border-orange-200 shadow-sm shadow-orange-100' :
                  result.urgency.level === 'soon' ? 'bg-amber-50 border-amber-200 shadow-sm shadow-amber-100' :
                  'bg-blue-50 border-blue-200 shadow-sm shadow-blue-100'
                }`}>
                  <div className="flex items-start">
                    <AlertTriangle className={`h-8 w-8 mt-1 ${
                      result.urgency.level === 'emergency' ? 'text-red-500' :
                      result.urgency.level === 'urgent' ? 'text-orange-500' :
                      result.urgency.level === 'soon' ? 'text-amber-500' :
                      'text-blue-500'
                    }`} />
                    <div className="ml-4">
                      <h3 className={`text-xl font-black capitalize ${
                        result.urgency.level === 'emergency' ? 'text-red-700' :
                        result.urgency.level === 'urgent' ? 'text-orange-700' :
                        result.urgency.level === 'soon' ? 'text-amber-700' :
                        'text-blue-700'
                      }`}>
                        Urgency: {result.urgency.level}
                      </h3>
                      <p className="mt-2 text-slate-700 font-medium leading-relaxed">{result.urgency.reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.possibleExplanations && result.possibleExplanations.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">Possible Explanations</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {result.possibleExplanations.map((exp, idx) => (
                      <div key={idx} className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-slate-800 text-lg">{exp.name}</h4>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.warningSigns && result.warningSigns.length > 0 && (
                <div className="mb-10 p-6 bg-red-50/50 rounded-2xl border border-red-100">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-red-500 mb-4">Warning Signs to Watch For</h3>
                  <ul className="space-y-2">
                    {result.warningSigns.map((sign, idx) => (
                      <li key={idx} className="flex items-start text-sm text-red-700 font-medium">
                        <span className="mr-2">•</span>
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.selfCareInformation && result.selfCareInformation.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">General Care Information</h3>
                  <ul className="space-y-3">
                    {result.selfCareInformation.map((info, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="bg-white p-1 rounded-full shadow-sm mr-3 mt-0.5"><Sparkles className="w-3 h-3 text-primary-500" /></div>
                        {info}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-10 p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-lg">
                <h3 className="text-sm uppercase tracking-widest font-bold text-slate-300 mb-2">Recommended Next Step</h3>
                <p className="text-lg font-medium text-white">{result.recommendedAction}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-slate-100">
                <button
                  onClick={() => navigate('/healthcare')}
                  className="flex-1 inline-flex justify-center items-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 px-6 text-base font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] hover:shadow-primary-500/50"
                >
                  Find Healthcare Nearby <ChevronRight className="ml-2 w-5 h-5" />
                </button>
                <button
                  onClick={startNew}
                  className="flex-1 inline-flex justify-center items-center rounded-2xl border border-slate-200 bg-white py-4 px-6 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:scale-[1.02]"
                >
                  Start New Analysis
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col glass-card rounded-3xl shadow-2xl shadow-slate-200/50 h-[700px] max-h-[80vh] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-slide-up`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md mr-2 mb-1 flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-3xl px-5 py-4 shadow-sm text-sm font-medium leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-br-sm'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow-inner ml-2 mb-1 flex-shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start items-end animate-slide-up">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md mr-2 mb-1 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-3xl rounded-bl-sm px-5 py-4 text-slate-500 flex items-center shadow-sm h-12 w-20">
                    <div className="flex space-x-1 w-full justify-center">
                      <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="text-center text-sm font-bold text-red-500 mt-4 p-3 bg-red-50 rounded-xl border border-red-100 mx-auto max-w-md">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
            
            <div className="p-4 md:p-6 bg-white/60 backdrop-blur-md border-t border-slate-100">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={loading || isListening}
                  className={`inline-flex items-center justify-center rounded-2xl w-14 h-14 font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
                    isListening ? 'bg-red-50 border-2 border-red-200 text-red-600 shadow-inner' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                  title="Voice Input"
                >
                  <Mic className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Describe your symptoms..."}
                    disabled={loading || isListening}
                    className="w-full h-14 rounded-2xl border border-slate-200 px-6 py-2 text-base font-medium shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 w-14 h-14 font-medium text-white shadow-lg shadow-primary-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 hover:shadow-primary-500/50 hover:scale-105"
                >
                  <Send className="h-6 w-6 ml-1" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SymptomChecker;
