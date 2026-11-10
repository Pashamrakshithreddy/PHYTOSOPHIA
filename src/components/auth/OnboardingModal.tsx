import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sprout, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (shouldAddPlant: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [gardenerType, setGardenerType] = useState('Intermediate');
  const [plantCount, setPlantCount] = useState('1–5');
  const [goals, setGoals] = useState<string[]>(['Plant Health', 'Disease Detection']);

  if (!isOpen) return null;

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleFinish = (shouldAddPlant: boolean) => {
    completeOnboarding(gardenerType, plantCount, goals);
    onComplete(shouldAddPlant);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden space-y-6">
        {/* Step Indicator Pills */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-lime-500' : s < step ? 'w-4 bg-emerald-700' : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-lime-500/30">
              <Sprout className="w-10 h-10 text-slate-900" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome to PhytoSophia 🌱
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              You are about to experience a stateful digital-twin plant care platform. Track real plant health, detect diseases, and watch your 3D digital companion grow!
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Gardener Type */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900">
                What type of gardener are you?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Help us tailor your PhytoAI care recommendations.</p>
            </div>

            <div className="space-y-2.5">
              {['Beginner', 'Intermediate', 'Expert'].map((option) => (
                <div
                  key={option}
                  onClick={() => setGardenerType(option)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    gardenerType === option
                      ? 'border-lime-500 bg-lime-50/60 shadow-md'
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">{option} Gardener</span>
                  {gardenerType === option && <CheckCircle2 className="w-5 h-5 text-lime-600" />}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Plant Count */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900">
                How many plants do you have?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">We will initialize your garden overview grid.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['0', '1–5', '6–20', '20+'].map((count) => (
                <div
                  key={count}
                  onClick={() => setPlantCount(count)}
                  className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                    plantCount === count
                      ? 'border-lime-500 bg-lime-50/60 shadow-md'
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-sm font-extrabold text-slate-800">{count} Plants</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 4: Goals */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900">
                What do you want to improve?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Select all that apply.</p>
            </div>

            <div className="space-y-2">
              {['Plant Health', 'Growth', 'Disease Detection', 'Watering', 'General Plant Care'].map((goal) => (
                <div
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    goals.includes(goal)
                      ? 'border-lime-500 bg-lime-50/60 shadow-sm'
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">{goal}</span>
                  {goals.includes(goal) && <CheckCircle2 className="w-4 h-4 text-lime-600" />}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 5: Add First Plant CTA */}
        {step === 5 && (
          <div className="text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-lime-100 text-lime-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Let's add your first plant 🌱
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Upload or capture your plant photo to execute ViT taxonomy identification and set up its 3D digital twin!
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleFinish(true)}
                className="w-full bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs py-3.5 rounded-2xl shadow-xl shadow-lime-500/25 transition-all"
              >
                ADD MY FIRST PLANT
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-3 rounded-2xl transition-all"
              >
                SKIP FOR NOW
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
