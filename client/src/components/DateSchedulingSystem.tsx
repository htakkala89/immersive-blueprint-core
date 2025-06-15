import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Heart, MapPin, Star } from 'lucide-react';

interface ScheduledDate {
  id: number;
  dateType: string;
  location: string;
  scheduledTime: string;
  status: string;
  playerPromised: boolean;
  chaExpectation?: string;
  affectionImpact: number;
}

interface DateSchedulingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: number;
  currentAffection: number;
  onDateScheduled: (affectionChange: number) => void;
}

export const DateSchedulingSystem = ({ 
  isOpen, 
  onClose, 
  profileId, 
  currentAffection,
  onDateScheduled 
}: DateSchedulingSystemProps) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'upcoming' | 'history'>('schedule');
  const [scheduledDates, setScheduledDates] = useState<ScheduledDate[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Schedule new date form state
  const [selectedDateType, setSelectedDateType] = useState<'casual' | 'romantic' | 'intimate' | 'special'>('casual');
  const [selectedLocation, setSelectedLocation] = useState('hongdae_cafe');
  const [selectedTime, setSelectedTime] = useState('');
  const [playerPromise, setPlayerPromise] = useState(false);
  const [chaExpectation, setChaExpectation] = useState('');

  // Load scheduled dates
  useEffect(() => {
    if (isOpen && profileId) {
      loadScheduledDates();
      checkOverdueDates();
    }
  }, [isOpen, profileId]);

  const loadScheduledDates = async () => {
    try {
      const response = await fetch(`/api/scheduled-dates/${profileId}`);
      const data = await response.json();
      setScheduledDates(data.dates || []);
    } catch (error) {
      console.error('Failed to load scheduled dates:', error);
    }
  };

  const checkOverdueDates = async () => {
    try {
      const response = await fetch('/api/check-overdue-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId })
      });
      const data = await response.json();
      if (data.totalPenalty < 0) {
        onDateScheduled(data.totalPenalty);
      }
    } catch (error) {
      console.error('Failed to check overdue dates:', error);
    }
  };

  const scheduleDate = async () => {
    if (!selectedTime) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/schedule-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          dateType: selectedDateType,
          location: selectedLocation,
          scheduledTime: selectedTime,
          playerPromise,
          chaExpectation: chaExpectation || null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadScheduledDates();
        setSelectedTime('');
        setChaExpectation('');
        setPlayerPromise(false);
        setActiveTab('upcoming');
      }
    } catch (error) {
      console.error('Failed to schedule date:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeDate = async (dateId: number) => {
    try {
      const response = await fetch('/api/complete-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateId, profileId })
      });
      
      const data = await response.json();
      if (data.success) {
        onDateScheduled(data.affectionBoost);
        await loadScheduledDates();
      }
    } catch (error) {
      console.error('Failed to complete date:', error);
    }
  };

  const dateTypeInfo = {
    casual: { 
      icon: '☕', 
      color: 'from-blue-500 to-blue-600',
      description: 'Casual coffee or light activity',
      affectionReq: 20
    },
    romantic: { 
      icon: '🌹', 
      color: 'from-pink-500 to-pink-600',
      description: 'Romantic dinner or intimate conversation',
      affectionReq: 50
    },
    intimate: { 
      icon: '💕', 
      color: 'from-red-500 to-red-600',
      description: 'Close personal time together',
      affectionReq: 70
    },
    special: { 
      icon: '✨', 
      color: 'from-purple-500 to-purple-600',
      description: 'Special occasion or milestone',
      affectionReq: 90
    }
  };

  const locationOptions = [
    { id: 'hongdae_cafe', name: 'Cozy Hongdae Cafe', type: 'casual' },
    { id: 'hangang_river', name: 'Hangang River Park', type: 'romantic' },
    { id: 'upscale_restaurant', name: 'Upscale Restaurant', type: 'romantic' },
    { id: 'cha_apartment', name: "Cha Hae-In's Apartment", type: 'intimate' },
    { id: 'player_apartment', name: 'Your Apartment', type: 'intimate' },
    { id: 'rooftop_view', name: 'City Rooftop', type: 'special' }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg rounded-2xl border border-purple-400/30 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-purple-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold text-white">Date Scheduling</h2>
              <div className="text-sm text-purple-300">Affection: {currentAffection}/100</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mt-4">
            {[
              { id: 'schedule', label: 'Schedule New', icon: Calendar },
              { id: 'upcoming', label: 'Upcoming', icon: Clock },
              { id: 'history', label: 'History', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                    : 'text-gray-400 hover:text-purple-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Date Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Date Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(dateTypeInfo).map(([type, info]) => (
                    <button
                      key={type}
                      onClick={() => setSelectedDateType(type as any)}
                      disabled={currentAffection < info.affectionReq}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedDateType === type
                          ? 'border-purple-400 bg-purple-500/20'
                          : currentAffection >= info.affectionReq
                          ? 'border-gray-600 hover:border-purple-400/50 hover:bg-purple-500/10'
                          : 'border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-2xl mb-2">{info.icon}</div>
                      <div className="text-sm font-medium text-white capitalize">{type}</div>
                      <div className="text-xs text-gray-400 mt-1">{info.description}</div>
                      <div className="text-xs text-purple-300 mt-1">Req: {info.affectionReq}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Location</h3>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-gray-600 rounded-lg text-white"
                >
                  {locationOptions.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Date & Time</h3>
                <input
                  type="datetime-local"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full p-3 bg-slate-800 border border-gray-600 rounded-lg text-white"
                />
              </div>

              {/* Promise Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="promise"
                  checked={playerPromise}
                  onChange={(e) => setPlayerPromise(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="promise" className="text-white">
                  Make a promise to Cha Hae-In (+3 affection if kept, -5 additional penalty if broken)
                </label>
              </div>

              {/* Schedule Button */}
              <button
                onClick={scheduleDate}
                disabled={!selectedTime || loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Date'}
              </button>
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Upcoming Dates</h3>
              {scheduledDates.filter(d => d.status === 'scheduled').map(date => (
                <div key={date.id} className="bg-slate-800/50 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <span>{dateTypeInfo[date.dateType as keyof typeof dateTypeInfo]?.icon}</span>
                        <span className="capitalize">{date.dateType} Date</span>
                        {date.playerPromised && <Heart className="text-red-400" size={16} />}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {locationOptions.find(l => l.id === date.location)?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(date.scheduledTime).toLocaleString()}
                        </span>
                      </div>
                      {date.chaExpectation && (
                        <div className="text-purple-300 text-sm mt-2 italic">
                          "{date.chaExpectation}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => completeDate(date.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
              {scheduledDates.filter(d => d.status === 'scheduled').length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No upcoming dates scheduled
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Date History</h3>
              {scheduledDates.filter(d => d.status !== 'scheduled').map(date => (
                <div key={date.id} className={`bg-slate-800/50 p-4 rounded-lg border ${
                  date.status === 'completed' ? 'border-green-600/30' : 'border-red-600/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <span>{dateTypeInfo[date.dateType as keyof typeof dateTypeInfo]?.icon}</span>
                        <span className="capitalize">{date.dateType} Date</span>
                        {date.playerPromised && <Heart className="text-red-400" size={16} />}
                        <span className={`text-xs px-2 py-1 rounded ${
                          date.status === 'completed' 
                            ? 'bg-green-600/20 text-green-300' 
                            : 'bg-red-600/20 text-red-300'
                        }`}>
                          {date.status}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(date.scheduledTime).toLocaleString()}
                      </div>
                    </div>
                    <div className={`text-right ${
                      date.affectionImpact > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {date.affectionImpact > 0 ? '+' : ''}{date.affectionImpact} affection
                    </div>
                  </div>
                </div>
              ))}
              {scheduledDates.filter(d => d.status !== 'scheduled').length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No date history yet
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};