
import React from 'react';
import type { AttendanceRecord } from '../types';
import { CalendarIcon, ClockIcon, MapPinIcon, QrCodeIcon } from './Icons';

interface AttendanceHistoryProps {
  history: AttendanceRecord[];
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mt-6 w-full">
        <p className="text-gray-600 dark:text-gray-400">No attendance history found.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Attendance History</h2>
      <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {history.map((record) => (
          <li key={record.timestamp} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{record.eventType}</p>
                 {record.locationName && (
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{record.locationName}</p>
                 )}
              </div>
              <div className="text-xs text-right text-gray-500 dark:text-gray-400 flex-shrink-0">
                <div className="flex items-center justify-end gap-1"><CalendarIcon className="w-3 h-3" /> {new Date(record.timestamp).toLocaleDateString()}</div>
                <div className="flex items-center justify-end gap-1"><ClockIcon className="w-3 h-3" /> {new Date(record.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
            <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 dark:text-blue-400"
                  aria-label="View location on Google Maps"
                >
                  {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <QrCodeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Session: <code className="text-xs bg-gray-200 dark:bg-gray-600 rounded px-1 py-0.5">{record.sessionId}</code>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendanceHistory;
