import { useState, useEffect } from 'react';
import { userAPI } from '../api/client';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await userAPI.getSettings();
      if (response.data) {
        setSettings({
          pomodoroDuration: response.data.pomodoroDuration || 25,
          shortBreakDuration: response.data.shortBreakDuration || 5,
          longBreakDuration: response.data.longBreakDuration || 15,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await userAPI.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-8">Settings</h1>
      
      <div className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Timer Preferences</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Pomodoro (minutes)
              </label>
              <input
                type="number"
                name="pomodoroDuration"
                min="1"
                max="60"
                value={settings.pomodoroDuration}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg dark:bg-surface-900 dark:border-surface-700 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Short Break (minutes)
              </label>
              <input
                type="number"
                name="shortBreakDuration"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg dark:bg-surface-900 dark:border-surface-700 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                name="longBreakDuration"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg dark:bg-surface-900 dark:border-surface-700 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-700">
            <span className={`text-sm font-medium ${message.includes('Failed') ? 'text-brand-danger' : 'text-brand-success'}`}>
              {message}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-primary text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-600 transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}