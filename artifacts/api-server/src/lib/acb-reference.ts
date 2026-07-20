// Anticholinergic Cognitive Burden (ACB) Scale Reference
// 1 = Possible cognitive effect
// 2-3 = Established clinically relevant cognitive effect
// This is a static reference for common medications.

export const acbReference: Record<string, number> = {
  // Score 3 (High)
  "amitriptyline": 3,
  "atropine": 3,
  "benztropine": 3,
  "chlorpheniramine": 3,
  "chlorpromazine": 3,
  "clomipramine": 3,
  "clozapine": 3,
  "cyproheptadine": 3,
  "darifenacin": 3,
  "desipramine": 3,
  "dicyclomine": 3,
  "dimenhydrinate": 3,
  "diphenhydramine": 3, // Benadryl
  "doxepin": 3,
  "fesoterodine": 3,
  "flavoxate": 3,
  "hydroxyzine": 3,
  "imipramine": 3,
  "meclizine": 3,
  "methocarbamol": 3,
  "nortriptyline": 3,
  "olanzapine": 3,
  "orphenadrine": 3,
  "oxybutynin": 3,
  "paroxetine": 3,
  "perphenazine": 3,
  "promethazine": 3,
  "propantheline": 3,
  "quetiapine": 3,
  "scopolamine": 3,
  "solifenacin": 3,
  "thioridazine": 3,
  "tolterodine": 3,
  "trifluoperazine": 3,
  "trihexyphenidyl": 3,
  "trimipramine": 3,
  "trospium": 3,

  // Score 2 (Moderate)
  "amantadine": 2,
  "belladonna": 2,
  "carbamazepine": 2,
  "cyclobenzaprine": 2,
  "levomepromazine": 2,
  "loxapine": 2,
  "meperidine": 2,
  "methotrimeprazine": 2,
  "oxcarbazepine": 2,
  "pimozide": 2,

  // Score 1 (Low/Possible)
  "alverine": 1,
  "alprazolam": 1,
  "aripiprazole": 1,
  "atenolol": 1,
  "bupropion": 1,
  "captopril": 1,
  "cimetidine": 1,
  "clindamycin": 1,
  "clorazepate": 1,
  "codeine": 1,
  "colchicine": 1,
  "desloratadine": 1,
  "diazepam": 1,
  "digoxin": 1,
  "dipyridamole": 1,
  "fentanyl": 1,
  "fluvoxamine": 1,
  "furosemide": 1,
  "haloperidol": 1,
  "hydrocortisone": 1,
  "isosorbide": 1,
  "loperamide": 1,
  "metoprolol": 1,
  "morphine": 1,
  "nifedipine": 1,
  "prednisone": 1,
  "ranitidine": 1,
  "risperidone": 1,
  "trazodone": 1,
  "venlafaxine": 1,
  "warfarin": 1,
};

/**
 * Helper to match a given medication name to its ACB score.
 * Matches case-insensitively and looks for substrings (e.g. "Benadryl (Diphenhydramine)").
 */
export function getAcbScore(medicationName: string): number {
  const normalized = medicationName.toLowerCase();
  
  // Try exact match first
  if (acbReference[normalized] !== undefined) {
    return acbReference[normalized];
  }

  // Common brand name mappings
  const brandToGeneric: Record<string, string> = {
    "benadryl": "diphenhydramine",
    "zantac": "ranitidine",
    "paxil": "paroxetine",
    "seroquel": "quetiapine",
    "ditropan": "oxybutynin",
    "zyprexa": "olanzapine",
    "vistaril": "hydroxyzine",
    "atarax": "hydroxyzine",
    "elavil": "amitriptyline",
    "flexeril": "cyclobenzaprine",
    "tegretol": "carbamazepine",
    "haldol": "haloperidol",
    "valium": "diazepam",
    "xanax": "alprazolam",
  };

  // Try brand mappings
  for (const [brand, generic] of Object.entries(brandToGeneric)) {
    if (normalized.includes(brand)) {
      return acbReference[generic] || 0;
    }
  }

  // Try partial match on generic names
  for (const [generic, score] of Object.entries(acbReference)) {
    if (normalized.includes(generic)) {
      return score;
    }
  }

  return 0; // Default to 0 if not found
}
