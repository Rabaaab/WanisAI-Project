import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useGenerateDoctorBrief } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Link2, Share2, Clipboard, Printer, AlertCircle, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorBriefs() {
  const { t } = useLang();
  const generateBrief = useGenerateDoctorBrief();
  const [brief, setBrief] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      const result = await generateBrief.mutateAsync();
      setBrief(result);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the brief. Please ensure you have check-ins and medications configured.",
      });
    }
  };

  const getShareUrl = () => {
    if (!brief) return "";
    return `${window.location.origin}/share/brief/${brief.key}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Secure view-only link copied to your clipboard.",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: "Patient Doctor Brief",
      text: `View the shared doctor brief for ${brief?.patientName || "Patient"} containing medication intelligence and check-in trends.`,
      url: getShareUrl(),
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Fallback: Copy link
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7]/40 p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Doctor Brief Builder
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm md:text-base font-sans">
          Prepare a comprehensive summary of your loved one's well-being and cognitive health findings for their next clinical visit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* On Demand Generation Card */}
        <Card className="border border-border/80 shadow-md bg-white">
          <CardHeader className="bg-primary/5 pb-6">
            <CardTitle className="text-xl font-serif">On-Demand Brief Summary</CardTitle>
            <CardDescription>
              Generates a neat, print-ready overview showing cumulative Anticholinergic Burden (ACB) and check-in mood trends.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-semibold text-lg text-foreground">Ready to compile findings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This report is compiled in real-time using observations entered by the family circle and is styled for easy viewing during doctor appointments.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generateBrief.isPending}
              className="px-8 py-3 h-auto text-sm font-semibold shadow-md active:scale-95 transition-transform"
            >
              {generateBrief.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Compiling Brief...
                </>
              ) : (
                "Generate Brief Document"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Share and Print Panel */}
        {brief && (
          <Card className="border border-primary/20 shadow-lg bg-gradient-to-br from-white to-primary/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg font-serif text-primary">Doctor Brief Generated Successfully</CardTitle>
              <CardDescription>Share secure link, export to PDF, or print directly.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Preview Box */}
              <div className="border border-border/50 rounded-xl p-5 bg-white space-y-4">
                <div className="flex justify-between border-b border-border/40 pb-3">
                  <div>
                    <div className="text-xs uppercase font-bold text-muted-foreground">Patient Name</div>
                    <div className="font-semibold text-foreground text-sm">{brief.patientName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase font-bold text-muted-foreground">Cumulative ACB Score</div>
                    <div className="font-bold text-primary text-sm">{brief.acbScore}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Medication findings</div>
                  <p className="text-xs text-foreground/80 line-clamp-3 leading-relaxed">{brief.medicationFindings}</p>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={() => window.open(`/share/brief/${brief.key}`, "_blank")}
                  variant="outline"
                  className="gap-2 font-semibold h-11"
                >
                  <FileText className="w-4 h-4" /> View Brief Page
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="gap-2 font-semibold h-11"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4" />}
                  {copied ? "Link Copied!" : "Copy Share Link"}
                </Button>
                <Button
                  onClick={handleNativeShare}
                  className="gap-2 font-semibold h-11"
                >
                  <Share2 className="w-4 h-4" /> Share Summary
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-muted-foreground text-xs leading-relaxed flex-col">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Disclaimer:</strong> This summary is not a professional diagnosis. It is intended solely as an information guide to support clinician dialogue.
                  </p>
                </div>
                <div className="border-t border-amber-500/10 pt-2 pl-7 text-[11px] w-full">
                  <span className="font-semibold text-amber-800">Conversation Starter:</span> Consider asking your physician about <strong className="text-amber-900">p-tau217 blood biomarker testing</strong> as an emerging early-detection option. This is an educational talking point, not a clinical recommendation.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
