
import React, { useEffect, useRef } from 'react';

// Make Html5QrcodeScanner available in the component scope
declare const Html5Qrcode: any;

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onScanError, onClose }) => {
  const scannerRef = useRef<any>(null);
  const readerId = "qr-reader";

  useEffect(() => {
    if (!scannerRef.current) {
        const html5QrCode = new Html5Qrcode(readerId);
        scannerRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
            onScanSuccess(decodedText);
            html5QrCode.stop().catch(err => console.error("Failed to stop QR scanner:", err));
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, onScanError)
            .catch((err: string) => {
                onScanError(`Unable to start scanning: ${err}`);
            });
    }

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
        if (scannerRef.current) {
            scannerRef.current.stop()
                .then(() => {
                    console.log("QR Scanner stopped successfully.");
                })
                .catch((err: any) => {
                    console.error("Failed to stop QR scanner on cleanup:", err);
                });
            scannerRef.current = null;
        }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl flex flex-col items-center">
      <div id={readerId} className="w-full rounded-lg overflow-hidden border-4 border-gray-200 dark:border-gray-700"></div>
      <button
        onClick={onClose}
        className="mt-4 bg-red-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
      >
        Cancel
      </button>
    </div>
  );
};

export default QRCodeScanner;
