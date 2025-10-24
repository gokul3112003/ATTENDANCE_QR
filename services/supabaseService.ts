
import type { AttendanceData } from '../types';

/**
 * Simulates sending attendance data to a Supabase backend.
 * In a real application, this would use the Supabase client to make an RPC call
 * or insert a row into a table.
 * @param {AttendanceData} data The attendance data to be recorded.
 * @returns {Promise<{message: string}>} A promise that resolves with a success message.
 * @throws {Error} Simulates a network or server error.
 */
export function recordAttendance(data: AttendanceData): Promise<{ message: string }> {
  console.log('Submitting attendance data to Supabase:', data);

  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate a potential error (e.g., duplicate submission)
      if (data.sessionId === 'FAIL_SESSION') {
        reject(new Error('This session has expired or the submission is a duplicate.'));
      } else {
        // Simulate a successful submission
        resolve({
          message: `Attendance for ${data.eventType} successfully recorded at ${new Date().toLocaleTimeString()}.`,
        });
      }
    }, 1500);
  });
}
