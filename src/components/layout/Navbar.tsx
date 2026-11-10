import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  User,
  Settings,
  ChevronDown,
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
  MoreHorizontal,
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

  // Strict priority ordering as defined in Master Architectural Specification:
  // 1. Dashboard, 2. My Garden & Home Map (consolidated), 3. AI Scanner,
  // 4. Recovery Hub, 5. Care Calendar, 6. Encyclopedia, 7. Dr. Flora, 8. Research Team,
  // [+ New Plant] Global Action Button
  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plants', label: 'My Garden & Home Map', icon: Sprout },
    { id: 'scanner', label: 'AI Scanner', icon: Scan },
    { id: 'recovery', label: 'Recovery Hub', icon: Activity },
    { id: 'calendar', label: 'Care Calendar', icon: Calendar },
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
    { id: 'doctor', label: 'Dr. Flora', icon: Bot },
    { id: 'team', label: 'Research Team', icon: Users },
  ];

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4ECE2] transition-all shadow-[0_2px_12px_rgba(25,60,13,0.03)]">
        {/* Top Header Row: Logo, Primary CTA, User Profile, Mobile Hamburger */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo (min 44px touch target) */}
            <div
              onClick={() => handleTabSelect('dashboard')}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0 min-h-[44px] min-w-[44px] py-1"
              role="button"
              tabIndex={0}
              title="PhytoSophia Home"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#4E763B] flex items-center justify-center text-white shadow-[0_3px_12px_rgba(78,118,59,0.25)] group-hover:bg-[#3f602f] group-hover:-translate-y-0.5 transition-all">
                <Leaf className="w-5 h-5 text-white" />
              </div>

              <div>
                <span className="text-base sm:text-lg font-extrabold text-[#193C0D] tracking-tight block leading-tight">
                  PhytoSophia
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#4E763B] font-semibold uppercase tracking-wider block">
                  Digital Twin Platform
                </span>
              </div>
            </div>

            {/* Right Action Controls: [+ New Plant] CTA Button, User Avatar, Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Global [+ New Plant] Action Button with min 44px tap target */}
              <button
                onClick={onOpenAddPlantModal}
                className="luxury-btn-primary min-h-[44px] min-w-[44px] text-xs px-3.5 sm:px-4 py-2.5 gap-1.5 shrink-0 flex items-center justify-center"
                title="Register a new botanical digital twin"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="font-semibold whitespace-nowrap hidden xs:inline sm:inline">+ New Plant</span>
                <span className="font-semibold whitespace-nowrap xs:hidden sm:hidden">Plant</span>
              </button>

              {/* User Profile Menu with min 44px tap target */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 p-1 rounded-full border border-[#E4ECE2] hover:border-[#6D835C] transition-all bg-white shadow-xs hover:-translate-y-0.5"
                  title="Account Settings"
                  aria-label="Account Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F4F7F2] text-[#4E763B] text-xs font-bold flex items-center justify-center border border-[#E4ECE2]">
                    PK
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#637462] mr-1 hidden sm:block" />
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
                        className="w-full px-3 py-2.5 min-h-[44px] text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-[#4E763B]" />
                        <span>Profile & Garden XP</span>
                      </button>

                      <button
                        onClick={() => {
                          handleTabSelect('plants');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2.5 min-h-[44px] text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                      >
                        <Sprout className="w-4 h-4 text-[#4E763B]" />
                        <span>My Garden & Home Map</span>
                      </button>

                      <button
                        onClick={() => {
                          handleTabSelect('team');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2.5 min-h-[44px] text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-[#4E763B]" />
                        <span>Research Authors</span>
                      </button>

                      <button
                        onClick={() => {
                          handleTabSelect('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2.5 min-h-[44px] text-left text-xs text-[#637462] hover:text-[#193C0D] hover:bg-[#F7F9F5] rounded-xl font-medium flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-[#637462]" />
                        <span>Platform Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full px-3 py-2.5 min-h-[44px] text-left text-xs text-[#D32F2F] hover:bg-[#FFEBEE] rounded-xl font-medium flex items-center gap-2 border-t border-[#E4ECE2] mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Button with min 44px tap target */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-[#637462] hover:text-[#193C0D] rounded-xl hover:bg-[#F4F7F2] transition-all"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Priority Navigation Ribbon: Shown on Tablet & Desktop (Hidden on Mobile to save space) */}
        <nav className="hidden md:block border-t border-[#E4ECE2] bg-[#FFFFFF] overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-1.5 min-w-max">
              {navLinks.map((item) => {
                const isActive =
                  activeTab === item.id || (item.id === 'plants' && activeTab === 'spatial-hub');
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

        {/* Mobile Slide-Out Drawer (When Hamburger is Clicked) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4ECE2] bg-white px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-3 pb-2 border-b border-[#E4ECE2]">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider">
                Platform Navigation
              </span>
              <span className="text-[10px] font-semibold text-[#4E763B] bg-[#F4F7F2] px-2 py-0.5 rounded-full border border-[#6D835C]/30">
                8 Modules
              </span>
            </div>

            <div className="space-y-1 pt-1">
              {navLinks.map((item) => {
                const isActive =
                  activeTab === item.id || (item.id === 'plants' && activeTab === 'spatial-hub');
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      isActive
                        ? 'bg-[#4E763B] text-white font-bold shadow-xs'
                        : 'text-[#637462] hover:text-[#193C0D] hover:bg-[#F4F7F2]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#4E763B]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Sitter & Settings Links in Mobile Drawer */}
            <div className="pt-2 border-t border-[#E4ECE2] space-y-1">
              <button
                onClick={() => {
                  handleTabSelect('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-[#637462] hover:bg-[#F4F7F2] rounded-xl"
              >
                <User className="w-4 h-4 text-[#4E763B]" />
                <span>My Profile & Garden Stats</span>
              </button>

              <button
                onClick={() => {
                  handleTabSelect('settings');
                  setMobileMenuOpen(false);
                }}
                className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-[#637462] hover:bg-[#F4F7F2] rounded-xl"
              >
                <Settings className="w-4 h-4 text-[#637462]" />
                <span>System Settings</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===================================================================== */}
      {/* FIXED MOBILE BOTTOM NAVIGATION BAR (md:hidden) */}
      {/* Provides native touch-friendly bottom navigation with 44px+ tap targets */}
      {/* ===================================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E4ECE2] shadow-[0_-4px_20px_rgba(25,60,13,0.08)] px-2 py-1.5 safe-area-pb"
      >
        <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
          {/* 1. Dashboard */}
          <button
            onClick={() => handleTabSelect('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'text-[#4E763B]' : 'text-[#637462]'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>

          {/* 2. My Garden & Home Map */}
          <button
            onClick={() => handleTabSelect('plants')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 rounded-xl transition-all ${
              activeTab === 'plants' || activeTab === 'spatial-hub' ? 'text-[#4E763B]' : 'text-[#637462]'
            }`}
            title="My Garden & Home Map"
          >
            <Sprout className={`w-5 h-5 ${activeTab === 'plants' || activeTab === 'spatial-hub' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold mt-0.5">Garden</span>
          </button>

          {/* 3. AI Scanner (Elevated Floating Center Pill) */}
          <button
            onClick={() => handleTabSelect('scanner')}
            className="flex flex-col items-center justify-center -translate-y-2.5 group"
            title="Launch AI Scanner"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(78,118,59,0.35)] transition-all ${
              activeTab === 'scanner'
                ? 'bg-[#193C0D] text-white ring-3 ring-[#729C65]'
                : 'bg-[#4E763B] text-white group-hover:bg-[#3f602f]'
            }`}>
              <Scan className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold text-[#193C0D] mt-0.5">Scan</span>
          </button>

          {/* 4. Recovery Hub */}
          <button
            onClick={() => handleTabSelect('recovery')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 rounded-xl transition-all ${
              activeTab === 'recovery' ? 'text-[#4E763B]' : 'text-[#637462]'
            }`}
            title="Recovery Hub"
          >
            <Activity className={`w-5 h-5 ${activeTab === 'recovery' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold mt-0.5">Recovery</span>
          </button>

          {/* 5. More Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 rounded-xl transition-all ${
              mobileMenuOpen ? 'text-[#4E763B]' : 'text-[#637462]'
            }`}
            title="More Options"
          >
            <MoreHorizontal className={`w-5 h-5 ${mobileMenuOpen ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
