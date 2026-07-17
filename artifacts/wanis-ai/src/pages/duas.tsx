import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/contexts/LanguageContext"

interface Dua {
  arabic: string
  transliteration: string
  en: string
  fr: string
}

interface DuaCategory {
  id: string
  label: { en: string; ar: string; fr: string }
  emoji: string
  duas: Dua[]
}

const CATEGORIES: DuaCategory[] = [
  {
    id: "travel",
    label: { en: "Travel", ar: "السفر", fr: "Voyage" },
    emoji: "✈️",
    duas: [
      {
        arabic: "اللّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
        transliteration: "Allahumma inna nas'aluka fi safarina hadha al-birra wat-taqwa, wa minal-'amali ma tardha",
        en: "O Allah, we ask You on this journey for righteousness and piety, and for works that are pleasing to You.",
        fr: "Ô Allah, nous Te demandons lors de ce voyage la vertu, la piété et les actes qui Te plaisent.",
      },
      {
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
        transliteration: "Subhaanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin",
        en: "Glory be to Him Who has subjected this to us, and we could never have it by our efforts.",
        fr: "Gloire à Celui qui nous a soumis cela, alors que nous n'aurions pu y parvenir par nous-mêmes.",
      },
    ],
  },
  {
    id: "calm",
    label: { en: "Calm & Distress", ar: "الطمأنينة", fr: "Apaisement" },
    emoji: "🌿",
    duas: [
      {
        arabic: "اللّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
        transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal",
        en: "O Allah, I seek refuge in You from anxiety and grief, and I seek refuge in You from incapacity and laziness.",
        fr: "Ô Allah, je cherche refuge en Toi contre l'anxiété et la tristesse, contre l'impuissance et la paresse.",
      },
      {
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        transliteration: "Hasbunallahu wa ni'mal-wakil",
        en: "Allah is sufficient for us, and He is the best Disposer of affairs.",
        fr: "Allah nous suffit et Il est le meilleur garant.",
      },
      {
        arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
        transliteration: "La ilaha illa anta subhanaaka inni kuntu minaz-zalimin",
        en: "There is no god but You; glory be to You. Indeed, I have been among the wrongdoers.",
        fr: "Il n'y a de dieu que Toi, gloire à Toi. Je suis vraiment du nombre des injustes.",
      },
    ],
  },
  {
    id: "gratitude",
    label: { en: "Gratitude", ar: "الشكر", fr: "Gratitude" },
    emoji: "🌸",
    duas: [
      {
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        transliteration: "Alhamdulillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
        en: "Praise be to Allah Who has fed us and given us drink and made us Muslims.",
        fr: "Louange à Allah qui nous a nourris, abreuvés et nous a faits musulmans.",
      },
      {
        arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ",
        transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya wa 'ala walidayya",
        en: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents.",
        fr: "Seigneur, inspire-moi de Te remercier pour le bienfait que Tu m'as accordé ainsi qu'à mes parents.",
      },
    ],
  },
]

export default function Duas() {
  const { t, lang, isRTL } = useLang()
  const [activeCategory, setActiveCategory] = useState<string>("calm")
  const [expandedDua, setExpandedDua] = useState<number | null>(null)

  const category = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0]

  const getLabel = (c: DuaCategory) =>
    lang === "ar" ? c.label.ar : lang === "fr" ? c.label.fr : c.label.en

  const getTranslation = (dua: Dua) =>
    lang === "fr" ? dua.fr : dua.en

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto pb-28 md:pb-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {t("duas")}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "أدعية للسفر والطمأنينة والشكر"
            : lang === "fr"
            ? "Invocations pour le voyage, l'apaisement et la gratitude"
            : "Supplications for travel, calm, and gratitude"}
        </p>
      </header>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveCategory(c.id); setExpandedDua(null) }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeCategory === c.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-foreground hover:bg-primary/10"
            }`}
          >
            <span>{c.emoji}</span>
            <span>{getLabel(c)}</span>
          </button>
        ))}
      </div>

      {/* Duas list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {category.duas.map((dua, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-card rounded-2xl overflow-hidden border border-card-border"
            >
              {/* Arabic text — always shown */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedDua(expandedDua === idx ? null : idx)}
                dir="rtl"
              >
                <p className="text-xl leading-relaxed text-foreground font-serif" style={{ fontFamily: "'Amiri', 'Scheherazade New', 'Lora', serif" }}>
                  {dua.arabic}
                </p>
              </div>

              {/* Expanded: transliteration + translation */}
              <AnimatePresence>
                {expandedDua === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <div className="px-6 pb-6 space-y-3 border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground italic font-sans leading-relaxed">
                        {dua.transliteration}
                      </p>
                      <p className="text-base text-foreground font-sans leading-relaxed">
                        {getTranslation(dua)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tap hint */}
              {expandedDua !== idx && (
                <div className="px-6 pb-4 -mt-2">
                  <p className="text-xs text-muted-foreground font-sans">
                    {lang === "ar" ? "اضغط لعرض المعنى" : lang === "fr" ? "Appuyer pour voir la traduction" : "Tap to see meaning"}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
