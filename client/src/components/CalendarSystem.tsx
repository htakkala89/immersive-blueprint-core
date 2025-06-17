import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sun, Cloud, CloudRain, Snowflake, Thermometer } from 'lucide-react';

export interface GameDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weekOfMonth: number;
}

interface CalendarSystemProps {
  currentDate: GameDate;
  onDateChange: (date: GameDate) => void;
  isVisible?: boolean;
  realTimeProgression?: boolean;
  timeMultiplier?: number; // How fast game time passes vs real time
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const SEASON_COLORS = {
  spring: 'from-green-200 via-emerald-100 to-lime-200',
  summer: 'from-yellow-200 via-orange-100 to-amber-200',
  autumn: 'from-orange-200 via-red-100 to-yellow-200',
  winter: 'from-blue-200 via-slate-100 to-cyan-200'
};

const SEASONAL_WEATHER_PROBABILITY = {
  spring: { clear: 0.4, cloudy: 0.3, rain: 0.25, snow: 0.05 },
  summer: { clear: 0.6, cloudy: 0.25, rain: 0.15, snow: 0 },
  autumn: { clear: 0.35, cloudy: 0.35, rain: 0.25, snow: 0.05 },
  winter: { clear: 0.25, cloudy: 0.3, rain: 0.15, snow: 0.3 }
};

export const CalendarSystem: React.FC<CalendarSystemProps> = ({
  currentDate,
  onDateChange,
  isVisible = false,
  realTimeProgression = true,
  timeMultiplier = 1440 // 1 real day = 1 game day by default
}) => {
  const [displayDate, setDisplayDate] = useState(currentDate);
  const [temperature, setTemperature] = useState(20);

  // Calculate season based on month
  const getSeason = (month: number): 'spring' | 'summer' | 'autumn' | 'winter' => {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  // Calculate day of week (simple algorithm)
  const getDayOfWeek = (year: number, month: number, day: number): number => {
    const date = new Date(year, month - 1, day);
    return date.getDay();
  };

  // Calculate week of month
  const getWeekOfMonth = (day: number): number => {
    return Math.ceil(day / 7);
  };

  // Advance to next day
  const advanceDay = () => {
    const daysInMonth = new Date(displayDate.year, displayDate.month, 0).getDate();
    let newDay = displayDate.day + 1;
    let newMonth = displayDate.month;
    let newYear = displayDate.year;

    if (newDay > daysInMonth) {
      newDay = 1;
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }

    const newDate: GameDate = {
      year: newYear,
      month: newMonth,
      day: newDay,
      dayOfWeek: getDayOfWeek(newYear, newMonth, newDay),
      season: getSeason(newMonth),
      weekOfMonth: getWeekOfMonth(newDay)
    };

    setDisplayDate(newDate);
    onDateChange(newDate);

    // Update seasonal temperature
    updateSeasonalTemperature(newDate.season, newMonth);
  };

  // Update temperature based on season and month
  const updateSeasonalTemperature = (season: string, month: number) => {
    const baseTemps = {
      spring: 15 + (month - 3) * 5, // 15-25°C
      summer: 25 + (month - 6) * 3, // 25-31°C
      autumn: 20 - (month - 9) * 5, // 20-5°C
      winter: 5 - (month === 12 ? 0 : month) * 2 // 5 to -7°C
    };
    
    const baseTemp = baseTemps[season as keyof typeof baseTemps] || 20;
    const variation = Math.random() * 6 - 3; // ±3°C variation
    setTemperature(Math.round(baseTemp + variation));
  };

  // Real-time progression
  useEffect(() => {
    if (!realTimeProgression) return;

    // Calculate milliseconds per game day based on multiplier
    const msPerGameDay = (24 * 60 * 60 * 1000) / timeMultiplier;
    
    const interval = setInterval(() => {
      advanceDay();
    }, msPerGameDay);

    return () => clearInterval(interval);
  }, [realTimeProgression, timeMultiplier, displayDate]);

  // Initialize temperature on mount
  useEffect(() => {
    updateSeasonalTemperature(displayDate.season, displayDate.month);
  }, []);

  const getWeatherIcon = (season: string) => {
    const icons = {
      spring: <CloudRain className="w-4 h-4 text-blue-500" />,
      summer: <Sun className="w-4 h-4 text-yellow-500" />,
      autumn: <Cloud className="w-4 h-4 text-gray-500" />,
      winter: <Snowflake className="w-4 h-4 text-blue-300" />
    };
    return icons[season as keyof typeof icons];
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Game Calendar</h3>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Thermometer className="w-4 h-4" />
            <span>{temperature}°C</span>
          </div>
        </div>

        {/* Current Date Display */}
        <div className={`bg-gradient-to-r ${SEASON_COLORS[displayDate.season]} rounded-lg p-3 mb-3`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {MONTHS[displayDate.month - 1]} {displayDate.day}
            </div>
            <div className="text-lg text-gray-700">
              {displayDate.year}
            </div>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <span className="text-sm text-gray-600">
                {DAYS_OF_WEEK[displayDate.dayOfWeek]}
              </span>
              {getWeatherIcon(displayDate.season)}
            </div>
          </div>
        </div>

        {/* Season Information */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
            <div className="font-medium text-gray-700 dark:text-gray-300">Season</div>
            <div className="capitalize text-gray-900 dark:text-white">
              {displayDate.season}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
            <div className="font-medium text-gray-700 dark:text-gray-300">Week</div>
            <div className="text-gray-900 dark:text-white">
              Week {displayDate.weekOfMonth}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex justify-between">
          <button
            onClick={advanceDay}
            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
          >
            Advance Day
          </button>
          <div className="text-xs text-gray-500 dark:text-gray-400 self-center">
            {realTimeProgression ? 'Auto' : 'Manual'}
          </div>
        </div>

        {/* Special Events Indicator */}
        {(displayDate.day === 1 || displayDate.dayOfWeek === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded text-xs"
          >
            <div className="text-yellow-800 dark:text-yellow-200 font-medium">
              {displayDate.day === 1 ? '🗓️ New Month!' : '🌅 Sunday - Rest Day'}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CalendarSystem;