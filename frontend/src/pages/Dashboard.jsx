import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import { Stethoscope, Clock, MapPin, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { name: 'Recent Symptom Checks', stat: '0', icon: Clock, color: 'from-blue-400 to-blue-600' },
    { name: 'Saved Reports', stat: '0', icon: Stethoscope, color: 'from-emerald-400 to-emerald-600' },
    { name: 'Nearby Facilities Found', stat: '0', icon: MapPin, color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 mt-4 animate-slide-up">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-lg text-slate-500 font-medium">
            Welcome back, <span className="text-primary-600 font-bold">{user?.name}</span>. Here's your health overview.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white/50 backdrop-blur-md border border-white px-4 py-2 rounded-2xl shadow-sm text-sm font-semibold text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mr-2" />
          Data secured & private
        </div>
      </div>

      <div className="mt-8">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((item, index) => (
            <div
              key={item.name}
              className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/50 group animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <dt>
                <div className={`absolute rounded-2xl bg-gradient-to-br ${item.color} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-7 w-7 text-white" aria-hidden="true" />
                </div>
                <p className="ml-20 truncate text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-20 flex items-baseline pb-2 mt-2">
                <p className="text-4xl font-black text-slate-800">{item.stat}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/40 overflow-hidden animate-slide-up animate-delay-200">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">Quick Actions</h3>
              <Activity className="w-6 h-6 text-primary-500" />
            </div>
            <div className="mt-8 flex flex-col gap-4">
              <Link
                to="/symptom-checker"
                className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-primary-500/50 hover:scale-[1.02]"
              >
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-xl mr-4">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg">Start Symptom Check</span>
                </div>
                <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/healthcare"
                className="group flex items-center justify-between rounded-2xl bg-white px-6 py-4 text-slate-700 shadow-md border border-slate-100 transition-all hover:shadow-lg hover:border-slate-200 hover:scale-[1.02]"
              >
                <div className="flex items-center">
                  <div className="bg-slate-50 p-2 rounded-xl mr-4 text-primary-500">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg">Find Healthcare Nearby</span>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/40 overflow-hidden animate-slide-up animate-delay-300">
          <div className="p-8">
            <h3 className="text-xl font-black text-slate-800">Recent Activity</h3>
            <div className="mt-8 flex flex-col items-center justify-center h-48 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500 text-center px-4">
                You haven't completed any symptom checks recently.<br/>
                <Link to="/symptom-checker" className="text-primary-600 hover:text-primary-700 font-bold mt-1 inline-block">Start your first check</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
