
import type { AttendanceRecord, AttendanceData } from '../types';

const HISTORY_KEY = 'qr_attendance_history';

export function getAttendanceHistory(): AttendanceRecord[] {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    if (!historyJson) {
      return [];
    }
    const history = JSON.parse(historyJson) as AttendanceRecord[];
    // Ensure it's sorted by newest first, in case of any data corruption
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Failed to parse attendance history:", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}

export function addAttendanceRecord(data: AttendanceData): AttendanceRecord[] {
  const history = getAttendanceHistory();
  const newRecord: AttendanceRecord = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  // Prepend new record to keep the list sorted by most recent
  const newHistory = [newRecord, ...history];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  return newHistory;
}

export function updateAttendanceRecord(updatedRecord: AttendanceRecord): AttendanceRecord[] {
    const history = getAttendanceHistory();
    const recordIndex = history.findIndex(rec => rec.timestamp === updatedRecord.timestamp);
    if (recordIndex > -1) {
        history[recordIndex] = updatedRecord;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
    return history;
}
