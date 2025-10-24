
export interface QRData {
  sessionId: string;
  eventType: 'entry' | 'exit';
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface AttendanceData extends LocationData {
  deviceIdentifier: string;
  sessionId: string;
  eventType: 'entry' | 'exit';
  locationName?: string;
}

export interface AttendanceRecord extends AttendanceData {
  timestamp: string;
}

export type AttendanceStatusState = 'idle' | 'loading' | 'success' | 'error';

export interface AttendanceStatus {
  state: AttendanceStatusState;
  message?: string;
  data?: AttendanceData | AttendanceRecord;
}
