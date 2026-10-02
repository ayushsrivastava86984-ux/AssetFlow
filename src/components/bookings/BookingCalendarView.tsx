import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const BookingCalendarView: React.FC = () => {
  const { assets, bookings, createBooking, cancelBooking, currentUser } = useApp();

  const bookableResources = assets.filter((a) => a.isBookable);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    bookableResources[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookPurpose, setBookPurpose] = useState('');
  const [bookStartTime, setBookStartTime] = useState('11:00');
  const [bookEndTime, setBookEndTime] = useState('12:00');
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');

  const currentResource = assets.find((a) => a.id === selectedResourceId);

  // Filter bookings for this resource on this day/week
  const resourceBookings = bookings.filter((b) => {
    if (selectedResourceId && b.resourceId !== selectedResourceId) return false;
    return true;
  });

  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess('');

    const startISO = `${selectedDate}T${bookStartTime}:00Z`;
    const endISO = `${selectedDate}T${bookEndTime}:00Z`;

    const res = createBooking({
      resourceId: selectedResourceId,
      title: bookTitle.trim(),
      purpose: bookPurpose.trim(),
      startTime: startISO,
      endTime: endISO,
    });

    if (res.success) {
      setBookSuccess(res.message);
      setTimeout(() => {
        setIsBookModalOpen(false);
        setBookSuccess('');
        setBookTitle('');
        setBookPurpose('');
      }, 1500);
    } else {
      setBookError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Resource Reservation Calendar</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
              Conflict Shield Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time overlap prevention for meeting rooms, laser projectors, mobile vans, and specialized laboratories.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Resource Selector Carousel / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {bookableResources.map((res) => {
          const isSelected = res.id === selectedResourceId;
          const isUnderMaintenance = res.status === 'Under Maintenance';

          return (
            <button
              key={res.id}
              onClick={() => setSelectedResourceId(res.id)}
              className={`p-3.5 rounded-xl border text-left transition-all shadow-xs cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {res.assetTag}
                </span>
                <Badge status={res.status} size="sm" />
              </div>
              <div className="font-semibold text-xs text-slate-900 dark:text-white mt-1.5 truncate">
                {res.name}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">{res.location}</div>
            </button>
          );
        })}
      </div>

      {/* Date Navigation & Calendar Timeline View */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 px-2 py-0.5 focus:outline-none"
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Schedule for {currentResource?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Today: Sep 28, 2026</span>
          </div>
        </div>

        {/* Timeline Slot Grid */}
        <div className="space-y-2">
          {timeSlots.map((slot) => {
            const slotHour = parseInt(slot.split(':')[0], 10);

            // Find any booking occupying this hour
            const matchingBookings = resourceBookings.filter((b) => {
              if (b.status === 'Cancelled') return false;
              const bDate = b.startTime.split('T')[0];
              if (bDate !== selectedDate) return false;

              const bStartH = new Date(b.startTime).getUTCHours();
              const bEndH = new Date(b.endTime).getUTCHours();

              return slotHour >= bStartH && slotHour < (bEndH || bStartH + 1);
            });

            const hasConflict = matchingBookings.length > 0;

            return (
              <div
                key={slot}
                className="flex items-start gap-4 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="w-16 font-mono text-xs font-semibold text-slate-500 shrink-0 pt-0.5">
                  {slot}
                </div>

                <div className="flex-1">
                  {hasConflict ? (
                    <div className="space-y-1.5">
                      {matchingBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 p-2.5 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {b.title}
                              </span>
                              <Badge status={b.status} size="sm" />
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Reserved by <span className="font-semibold text-slate-700 dark:text-slate-300">{b.userName}</span> • &ldquo;{b.purpose}&rdquo;
                            </div>
                            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                              {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                              {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {(currentUser.id === b.userId || currentUser.role === 'Admin') && (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs text-slate-400 italic">Slot Available</span>
                      <button
                        onClick={() => {
                          setBookStartTime(slot);
                          const nextH = (slotHour + 1).toString().padStart(2, '0') + ':00';
                          setBookEndTime(nextH);
                          setIsBookModalOpen(true);
                        }}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        + Book this slot
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Reservation Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Reserve Shared Resource"
        subtitle="Automatic database overlap prevention prevents double bookings"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateReservation} className="space-y-4">
          {bookError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{bookError}</span>
            </div>
          )}

          {bookSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{bookSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Bookable Resource *
            </label>
            <select
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {bookableResources.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.assetTag}] {r.name} ({r.location}) - Status: {r.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Booking Title / Event *
            </label>
            <input
              type="text"
              placeholder="e.g. Quarterly Product Architecture Sync"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meeting Purpose / Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Reviewing load test benchmarks with the lead infrastructure engineers."
              value={bookPurpose}
              onChange={(e) => setBookPurpose(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={bookStartTime}
                onChange={(e) => setBookStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={bookEndTime}
                onChange={(e) => setBookEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
            <span>
              Collision rule active: A reservation from 9:00 to 10:00 automatically blocks overlapping requests like 9:30 to 10:30, but permits back-to-back bookings starting at 10:00.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
