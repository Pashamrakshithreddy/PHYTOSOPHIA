import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoomDbInspectorModal } from '../modals/RoomDbInspectorModal';
import {
  Database,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddPlantModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddPlantModal,
}) => {
  const { logout } = useAuth();
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'plants', label: 'My Garden' },
    { id: 'scanner', label: 'AI Scanner' },
    { id: 'recovery', label: 'Recovery Hub' },
    { id: 'calendar', label: 'Care Calendar' },
    { id: 'encyclopedia', label: 'Encyclopedia' },
    { id: 'doctor', label: 'Dr. Flora' },
    { id: 'team', label: 'Research Team' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e8f0e9] transition-all shadow-[0_2px_12px_rgba(44,107,79,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Minimal Luxury Logo */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-[#2c6b4f] flex items-center justify-center text-white shadow-[0_3px_10px_rgba(44,107,79,0.25)] group-hover:bg-[#23553e] group-hover:-translate-y-0.5 transition-all">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z" opacity="0.2" />
                  <path d="M7 16c2.5 0 5-2 5-6 0-3 3-5 5-5-2.5 0-5 2-5 6 0 3-3 5-5 5z" fill="currentColor" />
                </svg>
              </div>

              <div>
                <span className="text-base font-bold text-[#172a21] tracking-tight block">
                  PhytoSophia
                </span>
                <span className="text-[10px] text-[#2c6b4f] font-semibold uppercase tracking-wider block -mt-1">
                  Digital Twin Platform
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'text-[#2c6b4f] bg-[#e8f0e9]/70 font-bold shadow-xs'
                        : 'text-[#4a5d52] hover:text-[#172a21] hover:bg-[#f2f7f3]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#2c6b4f] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Room DB Status Pill */}
              <button
                onClick={() => setIsDbInspectorOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f2f7f3] text-[#4a5d52] hover:text-[#2c6b4f] border border-[#e8f0e9] hover:border-[#2c6b4f]/40 rounded-full text-xs font-semibold transition-all shadow-xs hover:-translate-y-0.5"
                title="Inspect Room Database"
              >
                <Database className="w-3.5 h-3.5 text-[#2c6b4f]" />
                <span>Room DB</span>
              </button>

              {/* Add Plant CTA */}
              <button
                onClick={onOpenAddPlantModal}
                className="hidden sm:flex items-center gap-1.5 bg-[#34c759] hover:bg-[#2eb34f] text-white font-semibold text-xs px-4 py-2 rounded-full transition-all shadow-[0_4px_14px_rgba(52,199,89,0.28)] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(52,199,89,0.36)]"
              >
                <Plus className="w-4 h-4" />
                <span>New Plant</span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-[#e8f0e9] hover:border-[#2c6b4f]/40 transition-all bg-white shadow-xs hover:-translate-y-0.5"
                >
                  <div className="w-7 h-7 rounded-full bg-[#e8f0e9] text-[#2c6b4f] text-xs font-bold flex items-center justify-center">
                    PK
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#83978b] mr-1" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 block">
                        PhytoKeeper
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Stateful Twin Practitioner
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile & Garden XP
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('team');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        Research Team
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setIsDbInspectorOpen(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-2"
                      >
                        <Database className="w-4 h-4 text-emerald-600" />
                        Room DB Inspector
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={logout}
                        className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 px-6 py-2 rounded-full shadow-lg flex items-center gap-6 lg:hidden">
        {navLinks.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`text-xs font-semibold transition-all ${
              activeTab === item.id ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Room DB Modal */}
      <RoomDbInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
      />
    </>
  );
};
