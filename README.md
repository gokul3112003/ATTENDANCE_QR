# QR Attendance System

A modern, mobile-first web application for a seamless attendance tracking experience. This app allows students to quickly mark their attendance by scanning a QR code, while providing teachers with the tools to generate session codes on the fly.

## ✨ Features

-   **Dual Roles:** Easily switch between Student and Teacher modes.
    -   👤 **Student View:** Scan QR codes with your camera, get instant confirmation, and view your personal attendance history saved on your device.
    -   🧑‍🏫 **Teacher View:** Generate unique QR codes for different sessions and event types (Entry/Exit).
-   **Smart Location Tracking:** Captures GPS coordinates on scan and uses the Gemini API with Google Maps Grounding to provide a human-readable venue name (e.g., "Main Library, Room 102").
-   **Secure & Unique:** Utilizes a unique, anonymous device identifier to prevent duplicate entries and ensure data integrity.
-   **Offline History:** Attendance history is stored locally in your browser's localStorage, so you can access it anytime.
-   **Responsive Design:** Built with Tailwind CSS for a great experience on any device, from phones to desktops.
-   **Client-Side QR Generation:** Teachers can generate QR codes instantly without needing a server connection.

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript
-   **Styling:** Tailwind CSS
-   **QR Code Scanning:** `html5-qrcode`
-   **QR Code Generation:** `qrcode`
-   **AI & Geolocation:** Google Gemini API (`gemini-2.5-flash`) with Google Maps Grounding

## 🚀 Getting Started

This is a static web application with no build step required.

1.  Clone or download the repository.
2.  The application requires a Google Gemini API key to be available as an environment variable (`process.env.API_KEY`) in the execution environment.
3.  Simply open the `index.html` file in a modern web browser that can provide this environment variable.

## 📁 File Structure

```
.
├── index.html              # The main HTML entry point
├── index.tsx               # Main React application component loader
├── App.tsx                 # The core application logic and UI
├── README.md               # Project documentation (this file)
├── components/             # Reusable React components
│   ├── AttendanceHistory.tsx
│   ├── Icons.tsx
│   ├── QRCodeScanner.tsx
│   └── StatusDisplay.tsx
├── services/               # Modules for specific functionalities
│   ├── deviceService.ts
│   ├── geminiService.ts
│   ├── historyService.ts
│   └── supabaseService.ts    # (Simulated backend service)
├── types.ts                # TypeScript type definitions
└── metadata.json           # Application metadata for the execution environment
```
