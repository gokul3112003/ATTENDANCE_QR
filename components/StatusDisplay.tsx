
import React from 'react';
import type { AttendanceStatus, AttendanceRecord } from '../types';
import { LoaderIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface StatusDisplayProps {
  status: AttendanceStatus;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  switch (status.state) {
    case 'loading':
      return (
        <div className="flex flex-col items-center text-center p-4">
          <LoaderIcon className="w-16 h-16 text-indigo-500 animate-spin" />
          <p className="mt-4 text-lg font-semibold">{status.message || 'Loading...'}</p>
        </div>
      );
    case 'success':
      return (
        <div className="flex flex-col items-center text-center p-4 text-green-700 dark:text-green-400">
          <CheckCircleIcon className="w-16 h-16" />
          <h2 className="mt-4 text-2xl font-bold">Success!</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{status.message}</p>
          {status.data && (
            <div className="mt-4 text-left text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-gray-700 p-3 rounded-lg border border-green-200 dark:border-gray-600 w-full">
              {(status.data as AttendanceRecord).locationName && (
                  <p><strong>Venue:</strong> {(status.data as AttendanceRecord).locationName}</p>
              )}
              <p><strong>Event:</strong> <span className="capitalize">{status.data.eventType}</span></p>
              <p><strong>Session:</strong> {status.data.sessionId}</p>
              <p><strong>Location:</strong> {status.data.latitude.toFixed(4)}, {status.data.longitude.toFixed(4)}</p>
            </div>
          )}
        </div>
      );
    case 'error':
      return (
        <div className="flex flex-col items-center text-center p-4 text-red-600 dark:text-red-400">
          <XCircleIcon className="w-16 h-16" />
          <h2 className="mt-4 text-2xl font-bold">Error</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-gray-700 p-3 rounded-lg border border-red-200 dark:border-gray-600">{status.message || 'An unknown error occurred.'}</p>
        </div>
      );
    default:
      return null;
  }
};

export default StatusDisplay;
