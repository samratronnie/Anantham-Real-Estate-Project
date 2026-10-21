import React, { useState, useEffect } from 'react';
import { Radio, X, ChevronUp, ChevronDown, Trash2, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { BusEventPayload } from '../types.ts';
import { eventBus } from '../services/eventBus.ts';

interface EventBusMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventBusMonitor: React.FC<EventBusMonitorProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<BusEventPayload[]>([]);
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [selectedLog, setSelectedLog] = useState<BusEventPayload | null>(null);

  useEffect(() => {
    const unbind = eventBus.subscribeToLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unbind();
  }, []);

  if (!isOpen) return null;

  return (
    <aside 
      aria-label="Live Event Bus Activity"
      className={`fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-[#1c2331] text-white rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 flex flex-col ${
        isMinimized ? 'h-14' : 'h-[380px]'
      }`}
    >
      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#f9b234] animate-pulse" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-200">
            Dynamic Event Bus Monitor
          </h3>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#f9b234] text-[#1c2331] font-bold">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => eventBus.clearLogs()}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Clear Event Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-slate-800 transition"
            title={isMinimized ? 'Expand Monitor' : 'Minimize Monitor'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Close Monitor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-hidden flex flex-col p-2 space-y-2 text-xs">
          <div className="text-[11px] text-gray-400 px-1 flex items-center justify-between">
            <span>Dynamic events dispatched across buttons:</span>
            <span className="text-emerald-400 font-mono">● Real-time</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#f9b234]" />
                <p>Click any button (Category, Browse, Post, Book Appointment) to view live event data packets.</p>
              </div>
            ) : (
              logs.map((log, index) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString();
                const isSelected = selectedLog?.timestamp === log.timestamp;
                return (
                  <div
                    key={`${log.timestamp}-${index}`}
                    onClick={() => setSelectedLog(isSelected ? null : log)}
                    className={`p-2 rounded-lg cursor-pointer transition border ${
                      isSelected
                        ? 'bg-slate-800 border-[#f9b234]'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span className="text-[#f9b234] font-bold">{log.action}</span>
                      <span>{timeStr}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                      <span className="text-amber-200/90 truncate max-w-[140px]">{log.source}</span>
                      <ArrowRight className="w-3 h-3 text-gray-500 shrink-0" />
                      <span className="text-emerald-300 truncate max-w-[120px]">{log.target || 'Listeners'}</span>
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-slate-700/80 text-[10px] text-gray-300">
                        <span className="text-gray-400 block mb-0.5">Exchanged Data Packet:</span>
                        <pre className="p-1.5 bg-black/40 rounded overflow-x-auto text-[10px] text-emerald-400">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
