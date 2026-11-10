import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GardenProvider } from './context/GardenContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { AgriDashboardView } from './components/views/AgriDashboardView';
import { MyPlantsView } from './components/views/MyPlantsView';
import { PlantProfileView } from './components/views/PlantProfileView';
import { ScannerView } from './components/views/ScannerView';
import { RecoveryHubView } from './components/views/RecoveryHubView';
import { CalendarView } from './components/views/CalendarView';
import { EncyclopediaView } from './components/views/EncyclopediaView';
import { DrFloraChatView } from './components/views/DrFloraChatView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { TeamBoardView } from './components/views/TeamBoardView';
import { HomeSpatialHubView } from './components/views/HomeSpatialHubView';
import { AddPlantModal } from './components/modals/AddPlantModal';
import type { DigitalTwinPlant } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('plant-monstera-1');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalPrefill, setAddModalPrefill] = useState<{ roomZone?: string; sunlight?: any } | undefined>(undefined);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Protected Route Check
  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return <SignupPage onNavigate={(p) => setAuthPage(p as any)} />;
    }
    if (authPage === 'forgot-password') {
      return <ForgotPasswordPage onNavigate={(p) => setAuthPage(p as any)} />;
    }
    return <LoginPage onNavigate={(p) => setAuthPage(p as any)} />;
  }

  // Trigger Onboarding Modal if user hasn't completed onboarding
  const shouldShowOnboarding = user && !user.onboardingCompleted && !isOnboardingOpen;
  if (shouldShowOnboarding && !isOnboardingOpen) {
    setIsOnboardingOpen(true);
  }

  const handleSelectPlant = (plantId: string) => {
    setSelectedPlantId(plantId);
    setActiveTab('plant-detail');
  };

  const handleTabNavigate = (tab: string, extraData?: any) => {
    if (extraData?.plantId) {
      setSelectedPlantId(extraData.plantId);
    }
    setActiveTab(tab);
  };

  const handleOpenAddModal = (prefill?: { roomZone?: string; sunlight?: any }) => {
    setAddModalPrefill(prefill);
    setIsAddModalOpen(true);
  };

  const handlePlantAdded = (plant: DigitalTwinPlant) => {
    setSelectedPlantId(plant.id);
    setActiveTab('plant-detail');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F5] text-[#193C0D] font-sans antialiased selection:bg-[#729C65]/20 selection:text-[#193C0D]">
      {/* Header & Floating Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddPlantModal={() => handleOpenAddModal()}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <AgriDashboardView
            onNavigateTab={handleTabNavigate}
            onOpenAddModal={() => handleOpenAddModal()}
          />
        )}

        {activeTab === 'plants' && (
          <MyPlantsView
            onSelectPlant={handleSelectPlant}
            onOpenAddModal={() => handleOpenAddModal()}
          />
        )}

        {activeTab === 'plant-detail' && (
          <PlantProfileView
            plantId={selectedPlantId}
            onBack={() => setActiveTab('plants')}
            onNavigateTab={handleTabNavigate}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerView
            initialPlantId={selectedPlantId}
            onNavigateTab={handleTabNavigate}
          />
        )}

        {activeTab === 'recovery' && (
          <RecoveryHubView onNavigateTab={handleTabNavigate} />
        )}

        {activeTab === 'spatial-hub' && (
          <HomeSpatialHubView
            onNavigateTab={handleTabNavigate}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activeTab === 'calendar' && <CalendarView />}

        {activeTab === 'encyclopedia' && (
          <EncyclopediaView
            onImportSuccess={(newId) => {
              setSelectedPlantId(newId);
              setActiveTab('plants');
            }}
            onNavigateTab={handleTabNavigate}
          />
        )}

        {activeTab === 'doctor' && (
          <DrFloraChatView
            initialPlantId={selectedPlantId}
            onNavigateTab={handleTabNavigate}
          />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView />}

        {activeTab === 'team' && <TeamBoardView />}

        {activeTab === 'profile' && <ProfileView />}

        {activeTab === 'settings' && <SettingsView onLogout={logout} />}
      </main>

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalPrefill(undefined);
        }}
        onPlantAdded={handlePlantAdded}
        prefill={addModalPrefill}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(shouldAddPlant) => {
          setIsOnboardingOpen(false);
          if (shouldAddPlant) {
            handleOpenAddModal();
          }
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GardenProvider>
          <MainAppContent />
        </GardenProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
