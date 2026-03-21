import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User as UserIcon } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/directory', label: 'Directory', icon: Home },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="md:hidden bg-white border-t border-stone-200 px-6 py-3 flex justify-around items-center pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              isActive ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-stone-900/10' : ''}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="w-1 h-1 bg-stone-900 rounded-full mt-0.5" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
