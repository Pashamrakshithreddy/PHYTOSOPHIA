import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { roomDb, type CareTaskEntity } from '../../services/roomDatabase';
import { getMicroclimateTelemetry } from '../../services/weatherService';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CloudRain,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 21)); // October 2026
  const [selectedDay, setSelectedDay] = useState<number>(21);
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('all');
  const [weatherAdjustNotification, setWeatherAdjustNotification] = useState<string | null>(null);

  const plants = roomDb.plantDao.getAll();
  const [careTasks, setCareTasks] = useState<CareTaskEntity[]>(() => roomDb.careTaskDao.getAll());
  const weather = getMicroclimateTelemetry('balcony');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCompleteTask = (taskId: string) => {
    const updated = roomDb.careTaskDao.completeTask(taskId);
    if (updated) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
      setCareTasks([...roomDb.careTaskDao.getAll()]);
    }
  };

  // Weather-based Dynamic Postponement
  const handleApplyWeatherAdjustment = () => {
    const outdoorPlants = plants.filter((p) => p.location === 'Outdoor');
    let totalPostponed = 0;
    outdoorPlants.forEach((p) => {
      totalPostponed += roomDb.careTaskDao.postponeForWeather(p.id, 1, 'Rain precipitation anticipated');
    });
    setCareTasks([...roomDb.careTaskDao.getAll()]);
    setWeatherAdjustNotification(
      `Dynamic Weather Adjustment Applied: Postponed ${totalPostponed} outdoor watering tasks by 24h to avoid root hypoxia.`
    );
    setTimeout(() => setWeatherAdjustNotification(null), 5000);
  };

  const filteredTasks = careTasks.filter((t) => {
    if (selectedPlantFilter !== 'all' && t.plantId !== selectedPlantFilter) return false;
    return true;
  });

  const formattedSelectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedDayTasks = filteredTasks.filter((t) => t.dueDate === formattedSelectedDate);

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'Watering':
        return { bg: 'bg-sky-500', text: 'text-sky-800', lightBg: 'bg-sky-50', border: 'border-sky-200' };
      case 'Fertilization':
        return { bg: 'bg-emerald-600', text: 'text-emerald-800', lightBg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'Health Scan':
        return { bg: 'bg-indigo-600', text: 'text-indigo-800', lightBg: 'bg-indigo-50', border: 'border-indigo-200' };
      case 'Pruning':
        return { bg: 'bg-amber-600', text: 'text-amber-800', lightBg: 'bg-amber-50', border: 'border-amber-200' };
      default:
        return { bg: 'bg-slate-600', text: 'text-slate-800', lightBg: 'bg-slate-50', border: 'border-slate-200' };
    }
  };

  return (
    <div className="space-y-10 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card rounded-3xl p-8 sm:p-10 border border-slate-200/70 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Care Matrix & Dynamic Weather Synchronization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plant Care Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
            Schedule and track watering, pathology scans, and fertilizations with automatic weather-based watering postponement.
          </p>
        </div>

        {/* Plant Filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Filter Plant:</span>
          <select
            value={selectedPlantFilter}
            onChange={(e) => setSelectedPlantFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Digital Twins</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Weather-Based Watering Adjustment Alert Banner */}
      {weather.rainProbabilityPercent >= 50 && (
        <div className="p-6 rounded-3xl bg-sky-50/60 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                  Precipitation Watcher
                </span>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {weather.rainProbabilityPercent}% Rain Predicted
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Precipitation expected in {weather.locationName}. Avoid waterlogging outdoor specimens by postponing manual irrigation by 24h.
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyWeatherAdjustment}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0 self-start sm:self-center"
          >
            Auto-Postpone Outdoor Watering (+24h)
          </button>
        </div>
      )}

      {weatherAdjustNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold px-4 py-3 rounded-2xl animate-in fade-in">
          {weatherAdjustNotification}
        </div>
      )}

      {/* Main Grid: Calendar on Left, Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Monthly Grid (8 Cols) */}
        <div className="lg:col-span-8 luxury-card rounded-3xl p-6 sm:p-8 border border-slate-200/70 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{monthNames[month]} {year}</span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                {careTasks.filter((t) => !t.isCompleted).length} Tasks Due
              </span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium pb-2 text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Watering</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Fertilization</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Pathology Scan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Pruning</span>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/50" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = filteredTasks.filter((t) => t.dueDate === dateStr);
              const isSelected = selectedDay === dayNum;
              const isToday = dayNum === 21;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-20 sm:h-24 p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                      : isToday
                      ? 'border-emerald-300 bg-white hover:border-emerald-400'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Indicators */}
                  <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((task) => {
                      const color = getTaskColor(task.taskType);
                      return (
                        <div
                          key={task.id}
                          className={`w-full text-[9px] font-semibold px-1.5 py-0.5 rounded truncate ${
                            task.isCompleted ? 'line-through opacity-50 bg-slate-100 text-slate-500' : `${color.bg} text-white`
                          }`}
                        >
                          {task.taskType}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-medium">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda (4 Cols) */}
        <div className="lg:col-span-4 luxury-card rounded-3xl p-6 sm:p-8 border border-slate-200/70 bg-white space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Care Agenda</span>
              <h3 className="text-base font-bold text-slate-900">
                {monthNames[month]} {selectedDay}, {year}
              </h3>
            </div>

            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              {selectedDayTasks.length} Scheduled
            </span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                No care tasks due on this date.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayTasks.map((task) => {
                const color = getTaskColor(task.taskType);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border ${color.border} ${color.lightBg} transition-all space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-bold ${color.text}`}>
                        {task.taskType}
                      </span>

                      {task.weatherPostponed && (
                        <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Weather Postponed
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {task.plantName}
                      </h4>
                      <p className="text-[11px] text-slate-500 italic">
                        {task.plantSpecies}
                      </p>
                    </div>

                    {task.weatherPostponeReason && (
                      <p className="text-[10px] text-sky-800 bg-sky-100/50 p-2 rounded-xl font-medium">
                        {task.weatherPostponeReason}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-emerald-800">
                        +{task.xpReward} XP
                      </span>

                      {task.isCompleted ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Done
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
