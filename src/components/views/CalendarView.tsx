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
        return { bg: 'bg-[#4E763B]', text: 'text-[#193C0D]', lightBg: 'bg-[#F4F7F2]', border: 'border-[#6D835C]/30' };
      case 'Fertilization':
        return { bg: 'bg-[#729C65]', text: 'text-[#193C0D]', lightBg: 'bg-[#F4F7F2]', border: 'border-[#729C65]/40' };
      case 'Health Scan':
        return { bg: 'bg-[#6D835C]', text: 'text-[#193C0D]', lightBg: 'bg-[#F4F7F2]', border: 'border-[#6D835C]/40' };
      case 'Pruning':
        return { bg: 'bg-[#637462]', text: 'text-[#193C0D]', lightBg: 'bg-[#F4F7F2]', border: 'border-[#637462]/30' };
      default:
        return { bg: 'bg-[#4E763B]', text: 'text-[#193C0D]', lightBg: 'bg-[#F4F7F2]', border: 'border-[#E4ECE2]' };
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4E763B]">
              Care Matrix & Dynamic Weather Synchronization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            Plant Care Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-xl">
            Schedule and track watering, pathology scans, and fertilizations with automatic weather-based watering postponement.
          </p>
        </div>

        {/* Plant Filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#637462]">Filter Plant:</span>
          <select
            value={selectedPlantFilter}
            onChange={(e) => setSelectedPlantFilter(e.target.value)}
            className="bg-[#F4F7F2] border border-[#E4ECE2] text-xs font-semibold text-[#193C0D] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4E763B]"
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
        <div className="luxury-card p-6 border-[#6D835C]/30 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#4E763B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#193C0D] uppercase tracking-wider">
                  Precipitation Watcher
                </span>
                <span className="bg-[#F4F7F2] text-[#4E763B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#6D835C]/30">
                  {weather.rainProbabilityPercent}% Rain Predicted
                </span>
              </div>
              <p className="text-xs text-[#637462] mt-1 max-w-2xl leading-relaxed">
                Precipitation expected in {weather.locationName}. Avoid waterlogging outdoor specimens by postponing manual irrigation by 24h.
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyWeatherAdjustment}
            className="luxury-btn-primary px-4 py-2.5 text-xs font-semibold shrink-0 self-start sm:self-center"
          >
            Auto-Postpone Outdoor Watering (+24h)
          </button>
        </div>
      )}

      {weatherAdjustNotification && (
        <div className="bg-[#F4F7F2] border border-[#6D835C]/30 text-[#193C0D] text-xs font-semibold px-4 py-3 rounded-2xl animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#729C65] shrink-0" />
          <span>{weatherAdjustNotification}</span>
        </div>
      )}

      {/* Main Grid: Calendar on Left, Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Monthly Grid (8 Cols) */}
        <div className="lg:col-span-8 luxury-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4ECE2]">
            <h2 className="text-lg font-bold text-[#193C0D] flex items-center gap-2">
              <span>{monthNames[month]} {year}</span>
              <span className="text-xs font-semibold text-[#4E763B] bg-[#F4F7F2] px-2.5 py-0.5 rounded-full border border-[#6D835C]/30">
                {careTasks.filter((t) => !t.isCompleted).length} Tasks Due
              </span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-[#E4ECE2] text-[#637462] hover:bg-[#F4F7F2] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-[#E4ECE2] text-[#637462] hover:bg-[#F4F7F2] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium pb-2 text-[#637462]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E763B]" />
              <span>Watering</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
              <span>Fertilization</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6D835C]" />
              <span>Pathology Scan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#637462]" />
              <span>Pruning</span>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-[#637462] uppercase tracking-wider">
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
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-[#F4F7F2]/50 border border-transparent" />
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
                      ? 'border-[#4E763B] bg-[#F4F7F2] ring-1 ring-[#4E763B]'
                      : isToday
                      ? 'border-[#6D835C] bg-white hover:border-[#4E763B]'
                      : 'border-[#E4ECE2] bg-white hover:bg-[#F4F7F2]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#4E763B] text-white'
                          : isSelected
                          ? 'bg-[#6D835C] text-white'
                          : 'text-[#193C0D]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-[#637462]">
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
                            task.isCompleted ? 'line-through opacity-50 bg-[#F4F7F2] text-[#637462]' : `${color.bg} text-white`
                          }`}
                        >
                          {task.taskType}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-[#637462] font-medium">
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
        <div className="lg:col-span-4 luxury-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE2]">
            <div>
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Care Agenda</span>
              <h3 className="text-base font-bold text-[#193C0D]">
                {monthNames[month]} {selectedDay}, {year}
              </h3>
            </div>

            <span className="text-xs font-semibold bg-[#F4F7F2] text-[#4E763B] px-3 py-1 rounded-xl border border-[#E4ECE2]">
              {selectedDayTasks.length} Scheduled
            </span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#729C65] mx-auto" />
              <p className="text-xs text-[#637462] font-medium">
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
                        <span className="bg-white text-[#4E763B] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#6D835C]/30">
                          Weather Postponed
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#193C0D]">
                        {task.plantName}
                      </h4>
                      <p className="text-[11px] text-[#637462] italic">
                        {task.plantSpecies}
                      </p>
                    </div>

                    {task.weatherPostponeReason && (
                      <p className="text-[10px] text-[#4E763B] bg-white/70 p-2 rounded-xl font-medium border border-[#E4ECE2]">
                        {task.weatherPostponeReason}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-[#4E763B]">
                        +{task.xpReward} XP
                      </span>

                      {task.isCompleted ? (
                        <span className="text-xs font-bold text-[#729C65] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Done
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="luxury-btn-primary px-3 py-1 text-xs font-semibold flex items-center gap-1"
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
