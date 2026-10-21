import React from 'react';
import { X, Calendar, Clock, User, Phone, Mail, MapPin, Check, Trash2, AlertCircle } from 'lucide-react';
import { Appointment } from '../types.ts';
import { updateAppointmentStatus, cancelAppointment } from '../services/firebase.ts';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

interface AppointmentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
}

export const AppointmentsDrawer: React.FC<AppointmentsDrawerProps> = ({
  isOpen,
  onClose,
  appointments,
}) => {
  if (!isOpen) return null;

  const handleStatusChange = async (apt: Appointment, status: 'confirmed' | 'cancelled') => {
    try {
      await updateAppointmentStatus(apt.id, status);
      eventBus.emit(
        BUS_EVENTS.NOTIFICATION_SHOW,
        { message: `Appointment for ${apt.listingTitle} marked as ${status}` },
        `AppointmentDrawer [Status ${status}] Button`,
        'App'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await cancelAppointment(id);
      eventBus.emit(
        BUS_EVENTS.NOTIFICATION_SHOW,
        { message: 'Appointment removed from live database.' },
        'AppointmentDrawer [Delete] Button',
        'App'
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-[#1c2331] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#f9b234]" />
            <div>
              <h3 className="font-bold text-lg">Marketplace Bookings</h3>
              <p className="text-xs text-gray-400">Live multi-device database sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-md transition"
            aria-label="Close drawer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-16 px-4 text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-bold text-gray-700 mb-1">No Appointments Yet</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Click "Book Appointment" on any listing card to test real-time booking and validation.
              </p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-4 shadow-xs hover:border-[#f9b234]/50 transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-[#1c2331] text-sm leading-tight">
                    {apt.listingTitle}
                  </h4>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      apt.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-800">{apt.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{apt.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{apt.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Date: {apt.date}</span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2.5">
                  <div className="flex gap-1.5">
                    {apt.status !== 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(apt, 'confirmed')}
                        className="text-[11px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded cursor-pointer transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Confirm
                      </button>
                    )}
                    {apt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(apt, 'cancelled')}
                        className="text-[11px] px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded cursor-pointer transition"
                      >
                        Decline
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="text-gray-400 hover:text-rose-600 p-1 rounded transition"
                    title="Delete booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
