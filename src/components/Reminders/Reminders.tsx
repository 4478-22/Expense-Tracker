import React, { useState, useEffect } from 'react';
import { Plus, Bell, Check, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Reminder } from '../../types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('due_date', { ascending: true });

    if (!error && data) {
      setReminders(data);
    }
    setLoading(false);
  };

  const addReminder = async (reminderData: any) => {
    const { error } = await supabase
      .from('reminders')
      .insert([reminderData]);

    if (!error) {
      fetchReminders();
    }
  };

  const completeReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: true })
      .eq('id', id);

    if (!error) {
      fetchReminders();
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchReminders();
    }
  };

  const getDateLabel = (date: string) => {
    const reminderDate = new Date(date);
    if (isToday(reminderDate)) return 'Today';
    if (isTomorrow(reminderDate)) return 'Tomorrow';
    if (isPast(reminderDate)) return 'Overdue';
    return format(reminderDate, 'MMM dd, yyyy');
  };

  const getDateColor = (date: string) => {
    const reminderDate = new Date(date);
    if (isPast(reminderDate) && !isToday(reminderDate)) return 'text-red-600 bg-red-50';
    if (isToday(reminderDate)) return 'text-orange-600 bg-orange-50';
    if (isTomorrow(reminderDate)) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const activeReminders = reminders.filter(r => !r.is_completed);
  const completedReminders = reminders.filter(r => r.is_completed);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600">Keep track of important financial tasks</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Active Reminders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activeReminders.map((reminder) => (
              <div key={reminder.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                      {reminder.description && (
                        <p className="text-sm text-gray-600">{reminder.description}</p>
                      )}
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getDateColor(reminder.due_date)}`}>
                        {getDateLabel(reminder.due_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => completeReminder(reminder.id)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Mark as completed"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activeReminders.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No active reminders. You're all caught up!
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Completed</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {completedReminders.slice(0, 5).map((reminder) => (
              <div key={reminder.id} className="p-6 hover:bg-gray-50 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-through">{reminder.title}</h3>
                      {reminder.description && (
                        <p className="text-sm text-gray-600">{reminder.description}</p>
                      )}
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 bg-green-50 text-green-600">
                        Completed
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete reminder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {completedReminders.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No completed reminders yet.
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <ReminderForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={addReminder}
        />
      )}
    </div>
  );
}

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reminder: any) => void;
}

function ReminderForm({ isOpen, onClose, onSubmit }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Reminder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Pay credit card bill"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Additional details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}