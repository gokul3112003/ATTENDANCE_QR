import React, { useState, useEffect, useCallback } from 'react';
import { toDataURL } from 'qrcode';
import { getDeviceIdentifier, getCurrentLocation } from './services/deviceService';
import { recordAttendance } from './services/supabaseService';
import { getAttendanceHistory, addAttendanceRecord, updateAttendanceRecord } from './services/historyService';
import { getLocationContext } from './services/geminiService';
import type { AttendanceData, QRData, AttendanceStatus, LocationData, AttendanceRecord } from './types';
import { ScanIcon, InfoIcon, HistoryIcon, UserIcon, AcademicCapIcon } from './components/Icons';
import QRCodeScanner from './components/QRCodeScanner';
import StatusDisplay from './components/StatusDisplay';
import AttendanceHistory from './components/AttendanceHistory';

type Role = 'student' | 'teacher';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('student');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [status, setStatus] = useState<AttendanceStatus>({ state: 'idle' });
  const [deviceIdentifier, setDeviceIdentifier] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Teacher Panel State
  const [sessionIdInput, setSessionIdInput] = useState<string>('');
  const [eventTypeInput, setEventTypeInput] = useState<'entry' | 'exit'>('entry');
  const [generatedQrData, setGeneratedQrData] = useState<string | null>(null);

  useEffect(() => {
    setDeviceIdentifier(getDeviceIdentifier());
    setHistory(getAttendanceHistory());
  }, []);

  const resetState = useCallback(() => {
    setStatus({ state: 'idle' });
    setIsScanning(false);
  }, []);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    // Reset states for a clean transition
    resetState();
    setShowHistory(false);
    setGeneratedQrData(null);
    setSessionIdInput('');
    setEventTypeInput('entry');
  };

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    setIsScanning(false);
    setStatus({ state: 'loading', message: 'Processing attendance...' });

    let qrData: QRData;
    try {
      qrData = JSON.parse(decodedText);
      if (!qrData.sessionId || !qrData.eventType) {
        throw new Error("Invalid QR code format.");
      }
    } catch (error) {
      setStatus({ state: 'error', message: 'Invalid QR code. Please scan the correct code provided by your administrator.' });
      return;
    }

    let location: LocationData;
    try {
      location = await getCurrentLocation();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not get location. Please enable location services and grant permission.';
      setStatus({ state: 'error', message: errorMessage });
      return;
    }
    
    if (!deviceIdentifier) {
       setStatus({ state: 'error', message: 'Could not retrieve device identifier. Please refresh the page.' });
       return;
    }

    const attendanceData: AttendanceData = {
      deviceIdentifier,
      latitude: location.latitude,
      longitude: location.longitude,
      sessionId: qrData.sessionId,
      eventType: qrData.eventType,
    };

    try {
      const result = await recordAttendance(attendanceData);
      
      const newHistory = addAttendanceRecord(attendanceData);
      const newRecord = newHistory[0];

      setHistory(newHistory);
      setStatus({ state: 'success', message: result.message, data: newRecord });

      // Asynchronously get location context and update the record
      getLocationContext(location).then(locationName => {
        if (locationName && locationName !== "N/A") {
          const recordWithLocation: AttendanceRecord = { ...newRecord, locationName };
          const finalHistory = updateAttendanceRecord(recordWithLocation);
          
          setHistory(finalHistory);
          setStatus(prevStatus => {
            if (prevStatus.state === 'success' && (prevStatus.data as AttendanceRecord)?.timestamp === recordWithLocation.timestamp) {
              return { ...prevStatus, data: recordWithLocation };
            }
            return prevStatus;
          });
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setStatus({ state: 'error', message: `Submission failed: ${errorMessage}` });
    }
  }, [deviceIdentifier]);

  const handleScanError = useCallback((errorMessage: string) => {
    console.error(`QR Scanner Error: ${errorMessage}`);
  }, []);
  
  const handleGenerateQr = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!sessionIdInput.trim()) {
        setStatus({ state: 'error', message: 'Session ID cannot be empty.' });
        return;
      }
      const qrData: QRData = {
        sessionId: sessionIdInput.trim(),
        eventType: eventTypeInput,
      };
      const qrDataString = JSON.stringify(qrData);
      try {
        const dataUrl = await toDataURL(qrDataString, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.9,
            margin: 1,
            width: 256,
        });
        setGeneratedQrData(dataUrl);
        setStatus({state: 'idle'}); // Clear any previous error message
      } catch (err) {
        console.error(err);
        setStatus({ state: 'error', message: 'Could not generate QR code.' });
      }
    };

  
  const startScanning = () => {
    resetState();
    setIsScanning(true);
  }

  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center justify-between p-4 font-sans">
      <header className="w-full max-w-md text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">Attendance System</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {role === 'student' ? 'Scan the QR code to mark your attendance.' : 'Generate a QR code for a new session.'}
        </p>
      </header>
      
      <div className="w-full max-w-xs my-6 p-1 flex justify-center bg-gray-200 dark:bg-gray-700 rounded-xl space-x-1">
        <button
          onClick={() => handleRoleChange('student')}
          className={`w-1/2 flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors ${
            role === 'student' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'
          }`}
          aria-pressed={role === 'student'}
        >
          <UserIcon className="w-5 h-5" /> Student
        </button>
        <button
          onClick={() => handleRoleChange('teacher')}
          className={`w-1/2 flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors ${
            role === 'teacher' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'
          }`}
          aria-pressed={role === 'teacher'}
        >
          <AcademicCapIcon className="w-5 h-5" /> Teacher
        </button>
      </div>

      <main className="flex flex-col items-center justify-start flex-grow w-full max-w-md">
        {role === 'student' && (
          <>
            {isScanning ? (
              <QRCodeScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                onClose={() => setIsScanning(false)}
              />
            ) : (
              <div className="w-full text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                {status.state === 'idle' && (
                  <div className="flex flex-col items-center">
                    <ScanIcon className="w-16 h-16 text-indigo-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-4">Ready to Scan</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Press the button below to open your camera and scan the attendance QR code.</p>
                  </div>
                )}
                {status.state !== 'idle' && <StatusDisplay status={status} />}
                {status.state !== 'loading' && (
                  <button
                    onClick={startScanning}
                    className="w-full mt-6 bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-transform transform hover:scale-105"
                  >
                    {status.state === 'idle' ? 'Scan Attendance QR' : 'Scan Again'}
                  </button>
                )}
              </div>
            )}

            <div className="w-full max-w-md mt-4 flex justify-center">
              {history.length > 0 && (
                <button
                  onClick={toggleHistory}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <HistoryIcon className="w-5 h-5 mr-2" />
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>
              )}
            </div>

            {showHistory && <AttendanceHistory history={history} />}
          </>
        )}

        {role === 'teacher' && (
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Generate Attendance QR</h2>
             {status.state === 'error' && <StatusDisplay status={status} />}
            <form onSubmit={handleGenerateQr} className="space-y-4">
              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session ID</label>
                <input
                  type="text"
                  id="sessionId"
                  value={sessionIdInput}
                  onChange={(e) => setSessionIdInput(e.target.value)}
                  placeholder="e.g., MATH101-Lec1"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Type</label>
                <div className="mt-2 flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="eventType" value="entry" checked={eventTypeInput === 'entry'} onChange={() => setEventTypeInput('entry')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"/>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Entry</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="eventType" value="exit" checked={eventTypeInput === 'exit'} onChange={() => setEventTypeInput('exit')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"/>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Exit</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-transform transform hover:scale-105">
                Generate QR Code
              </button>
            </form>

            {generatedQrData && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Scan this code</h3>
                <img src={generatedQrData} alt="Generated QR Code" className="mt-2 rounded-lg border-4 border-gray-200 dark:border-gray-600" />
                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg w-full">
                    <p><strong>Session:</strong> {sessionIdInput}</p>
                    <p><strong>Event:</strong> <span className="capitalize">{eventTypeInput}</span></p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {role === 'student' && (
        <footer className="w-full max-w-md mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
          <h3 className="font-bold text-sm mb-2 flex items-center"><InfoIcon className="w-4 h-4 mr-2" />Data & Privacy Notice</h3>
          <p className="mb-2">To prevent misuse, this app collects the following anonymous data:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Unique Device ID:</strong> <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-indigo-800 dark:text-indigo-300 break-all">{deviceIdentifier || 'loading...'}</code></li>
            <li><strong>GPS Location:</strong> Captured only at the time of scan.</li>
          </ul>
          <p className="mt-2">This app uses local storage to save your attendance history on this device only.</p>
        </footer>
      )}
    </div>
  );
};

export default App;
