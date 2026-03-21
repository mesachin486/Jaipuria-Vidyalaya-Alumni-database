import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut, User as UserIcon, Home } from 'lucide-react';

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { path: '/directory', label: 'Directory', icon: Home },
    { path: '/profile', label: 'My Profile', icon: UserIcon },
  ];

  return (
    <nav className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/directory" className="flex items-center group">
              <div className="w-10 h-10 bg-stone-900 flex items-center justify-center rounded-lg mr-3 group-hover:bg-stone-800 transition-colors">
                <span className="text-white font-serif font-bold text-xl">JV</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-stone-900 font-serif font-medium text-lg leading-tight">Jaipuria Vidyalaya</h1>
                <p className="text-stone-500 text-xs tracking-widest uppercase">Alumni Network</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 ${
                    location.pathname === item.path
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-3 pr-2 sm:pr-4 border-r border-stone-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-stone-900">{user.displayName}</p>
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full border border-stone-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                  <UserIcon className="w-5 h-5 text-stone-400" />
                </div>
              )}
            </div>
            
            <button
              onClick={handleSignOut}
              className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all flex"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
