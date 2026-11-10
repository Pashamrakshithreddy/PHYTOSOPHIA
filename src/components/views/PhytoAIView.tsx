import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import { queryPhytoAI } from '../../services/aiEngine';
import { Bot, Send, Sparkles, User } from 'lucide-react';

interface PhytoAIViewProps {
  initialPlantId?: string;
}

export const PhytoAIView: React.FC<PhytoAIViewProps> = ({ initialPlantId }) => {
  const { plants } = useGarden();

  const [selectedPlantId, setSelectedPlantId] = useState<string>(initialPlantId || plants[0]?.id || '');
  const selectedPlant = plants.find((p) => p.id === selectedPlantId);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am 🌿 **PhytoAI**, your intelligent botanical assistant.\n\nI have synced with your digital garden telemetry. Ask me anything about watering schedules, leaf discoloration, fungal pathology, or fertilization formulas!`,
      timestamp: 'Just now',
    },
  ]);

  const presetChips = [
    'My leaves are turning yellow.',
    'How often should I water this plant?',
    'What fertilizer formula should I apply?',
    'Explain how fair leaderboard ranking works.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    const responseText = await queryPhytoAI(query, selectedPlant, plants);

    const aiMsg = { sender: 'ai' as const, text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in max-w-4xl mx-auto">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase mb-1">
            <Bot className="w-5 h-5 text-teal-400" />
            RAG Botanical Knowledge & Context Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            🌿 PhytoAI Assistant
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold">Active Twin Context:</span>
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-bold rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPlant && (
        <div className="glass-card p-3 rounded-2xl flex items-center justify-between text-xs border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <img src={selectedPlant.imageUrl} alt={selectedPlant.name} className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-white">{selectedPlant.name}</span>
              <span className="text-slate-400 text-[11px] block">{selectedPlant.species}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div>Health: <strong className="text-emerald-400">{selectedPlant.healthScore}%</strong></div>
            <div>Stage: <strong className="text-teal-300">{selectedPlant.growthStage}</strong></div>
            <div>Location: <strong className="text-amber-300">{selectedPlant.location}</strong></div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {presetChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="bg-slate-900/80 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            {chip}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-3xl border border-emerald-500/20 flex flex-col h-[500px]">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none font-sans whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-slate-900/90 p-3 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
                <span>PhytoAI is retrieving botanical knowledge...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 rounded-b-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask PhytoAI about ${selectedPlant?.name || 'plant care'}...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white p-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
