import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Check, Brain, Trash2, Loader2, Pill, Copy, Printer } from "lucide-react";
import {
  useListMedications,
  useAddMedication,
  useDeleteMedication,
  useExtractMedicationVision,
  useAnalyzeMedications,
} from "@workspace/api-client-react";
import { PhotoUploader } from "@/components/PhotoUploader";

export default function Medications() {
  const { t } = useLang();
  const { data: medications, refetch: refetchMeds, isLoading: isLoadingMeds } = useListMedications();
  const addMed = useAddMedication();
  const deleteMed = useDeleteMedication();
  const extractVision = useExtractMedicationVision();
  const analyzeMeds = useAnalyzeMedications();

  const [isAdding, setIsAdding] = useState(false);
  const [useVision, setUseVision] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "", reason: "" });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);

  const totalAcb = Array.isArray(medications) ? medications.reduce((sum, m) => sum + (m.acbScore || 0), 0) : 0;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.frequency) return;
    await addMed.mutateAsync({ data: form });
    setForm({ name: "", dosage: "", frequency: "", reason: "" });
    setIsAdding(false);
    refetchMeds();
    setAnalysis(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMed.mutateAsync({ id });
    refetchMeds();
    setAnalysis(null);
  };

  const handlePhotoUpload = async (url: string) => {
    try {
      const result = await extractVision.mutateAsync({ data: { imageUrl: url } });
      setForm({
        name: result.name || "",
        dosage: result.dosage || "",
        frequency: result.frequency || "",
        reason: "",
      });
      setUseVision(false);
    } catch (err) {
      console.error("Failed to extract medication from photo", err);
    }
  };

  const handleAnalyze = async () => {
    const res = await analyzeMeds.mutateAsync();
    setAnalysis(res.explanation);
  };

  const handleCopy = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis);
      setCopiedAnalysis(true);
      setTimeout(() => setCopiedAnalysis(false), 2000);
    } catch (err) {
      console.error("Failed to copy analysis", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7]/40 p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight flex items-center gap-3">
            <Pill className="w-8 h-8 text-primary" />
            Medication Intelligence
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base font-sans">
            Track anticholinergic burden and protect cognitive health for peace of mind.
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant={isAdding ? "outline" : "default"}
          className="shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {isAdding ? "Cancel" : "Add Medication"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Animated Add Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="overflow-hidden"
              >
                <Card className="border border-border/80 shadow-md bg-white/75 backdrop-blur-md">
                  <CardHeader className="bg-primary/5 border-b border-border/40 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-serif">New Medication</CardTitle>
                        <CardDescription>Enter details manually or snap a photo of the label</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUseVision(!useVision)}
                        className="text-primary border-primary/20 hover:bg-primary/5 gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {useVision ? "Manual Entry" : "Scan Label"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {useVision ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Take a clear photo of the prescription label to automatically extract details using AI vision.
                        </p>
                        <PhotoUploader
                          value=""
                          onChange={handlePhotoUpload}
                          label="Upload Label Photo"
                        />
                        {extractVision.isPending && (
                          <div className="flex items-center justify-center py-6 text-primary gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="font-medium">Extracting details...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleManualSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Medication Name</label>
                            <Input
                              placeholder="e.g. Amitriptyline"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              className="bg-white/80"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Dosage</label>
                            <Input
                              placeholder="e.g. 25 mg"
                              value={form.dosage}
                              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                              className="bg-white/80"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/80">Frequency</label>
                          <Input
                            placeholder="e.g. Once daily at bedtime"
                            value={form.frequency}
                            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                            className="bg-white/80"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/80">Reason (Optional)</label>
                          <Input
                            placeholder="e.g. Sleep aid / Nerve pain"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            className="bg-white/80"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={!form.name || !form.dosage || !form.frequency || addMed.isPending}
                          className="w-full mt-2"
                        >
                          {addMed.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Add to Medication List
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Medications List */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Active Medications
            </h3>

            {isLoadingMeds ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
              </div>
            ) : !Array.isArray(medications) || medications.length === 0 ? (
              <Card className="bg-white/40 border-dashed border-border/85">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <Pill className="w-8 h-8 text-primary/40" />
                  </div>
                  <h4 className="font-semibold text-foreground">No medications logged</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Add the family member's current prescriptions to start analyzing their cumulative cognitive burden.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {medications.map((med) => (
                  <motion.div
                    key={med.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -2 }}
                    className="transition-all duration-200"
                  >
                    <Card className="border border-border/50 bg-white/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                      {med.acbScore > 0 && (
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            med.acbScore >= 3 ? "bg-amber-500" : "bg-yellow-500"
                          }`}
                        />
                      )}
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                            {med.name}
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-sans">
                              {med.dosage}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground font-sans">
                            {med.frequency} {med.reason ? `• for ${med.reason}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {med.acbScore > 0 ? (
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  med.acbScore >= 3
                                    ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                                    : "bg-yellow-500/10 text-yellow-800 border border-yellow-500/20"
                                }`}
                              >
                                ACB Burden: {med.acbScore}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-800 border border-green-500/10">
                              No Burden
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(med.id)}
                            className="opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* AI Intelligence Report */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
              >
                <Card className="border border-primary/25 shadow-lg bg-gradient-to-br from-white to-primary/5 overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-primary/10 py-4 flex flex-row items-center justify-between gap-4">
                    <CardTitle className="text-lg font-serif flex items-center gap-2 text-primary">
                      <Brain className="w-5 h-5" />
                      Cognitive Findings &amp; AI Analysis
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 text-primary"
                      >
                        {copiedAnalysis ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Text
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 text-primary"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Report
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="text-sm text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
                      {analysis}
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 text-muted-foreground text-[11px] leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>Medical Disclaimer:</strong> This summary is generated from clinical references. Always consult a licensed physician or doctor before starting, stopping, or altering any medication treatment plans.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Placeholder */}
          {!analysis && Array.isArray(medications) && medications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border border-dashed border-border/80 bg-white/40">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary/60" />
                  </div>
                  <div className="max-w-md">
                    <h4 className="font-serif font-bold text-base text-foreground">Cognitive Burden Analysis Ready</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Generate a detailed intelligence report explaining how these active medications may impact memory, cognitive scores, and general focus.
                    </p>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzeMeds.isPending}
                    className="px-6 py-2.5 h-auto text-xs font-semibold shadow-sm"
                  >
                    {analyzeMeds.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                        Running Cognitive Analysis...
                      </>
                    ) : (
                      "Run Cognitive Analysis"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Panel Widget */}
        <div className="space-y-6">
          <Card className="bg-white/80 border border-border/80 shadow-md overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4 border-b border-border/40">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Cumulative Burden
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="62"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-muted/20"
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="62"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={389.56}
                      initial={{ strokeDashoffset: 389.56 }}
                      animate={{ strokeDashoffset: 389.56 - (389.56 * Math.min(totalAcb, 10)) / 10 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={
                        totalAcb >= 3
                          ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                          : totalAcb > 0
                          ? "text-yellow-500"
                          : "text-green-500"
                      }
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-serif font-bold text-foreground">{totalAcb}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                      ACB Score
                    </span>
                  </div>
                </div>

                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    {totalAcb === 0
                      ? "Clear Cognitive Health"
                      : totalAcb >= 3
                      ? "High Burden Level"
                      : "Mild Burden Level"}
                  </p>
                  <p className="text-xs text-muted-foreground px-2 leading-relaxed">
                    Evaluates medications based on anticholinergic cognitive burden, protecting memory and focus.
                  </p>
                </div>
              </div>

              {Array.isArray(medications) && medications.length > 0 && (
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMeds.isPending}
                  className="w-full py-3 h-auto text-sm font-semibold font-sans shadow-sm whitespace-normal text-center leading-tight flex items-center justify-center"
                >
                  {analyzeMeds.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    "Generate Intelligence Report"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
