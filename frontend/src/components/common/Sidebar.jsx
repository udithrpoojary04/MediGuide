import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Stethoscope, 
  Clock, 
  MapPin, 
  User, 
  LogOut 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Check Symptoms', icon: Stethoscope, path: '/symptom-checker' },
    { name: 'History', icon: Clock, path: '/history' },
    { name: 'Find Healthcare', icon: MapPin, path: '/healthcare' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="flex h-full w-64 flex-col glass border-r border-gray-100 shadow-xl z-40 relative">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-gray-100/50 bg-white/30 backdrop-blur-sm">
        <div className="p-2 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-lg shadow-primary-500/30">
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
        <span className="ml-3 text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">MediGuide AI</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-white text-primary-700 shadow-sm border border-primary-100 scale-[1.02]'
                    : 'text-slate-600 hover:bg-white/60 hover:text-primary-600 hover:scale-[1.02] hover:shadow-sm border border-transparent'
                }`
              }
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-gray-100/50 p-4 bg-white/20 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:shadow-sm hover:scale-[1.02]"
        >
          <LogOut className="mr-2 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
