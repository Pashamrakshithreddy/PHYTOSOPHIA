import React, { useState } from 'react';
import { roomDb } from '../../services/roomDatabase';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  X,
  FileCode,
} from 'lucide-react';

interface RoomDbInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDbModified?: () => void;
}

export const RoomDbInspectorModal: React.FC<RoomDbInspectorModalProps> = ({
  isOpen,
  onClose,
  onDbModified,
}) => {
  const [selectedTable, setSelectedTable] = useState<
    'plants' | 'careTasks' | 'growthHistory' | 'fertilizerSchedules' | 'scanLogs' | 'doctorChats'
  >('plants');
  const [copiedToast, setCopiedToast] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const plants = roomDb.plantDao.getAll();
  const careTasks = roomDb.careTaskDao.getAll();
  const growthHistory = roomDb.growthHistoryDao.getAll();
  const fertilizerSchedules = roomDb.fertilizerScheduleDao.getAll();
  const scanLogs = roomDb.scanLogDao.getAll();
  const doctorChats = roomDb.doctorChatDao.getAll();

  const getTableData = () => {
    switch (selectedTable) {
      case 'plants':
        return plants;
      case 'careTasks':
        return careTasks;
      case 'growthHistory':
        return growthHistory;
      case 'fertilizerSchedules':
        return fertilizerSchedules;
      case 'scanLogs':
        return scanLogs;
      case 'doctorChats':
        return doctorChats;
    }
  };

  const handleExportJson = () => {
    const dump = roomDb.exportDatabaseDump();
    const blob = new Blob([dump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phytosophia-room-db-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const dump = roomDb.exportDatabaseDump();
    navigator.clipboard.writeText(dump);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = roomDb.restoreFromDump(text);
      if (success) {
        setRestoreStatus('✓ Room Database restored successfully from JSON backup!');
        if (onDbModified) onDbModified();
      } else {
        setRestoreStatus('❌ Failed to parse Room DB backup file.');
      }
      setTimeout(() => setRestoreStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetSeeds = () => {
    if (confirm('Reset Room Database to factory botanical seed dataset?')) {
      roomDb.resetToFactorySeeds();
      if (onDbModified) onDbModified();
      setRestoreStatus('✓ Room Database reset to official factory seeds.');
      setTimeout(() => setRestoreStatus(null), 4000);
    }
  };

  const tables = [
    { id: 'plants', label: `Plants (${plants.length})` },
    { id: 'careTasks', label: `Care Tasks (${careTasks.length})` },
    { id: 'growthHistory', label: `Growth History (${growthHistory.length})` },
    { id: 'fertilizerSchedules', label: `Fertilizer (${fertilizerSchedules.length})` },
    { id: 'scanLogs', label: `Scan Logs (${scanLogs.length})` },
    { id: 'doctorChats', label: `Doctor Chats (${doctorChats.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Room Database Schema & Entity Inspector
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Local-First Persistence • DAO Queries • Schema Version 2.1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{copiedToast ? 'Copied' : 'Copy'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore</span>
              <input type="file" accept=".json" onChange={handleImportJsonFile} className="hidden" />
            </label>

            <button
              onClick={handleResetSeeds}
              className="p-2 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-slate-50 transition-all"
              title="Reset to Factory Seeds"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {restoreStatus && (
          <div className="bg-emerald-50 text-emerald-900 px-6 py-2.5 text-xs font-semibold border-b border-emerald-100">
            {restoreStatus}
          </div>
        )}

        {/* Table Selector Tabs */}
        <div className="flex items-center gap-2 p-4 bg-slate-50/70 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {tables.map((tbl) => (
            <button
              key={tbl.id}
              onClick={() => setSelectedTable(tbl.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTable === tbl.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {tbl.label}
            </button>
          ))}
        </div>

        {/* Crisp Code Viewport */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs bg-slate-50 text-slate-800 border-t border-b border-slate-100 select-all leading-relaxed">
          <pre>{JSON.stringify(getTableData(), null, 2)}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Active DAO Entity: {selectedTable}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
