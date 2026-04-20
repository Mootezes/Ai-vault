import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { registerPlugin } from '@capacitor/core';
import { 
  Shield, 
  LayoutDashboard, 
  Sparkles, 
  Archive, 
  Settings as SettingsIcon, 
  Search,
  Lock,
  Loader2,
  Trash2,
  Clock,
  Bell
} from 'lucide-react';

import VaultLogo from './components/VaultLogo';
import NotificationItem from './components/NotificationItem';
import AIInsight from './components/AIInsight';
import NotificationSimulator from './components/NotificationSimulator';

import { Notification, AISummary, Reminder } from './types';
import { classifyNotification, generateDailySummary } from './services/gemini';
import ReminderModal from './components/ReminderModal';
import Onboarding from './components/Onboarding';

const NotificationPermission = registerPlugin<any>('NotificationPermission');

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'ai' | 'vault' | 'settings' | 'reminders'>('home');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const [selectedNotifForReminder, setSelectedNotifForReminder] = useState<Notification | null>(null);

  const updateSummary = useCallback(async (data: Notification[]) => {
    if (data.length === 0) return;
    setIsSummarizing(true);
    const result = await generateDailySummary(data);
    setSummary(result);
    setIsSummarizing(false);
  }, []);

  // Handle new notification simulation
  const handleSimulate = useCallback(async (sender: string, content: string, app: string) => {
    setIsClassifying(true);
    const category = await classifyNotification(sender, content, app);
    
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      sender,
      content,
      timestamp: new Date().toISOString(),
      category,
      app,
      isEncrypted: true
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      updateSummary(updated);
      return updated;
    });
    setIsClassifying(false);
  }, [updateSummary]);

  // Load from local storage
  useEffect(() => {
    const savedData = localStorage.getItem('ai-vault-data');
    const savedReminders = localStorage.getItem('ai-vault-reminders');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setNotifications(parsed);
        if (parsed.length > 0) updateSummary(parsed);
      } catch (e) { console.error(e); }
    }

    if (savedReminders) {
      try { setReminders(JSON.parse(savedReminders)); }
      catch (e) { console.error(e); }
    }

    // Check for native notification permission on mobile
    const checkNativePermission = async () => {
      try {
        const { enabled } = await NotificationPermission.checkPermission();
        if (!enabled) {
          // You could show a custom UI here first, but for now we prompt directly
          if (window.confirm("التطبيق يحتاج لصلاحية الوصول للإشعارات ليعمل بشكل صحيح. هل تود الذهاب للإعدادات الآن؟")) {
            await NotificationPermission.requestPermission();
          }
        }
      } catch (e) {
        // Probably not on Android or plugin not loaded
      }
    };
    
    checkNativePermission();
  }, [updateSummary]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('ai-vault-data', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ai-vault-reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Handle native notification events (Capacitor Bridge)
  useEffect(() => {
    const handleNativeNotification = (event: any) => {
      try {
        const data = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail;
        if (data.app && data.sender && data.content) {
          handleSimulate(data.sender, data.content, data.app);
        }
      } catch (e) {
        console.error("Failed to process native notification", e);
      }
    };

    window.addEventListener('onNotificationCaptured', handleNativeNotification);
    return () => window.removeEventListener('onNotificationCaptured', handleNativeNotification);
  }, [handleSimulate]);

  const handleSetReminder = (notificationId: string, reminderTime: string) => {
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      notificationId,
      reminderTime,
      createdAt: new Date().toISOString(),
      isCompleted: false
    };
    setReminders(prev => [newReminder, ...prev]);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const clearVault = () => {
    if (confirm('Clear all stored intelligence data?')) {
      setNotifications([]);
      setReminders([]);
      setSummary(null);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => 
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notifications, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 pt-10 pb-6 flex items-center justify-between">
        <VaultLogo />
        
        <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-4 py-1.5 rounded-full text-[#10B981] text-[12px] font-medium transition-all hover:bg-[#10B981]/15">
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
          Clean Screen Active
        </div>
      </header>

      {/* Navigation Rail for Layout */}
      <div className="max-w-6xl mx-auto w-full px-6 flex justify-center md:justify-start">
        <nav className="flex items-center gap-1 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--surface-border)]">
          {[
            { id: 'home', label: '🏠 Home' },
            { id: 'reminders', label: '🔔 Reminders' },
            { id: 'ai', label: '🧠 AI Tab' },
            { id: 'vault', label: '📂 Vault' },
            { id: 'settings', label: '⚙️ Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[var(--accent)] text-white shadow-lg' 
                  : 'text-[#71717A] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1">
        <Onboarding 
          isVisible={showOnboarding} 
          onDismiss={() => setShowOnboarding(false)} 
        />
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bento-grid-container"
            >
              {/* AI Insight Card */}
              <div className="md:col-span-7 md:row-span-3 bento-card bg-gradient-to-br from-[#121214] to-[#1A1A1E]">
                <AIInsight summary={summary} isLoading={isSummarizing} />
              </div>

              {/* Recent Intercepts Card */}
              <div className="md:col-span-5 md:row-span-5 bento-card flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📩</span>
                  <span className="text-[12px] font-semibold uppercase tracking-widest text-[#71717A]">Recent Intercepts</span>
                  {isClassifying && <Loader2 className="w-3 h-3 animate-spin ml-auto text-[var(--accent)]" />}
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Archive className="w-8 h-8 mb-2" />
                      <p className="text-[10px] uppercase font-mono tracking-widest">Vault Empty</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(notif => (
                      <div key={notif.id} className="border-b border-[#262629] last:border-0">
                        <NotificationItem 
                          notification={notif} 
                          onReminderClick={setSelectedNotifForReminder}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Categories Grid Card */}
              <div className="md:col-span-7 md:row-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Personal', icon: '💬', count: summary?.breakdown.Personal || 0 },
                  { label: 'Work', icon: '💼', count: summary?.breakdown.Work || 0 },
                  { label: 'Urgent', icon: '⚠️', count: summary?.urgentCount || 0 },
                  { label: 'Social', icon: '📢', count: summary?.breakdown.Social || 0 }
                ].map(cat => (
                  <div key={cat.label} className="vault-card p-4 flex flex-col items-center justify-center gap-1 hover:bg-white/5 cursor-default group transition-colors">
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-[13px] font-medium">{cat.label}</span>
                    <span className="text-[11px] text-[#71717A]">{cat.count} intercepted</span>
                  </div>
                ))}
              </div>

              {/* Security Status Card */}
              <div className="md:col-span-4 md:row-span-3 bento-card items-center justify-center text-center">
                <div className="flex items-center gap-2 mb-6 self-start">
                  <span className="text-xl">🔐</span>
                  <span className="text-[12px] font-semibold uppercase tracking-widest text-[#71717A]">Vault Security</span>
                </div>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="60" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="64" cy="64" r="60" fill="transparent" stroke="var(--accent)" strokeWidth="6" strokeDasharray="377" strokeDashoffset="37" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">98%</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#71717A] mt-6 tracking-widest uppercase font-medium">AES-256 Encrypted</p>
              </div>

              {/* Settings / Layers Card */}
              <div className="md:col-span-4 md:row-span-3 bento-card">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">⚙️</span>
                  <span className="text-[12px] font-semibold uppercase tracking-widest text-[#71717A]">Smart Layers</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Clean Screen', active: true },
                    { label: 'Biometric Lock', active: true },
                    { label: 'AI Auto-Sort', active: false }
                  ].map(layer => (
                    <div key={layer.label} className="flex justify-between items-center">
                      <span className="text-[14px] text-white/90">{layer.label}</span>
                      <div className={`w-9 h-5 rounded-full p-1 transition-colors ${layer.active ? 'bg-[var(--accent)]' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${layer.active ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Card */}
              <div className="md:col-span-4 md:row-span-3 bento-card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🔍</span>
                  <span className="text-[12px] font-semibold uppercase tracking-widest text-[#71717A]">Deep Search</span>
                </div>
                <p className="text-[13px] text-[#71717A] mb-auto">Search across all encrypted data signals and intercepted payloads.</p>
                <div 
                  onClick={() => setActiveTab('vault')}
                  className="mt-6 flex justify-between items-center bg-white/5 border border-[var(--surface-border)] rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <span className="text-[13px] text-[#71717A]">Find a message...</span>
                  <span className="text-[10px] font-mono text-[#71717A] bg-black px-1.5 py-0.5 rounded border border-white/10">⌘K</span>
                </div>
              </div>

              {/* Upcoming Signals (Reminders) Card */}
              {reminders.length > 0 && (
                <div className="md:col-span-12 bento-card">
                   <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔔</span>
                        <span className="text-[12px] font-semibold uppercase tracking-widest text-[#71717A]">Upcoming Signals</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('reminders')}
                      className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
                    >
                      View All
                    </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {reminders.slice(0, 3).map(reminder => {
                         const notif = notifications.find(n => n.id === reminder.notificationId);
                         if (!notif) return null;
                         return (
                            <div key={reminder.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                               <div className="flex items-center gap-2 text-[var(--accent)] text-[10px] font-mono uppercase tracking-widest">
                                  <Clock className="w-3 h-3" />
                                  {new Date(reminder.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                               <p className="text-white text-sm font-medium truncate">{notif.app}: {notif.sender}</p>
                            </div>
                         );
                      })}
                   </div>
                </div>
              )}

            </motion.div>
          )}

          {activeTab === 'reminders' && (
            <motion.div
              key="reminders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-[#71717A]">Scheduled Intel</h3>
                <span className="bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  {reminders.length} Active
                </span>
              </div>

              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <div className="dashed-border rounded-2xl p-20 text-center flex flex-col items-center">
                    <Bell className="w-12 h-12 text-[#262629] mb-4" />
                    <p className="text-[#71717A] text-sm font-mono uppercase tracking-[0.3em]">No scheduled signals</p>
                  </div>
                ) : (
                  reminders.map(reminder => {
                    const notif = notifications.find(n => n.id === reminder.notificationId);
                    if (!notif) return null;
                    return (
                      <div key={reminder.id} className="vault-card p-6 flex flex-col md:flex-row md:items-center gap-6 group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            <span>Remind at: {new Date(reminder.reminderTime).toLocaleString()}</span>
                          </div>
                          <h4 className="text-white font-semibold truncate mb-1">{notif.app}: {notif.sender}</h4>
                          <p className="text-sm text-[#71717A] line-clamp-1 italic">"{notif.content}"</p>
                        </div>
                        <button 
                          onClick={() => deleteReminder(reminder.id)}
                          className="self-end md:self-center p-3 text-[#71717A] hover:text-[#E11D48] hover:bg-[#E11D48]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <AIInsight summary={summary} isLoading={isSummarizing} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="vault-card p-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Efficiency Trends</h4>
                  <div className="h-40 flex items-end gap-3 px-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div key={day+i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-cyan-500/20 rounded-t-lg transition-all border-t border-cyan-500/40" 
                          style={{ height: `${20 + Math.random() * 80}%` }} 
                        />
                        <span className="text-[10px] font-mono text-slate-600">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vault-card p-6 flex flex-col">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Security Integrity</h4>
                  <div className="flex-1 flex flex-col justify-center items-center gap-4">
                    <div className="relative">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                        <circle cx="48" cy="48" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="283" strokeDashoffset="28" className="text-cyan-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-xl text-white">96%</div>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center">Threat neutralization active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input 
                  type="text"
                  placeholder="Search encrypted vault payloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl py-6 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-sm"
                />
              </div>

              <div className="vault-card p-6">
                <div className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                      <Search className="w-12 h-12 mx-auto mb-4 text-[#71717A]" />
                      <p className="text-sm font-mono uppercase tracking-[0.3em] text-[#71717A]">No matching signals</p>
                    </div>
                  ) : (
                    filteredNotifications.map(notif => (
                      <div key={notif.id} className="border-b border-[#262629] last:border-0">
                        <NotificationItem 
                          notification={notif} 
                          onReminderClick={setSelectedNotifForReminder}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🛡️</span>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#71717A]">Security Protocols</p>
                </div>
                <div className="vault-card divide-y divide-[#262629]">
                  <div className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-[15px] font-semibold text-white">Clean Screen Mode</p>
                      <p className="text-[11px] text-[#71717A] mt-1">Hides previews on device lock screen</p>
                    </div>
                    <div className="w-9 h-5 bg-[var(--accent)] rounded-full flex items-center px-1">
                      <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                    </div>
                  </div>
                  <div className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-[15px] font-semibold text-white">AES-256 Encryption</p>
                      <p className="text-[11px] text-[#71717A] mt-1">End-to-end local storage cipher active</p>
                    </div>
                    <div className="w-9 h-5 bg-[var(--accent)] rounded-full flex items-center px-1">
                      <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">☢️</span>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E11D48]">Danger Zone</p>
                </div>
                <button 
                  onClick={clearVault}
                  className="w-full p-6 border border-[#E11D48]/20 bg-[#E11D48]/5 hover:bg-[#E11D48]/10 rounded-2xl flex items-center justify-center gap-3 text-[#E11D48] transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-widest">Nuke All Intelligence Data</span>
                </button>
              </div>

              <div className="p-8 text-center">
                <p className="text-[11px] font-mono text-[#71717A] uppercase tracking-widest">AI Vault Intelligence Layer v1.0.4</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Simulator FAB */}
      <NotificationSimulator onSimulate={handleSimulate} />

      {/* Reminder Modal */}
      <ReminderModal 
        notification={selectedNotifForReminder}
        onClose={() => setSelectedNotifForReminder(null)}
        onSetReminder={handleSetReminder}
      />
    </div>
  );
}
