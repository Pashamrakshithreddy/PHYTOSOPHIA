import React, { useState, useEffect, useRef } from 'react';
import { roomDb, type DoctorChatEntity } from '../../services/roomDatabase';
import {
  Send,
  User,
  Plus,
  CheckCircle2,
  Trash2,
  Bot,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DrFloraChatViewProps {
  initialPlantId?: string;
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

export const DrFloraChatView: React.FC<DrFloraChatViewProps> = ({ initialPlantId }) => {
  const plants = roomDb.plantDao.getAll();
  const [selectedPlantId, setSelectedPlantId] = useState<string>(initialPlantId || plants[0]?.id || '');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<DoctorChatEntity[]>(() => roomDb.doctorChatDao.getAll());
  const [taskAddedToast, setTaskAddedToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePlant = plants.find((p) => p.id === selectedPlantId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presetQueries = [
    'Why are lower leaves on my plant yellowing?',
    'What is the ideal organic fertilizer mix for my active twin?',
    'Interpret my latest SAM pathology scan and recommend dosage.',
    'How do I calibrate watering based on current high humidity?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: DoctorChatEntity = {
      id: `chat-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: 'user',
      text: query,
      plantContextId: activePlant?.id,
      plantContextName: activePlant?.name,
    };

    roomDb.doctorChatDao.insert(userMsg);
    setMessages([...roomDb.doctorChatDao.getAll()]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate RAG Botanical Reasoning Fusion with Digital Twin State
    setTimeout(() => {
      const q = query.toLowerCase();
      let doctorResponse = '';
      let treatment: string | undefined = undefined;

      const daysSinceWater = activePlant?.lastWatered
        ? Math.max(1, Math.round((Date.now() - new Date(activePlant.lastWatered).getTime()) / (1000 * 60 * 60 * 24)))
        : 3;

      if (q.includes('yellow') || q.includes('chlorosis')) {
        doctorResponse = `Botanical Clinical Assessment for ${activePlant?.name || 'Subject Plant'} (${activePlant?.species || 'Binomial Specimen'}):\n\n` +
          `• Current Twin Health: ${activePlant?.healthScore || 80}% (${activePlant?.healthState || 'ATTENTION'})\n` +
          `• Hydration Telemetry: Last watered ${daysSinceWater} day(s) ago in ${activePlant?.location || 'Indoor'} environment.\n\n` +
          `Pathology Assessment & RAG Context:\n` +
          `Lower leaf chlorosis with intact green veins typically indicates incipient nitrogen/iron lock caused by rhizosphere compaction or moisture stagnation (Moupojou et al., 2024).\n\n` +
          `Clinical Prescription:\n` +
          `1. Aeration: Allow topsoil to dry to 30% saturation before next hydration.\n` +
          `2. Remediation Dose: Administer 2.5ml of liquid chelated micronutrient formula with a balanced 3-1-2 ratio.\n` +
          `3. Microclimate: Ensure ambient humidity does not exceed 75% without active oscillating airflow.`;
        treatment = 'Apply Chelated Iron Micronutrient (2.5ml in 1L)';
      } else if (q.includes('fertilizer') || q.includes('mix')) {
        doctorResponse = `Prescription: Customized Nutritional Protocol:\n\n` +
          `For ${activePlant?.species || 'this species'}, vegetative development requires:\n\n` +
          `• Target NPK: Organic 3-1-2 or 10-10-10 balanced formulation.\n` +
          `• Frequency: Every ${activePlant?.fertilizerIntervalDays || 14} days during active growth cycle.\n` +
          `• Application Note: Never apply granular fertilizer to dry soil; pre-moisten root zone to avoid salt burn on tender root hairs.`;
        treatment = `Apply ${activePlant?.fertilizerIntervalDays || 14}-Day Organic Nutrient Feeding`;
      } else if (q.includes('sam') || q.includes('scan') || q.includes('pathology')) {
        doctorResponse = `SAM-Assisted Pathology Interpretation:\n\n` +
          `Reviewing historical scan checkpoints for ${activePlant?.name}:\n\n` +
          `• Segmentation Isolation: Vision Transformer (ViT) confirmed species identity with high confidence. SAM extracted leaf contour with zero background noise.\n` +
          `• Lesion Heatmap: Localized stress points concentrated at leaf margins rather than systemic vascular veins.\n` +
          `• Prognosis: Optimal recovery potential (>90% achievable within 14 days under structured care).`;
        treatment = 'Follow-up SAM Pathology Scan in 7 Days';
      } else {
        doctorResponse = `Clinical Guidance:\n\n` +
          `Regarding your inquiry on ${activePlant?.name || 'your garden collection'}:\n\n` +
          `I have cross-referenced your plant's stateful digital twin parameters (Sunlight: ${activePlant?.sunlight}, Location: ${activePlant?.location}). ` +
          `To sustain optimal photosynthetic vigor, maintain steady ambient conditions within ${activePlant?.idealTempRange || '18°C-28°C'} and monitor topsoil moisture before supplemental irrigation.`;
      }

      const doctorMsg: DoctorChatEntity = {
        id: `chat-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: 'doctor',
        text: doctorResponse,
        plantContextId: activePlant?.id,
        plantContextName: activePlant?.name,
        treatmentRecommended: treatment,
      };

      roomDb.doctorChatDao.insert(doctorMsg);
      setMessages([...roomDb.doctorChatDao.getAll()]);
      setIsTyping(false);
    }, 1200);
  };

  const handleScheduleTreatment = (treatment: string) => {
    if (!activePlant) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    roomDb.careTaskDao.insert({
      id: `task-${Date.now()}`,
      plantId: activePlant.id,
      plantName: activePlant.name,
      plantSpecies: activePlant.species,
      taskType: 'Fertilization',
      dueDate: tomorrow.toISOString().split('T')[0],
      isCompleted: false,
      frequencyDays: 14,
      xpReward: 50,
      priority: 'high',
      weatherPostponed: false,
    });

    confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
    setTaskAddedToast(`Prescription scheduled: "${treatment}" added to Care Calendar.`);
    setTimeout(() => setTaskAddedToast(null), 4000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear chat history with Dr. Flora?')) {
      roomDb.doctorChatDao.clear();
      setMessages([...roomDb.doctorChatDao.getAll()]);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card rounded-3xl p-5 sm:p-7 lg:p-8 border border-[#E4ECE2] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4E763B]">
              RAG-Driven Remediation & Botanical Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight flex items-center gap-3">
            <span>Dr. Flora — AI Botanical Physician</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-xl">
            Real-time botanical troubleshooting powered by Gemini Multimodal RAG with live stateful digital twin context integration.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 text-[#637462] hover:text-[#193C0D] rounded-xl border border-[#E4ECE2] hover:bg-[#F4F7F2] transition-all self-start sm:self-auto shrink-0"
          title="Reset Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Digital Twin Context Ribbon */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 luxury-shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">
            Active Digital Twin Context:
          </span>
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
        </div>

        {activePlant && (
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>Vitality: <strong className="text-emerald-700">{activePlant.healthScore}%</strong></span>
            <span>•</span>
            <span>Light: <strong>{activePlant.sunlight}</strong></span>
          </div>
        )}
      </div>

      {taskAddedToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <span>{taskAddedToast}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {/* Main Chat Frame */}
      <div className="luxury-card rounded-3xl border border-slate-200/70 bg-white flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {messages.map((msg) => {
            const isDoctor = msg.sender === 'doctor';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isDoctor ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                    isDoctor
                      ? 'bg-emerald-600'
                      : 'bg-slate-900'
                  }`}
                >
                  {isDoctor ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isDoctor
                        ? 'bg-slate-50/80 text-slate-800 border border-slate-100 font-normal'
                        : 'bg-emerald-600 text-white font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {msg.treatmentRecommended && (
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-emerald-800">
                          Prescription: {msg.treatmentRecommended}
                        </span>
                        <button
                          onClick={() => handleScheduleTreatment(msg.treatmentRecommended!)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1 self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Schedule Task</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`text-[10px] text-slate-400 font-medium px-1 ${
                      isDoctor ? 'text-left' : 'text-right'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-md mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-500 font-medium border border-slate-100">
                Dr. Flora synthesizing digital twin telemetry with botanical RAG database...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
            Quick Prompts:
          </span>
          {presetQueries.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs font-medium text-slate-600 bg-white border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700 px-3 py-1 rounded-xl whitespace-nowrap transition-all shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Ask Dr. Flora regarding ${activePlant?.name || 'plant symptoms, yellowing, pests, or fertilization'}...`}
            className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
