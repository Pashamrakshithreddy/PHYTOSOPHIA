import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  User,
  Settings,
  ChevronDown,
  MapPin,
  Leaf,
  LogOut,
  Users,
  Menu,
  X,
  LayoutDashboard,
  Sprout,
  Scan,
  Activity,
  Calendar,
  BookOpen,
  Bot,
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strict priority ordering as specified in architecture requirements:
  // 1. Dashboard, 2. My Garden, 3. AI Scanner, 4. Recovery Hub, 5. Care Calendar,
  // 6. Encyclopedia, 7. Dr. Flora, 8. Research Team, 9. My Home Plants Map
  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plants', label: 'My Garden', icon: Sprout },
    { id: 'scanner', label: 'AI Scanner', icon: Scan },
    { id: 'recovery', label: 'Recovery Hub', icon: Activity },
    { id: 'calendar', label: 'Care Calendar', icon: Calendar },
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
    { id: 'doctor', label: 'Dr. Flora', icon: Bot },
    { id: 'team', label: 'Research Team', icon: Users },
    { id: 'spatial-hub', label: 'My Home Plants Map', icon: MapPin },
  ];

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4ECE2] transition-all shadow-[0_2px_12px_rgba(25,60,13,0.03)]">
      {/* Top Header Row: Logo, Primary CTA, User Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => handleTabSelect('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#4E763B] flex items-center justify-center text-white shadow-[0_3px_12px_rgba(78,118,59,0.25)] group-hover:bg-[#3f602f] group-hover:-translate-y-0.5 transition-all">
              <Leaf className="w-5 h-5 text-white" />
            </div>

            <div>
              <span className="text-lg font-extrabold text-[#193C0D] tracking-tight block leading-tight">
                PhytoSophia
              </span>
              <span className="text-[10px] text-[#4E763B] font-semibold uppercase tracking-wider block">
                Digital Twin Platform
              </span>
            </div>
          </div>

          {/* Right Action Controls: + New Plant Button, User Avatar, Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* 10. [+ New Plant] Action Button */}
            <button
              onClick={onOpenAddPlantModal}
              className="luxury-btn-primary text-xs px-4 py-2 gap-1.5 shrink-0"
              title="Register a new botanical digital twin"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold">+ New Plant</span>
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1.5 rounded-full border border-[#E4ECE2] hover:border-[#6D835C] transition-all bg-white shadow-xs hover:-translate-y-0.5"
                title="Account Settings"
              >
                <div className="w-7 h-7 rounded-full bg-[#F4F7F2] text-[#4E763B] text-xs font-bold flex items-center justify-center border border-[#E4ECE2]">
                  PK
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#637462] mr-0.5" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E4ECE2] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-[#E4ECE2]">
                    <span className="text-xs font-bold text-[#193C0D] block">
                      PhytoKeeper
                    </span>
                    <span className="text-[10px] text-[#637462] font-medium">
                      Botanical Digital Twin Master
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleTabSelect('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#4E763B]" />
                      <span>Profile & Garden XP</span>
                    </button>

                    <button
                      onClick={() => {
                        handleTabSelect('spatial-hub');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-[#4E763B]" />
                      <span>My Home Plants Map</span>
                    </button>

                    <button
                      onClick={() => {
                        handleTabSelect('team');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-[#4E763B]" />
                      <span>Research Authors</span>
                    </button>

                    <button
                      onClick={() => {
                        handleTabSelect('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-[#637462]" />
                      <span>Platform Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#D32F2F] hover:bg-[#FFEBEE] rounded-xl font-medium flex items-center gap-2 border-t border-[#E4ECE2] mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#637462] hover:text-[#193C0D] rounded-xl hover:bg-[#F4F7F2] transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Priority Navigation Ribbon (Desktop & Tablet): Never squeezes, clips, or overflows */}
      <nav className="border-t border-[#E4ECE2] bg-[#FFFFFF] overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-1.5 min-w-max">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#4E763B] text-white font-bold shadow-[0_2px_8px_rgba(78,118,59,0.25)] -translate-y-0.5'
                      : 'text-[#637462] hover:text-[#193C0D] hover:bg-[#F4F7F2]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#637462]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (When hamburger is opened) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4ECE2] bg-white px-4 py-4 space-y-1 shadow-lg animate-in fade-in">
          <div className="text-[10px] font-bold text-[#637462] uppercase tracking-wider px-3 pb-1">
            Navigation Menu
          </div>
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  isActive
                    ? 'bg-[#4E763B] text-white font-bold'
                    : 'text-[#637462] hover:text-[#193C0D] hover:bg-[#F4F7F2]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#4E763B]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
