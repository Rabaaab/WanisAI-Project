import { useParams } from "wouter";
import { useGetSharedDoctorBrief } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, AlertCircle, Calendar, Heart, ShieldAlert } from "lucide-react";

export default function DoctorBriefShare() {
  const { key } = useParams<{ key: string }>();
  const { data: brief, isLoading, error } = useGetSharedDoctorBrief(key || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F1E7]/20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Loading clinical brief...</p>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F1E7]/20 p-4">
        <Card className="max-w-md w-full border-destructive/20 shadow-md">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-destructive" />
            <h2 className="text-xl font-bold text-foreground">Access Error</h2>
            <p className="text-sm text-muted-foreground">
              This shared clinical brief link is invalid or has expired. Please check with the family network to request a new secure link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-[#F6F1E7]/25 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .print-margin {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-6 print-margin">
        {/* Floating Print Action */}
        <div className="flex justify-between items-center no-print bg-[#2B3E50] text-white px-6 py-4 rounded-2xl shadow-md mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-sm">Secure View-Only Doctor Brief</span>
          </div>
          <Button onClick={() => window.print()} className="bg-amber-500 hover:bg-amber-600 text-[#2B3E50] font-bold gap-2">
            <Printer className="w-4 h-4" /> Print / Export PDF
          </Button>
        </div>

        {/* Brief Content */}
        <Card className="border border-border/80 shadow-md bg-white print-card">
          <CardHeader className="border-b border-border/40 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                Clinical Communication Support
              </div>
              <CardTitle className="text-3xl font-serif font-bold text-foreground">Doctor Brief Summary</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <strong>Patient:</strong> {brief.patientName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(brief.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-border/40 w-full sm:w-auto">
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wide">Anticholinergic Burden</div>
              <div className="text-3xl font-serif font-bold text-primary mt-0.5">{brief.acbScore} <span className="text-lg font-sans font-normal text-muted-foreground">ACB</span></div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8 print-margin">
            {/* Medications findings */}
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-foreground border-b border-border/60 pb-1.5">
                1. Medication Intelligence & Cognitive Burden
              </h3>
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {brief.medicationFindings}
              </div>
            </div>

            {/* Check-ins findings */}
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-foreground border-b border-border/60 pb-1.5">
                2. Recent Well-being & Mood Trends
              </h3>
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {brief.checkInSummary}
              </div>
            </div>

            {/* Clinical disclaimer */}
            <div className="flex items-start gap-4 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-muted-foreground text-xs leading-relaxed mt-6">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-3">
                <div>
                  <strong className="text-amber-800">Important Diagnostic Disclaimer:</strong> This document is a generated summary of logged daily observations and medication lists provided by the patient's family circle. It is designed to assist clinical communication during appointments. This document does not constitute a clinical diagnosis, medical advice, or treatment plan, and must not replace professional clinical judgment.
                </div>
                <div className="border-t border-amber-500/20 pt-2 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-amber-800">Conversation Starter:</span> You may wish to ask the physician about <strong className="text-amber-900">p-tau217 blood biomarker testing</strong> as an emerging early-detection option. This is presented as an educational talking point to help start a discussion with your doctor, not as a clinical recommendation.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
