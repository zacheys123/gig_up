// components/payments/VerificationDashboard.tsx
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { extractMpesaData, formatPaymentData } from "@/lib/payment";

export function VerificationDashboard({ gig, onVerify }: any) {
  const [extracting, setExtracting] = useState(false);
  const [musicianData, setMusicianData] = useState(null);
  const [clientData, setClientData] = useState(null);

  const runOcrExtraction = async () => {
    setExtracting(true);
    try {
      const [mData, cData] = await Promise.all([
        extractMpesaData(gig.musicianPaymentConfirm.screenshot),
        extractMpesaData(gig.clientPaymentConfirm.screenshot),
      ]);
      setMusicianData(mData);
      setClientData(cData);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Payment Verification</h3>
        <Button
          onClick={runOcrExtraction}
          disabled={extracting}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${extracting ? "animate-spin" : ""}`}
          />
          Run OCR
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Musician Screenshot */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Musician Screenshot
          </h4>
          <div className="relative group">
            <img
              src={gig.musicianPaymentConfirm.screenshot}
              alt="Musician payment"
              className="w-full h-32 object-cover rounded-lg border"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              onClick={() => window.open(gig.musicianPaymentConfirm.screenshot)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          {musicianData && (
            <pre className="text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded">
              {JSON.stringify(formatPaymentData(musicianData), null, 2)}
            </pre>
          )}
        </div>

        {/* Client Screenshot */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            Client Screenshot
          </h4>
          <div className="relative group">
            <img
              src={gig.clientPaymentConfirm.screenshot}
              alt="Client payment"
              className="w-full h-32 object-cover rounded-lg border"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              onClick={() => window.open(gig.clientPaymentConfirm.screenshot)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          {clientData && (
            <pre className="text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded">
              {JSON.stringify(formatPaymentData(clientData), null, 2)}
            </pre>
          )}
        </div>
      </div>

      {gig.paymentVerification && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            gig.paymentVerification.match
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-red-50 dark:bg-red-900/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {gig.paymentVerification.match ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                {gig.paymentVerification.match
                  ? "Verified ✓"
                  : "Verification Failed"}
              </p>
              {gig.paymentVerification.notes && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {gig.paymentVerification.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
