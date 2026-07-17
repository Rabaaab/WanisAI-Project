import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, ChevronDown, ChevronUp } from "lucide-react"
import { useLang } from "@/contexts/LanguageContext"

interface Surah {
  number: number
  nameAr: string
  nameEn: string
  nameFr: string
  verses: {
    arabic: string
    transliteration: string
    en: string
    fr: string
  }[]
  context: { en: string; ar: string; fr: string }
}

const SURAHS: Surah[] = [
  {
    number: 1,
    nameAr: "سورة الفاتحة",
    nameEn: "Al-Fatiha — The Opening",
    nameFr: "Al-Fatiha — L'Ouverture",
    context: {
      en: "The opening chapter of the Quran, recited in every prayer. A gentle prayer of guidance and gratitude.",
      ar: "الفاتحة هي السورة الأولى في القرآن الكريم، تُقرأ في كل صلاة. دعاء لطيف للهداية والشكر.",
      fr: "Le premier chapitre du Coran, récité dans chaque prière. Une douce prière de guidance et de gratitude.",
    },
    verses: [
      {
        arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
        transliteration: "Bismillahir-Rahmanir-Rahim",
        en: "In the name of Allah, the Most Gracious, the Most Merciful.",
        fr: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        transliteration: "Alhamdu lillahi rabbil-'alamin",
        en: "All praise is due to Allah, Lord of all the worlds.",
        fr: "Louange à Allah, Seigneur de l'Univers.",
      },
      {
        arabic: "الرَّحْمَنِ الرَّحِيمِ",
        transliteration: "Ar-Rahmanir-Rahim",
        en: "The Most Gracious, the Most Merciful.",
        fr: "Le Tout Miséricordieux, le Très Miséricordieux.",
      },
      {
        arabic: "مَالِكِ يَوْمِ الدِّينِ",
        transliteration: "Maliki yawmid-din",
        en: "Master of the Day of Judgment.",
        fr: "Maître du Jour de la rétribution.",
      },
      {
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        transliteration: "Iyyaka na'budu wa iyyaka nasta'in",
        en: "It is You we worship and You we ask for help.",
        fr: "C'est Toi que nous adorons et c'est Toi dont nous implorons le secours.",
      },
      {
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        transliteration: "Ihdinas-siratal-mustaqim",
        en: "Guide us to the straight path.",
        fr: "Guide-nous dans le droit chemin.",
      },
      {
        arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        transliteration: "Siratal-ladhina an'amta 'alayhim ghayril-maghdubi 'alayhim wa lad-dallin",
        en: "The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.",
        fr: "Le chemin de ceux que Tu as comblés de faveurs, non de ceux qui ont encouru Ta colère, ni des égarés.",
      },
    ],
  },
  {
    number: 112,
    nameAr: "سورة الإخلاص",
    nameEn: "Al-Ikhlas — Sincerity",
    nameFr: "Al-Ikhlas — La Sincérité",
    context: {
      en: "A short surah about the oneness of Allah. The Prophet ﷺ said it equals one-third of the Quran.",
      ar: "سورة قصيرة عن توحيد الله. قال النبي ﷺ إنها تعدل ثلث القرآن.",
      fr: "Une courte sourate sur l'unicité d'Allah. Le Prophète ﷺ a dit qu'elle équivaut au tiers du Coran.",
    },
    verses: [
      {
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        transliteration: "Qul huwa Allahu ahad",
        en: "Say: He is Allah, the One.",
        fr: "Dis : « Il est Allah, l'Unique. »",
      },
      {
        arabic: "اللَّهُ الصَّمَدُ",
        transliteration: "Allahus-Samad",
        en: "Allah, the Eternal Refuge.",
        fr: "Allah, le Seul à être imploré pour ce que nous désirons.",
      },
      {
        arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        transliteration: "Lam yalid wa lam yulad",
        en: "He neither begets nor is born.",
        fr: "Il n'a pas engendré et n'a pas été engendré.",
      },
      {
        arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        transliteration: "Wa lam yakun lahu kufuwan ahad",
        en: "Nor is there to Him any equivalent.",
        fr: "Et nul n'est égal à Lui.",
      },
    ],
  },
  {
    number: 93,
    nameAr: "سورة الضحى",
    nameEn: "Ad-Duha — The Morning Hours",
    nameFr: "Ad-Duha — La Matinée",
    context: {
      en: "Revealed as comfort to the Prophet ﷺ during a period of sadness. A gentle reminder that you are never forgotten.",
      ar: "نزلت تعزيةً للنبي ﷺ في وقت الحزن. تذكير لطيف بأننا لسنا منسيين أبدًا.",
      fr: "Révélée comme réconfort au Prophète ﷺ durant une période de tristesse. Un rappel doux que vous n'êtes jamais oublié.",
    },
    verses: [
      {
        arabic: "وَالضُّحَى",
        transliteration: "Wad-duha",
        en: "By the morning brightness.",
        fr: "Par la matinée.",
      },
      {
        arabic: "وَاللَّيْلِ إِذَا سَجَى",
        transliteration: "Wal-layli idha saja",
        en: "And by the night when it covers with darkness.",
        fr: "Et par la nuit quand elle couvre tout de son calme.",
      },
      {
        arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَى",
        transliteration: "Ma wadda'aka rabbuka wa ma qala",
        en: "Your Lord has not taken leave of you, nor has He abandoned you.",
        fr: "Ton Seigneur ne t'a pas abandonné et ne t'a pas oublié.",
      },
      {
        arabic: "وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَى",
        transliteration: "Walal-akhiratu khayrun laka minal-ula",
        en: "And the Hereafter is better for you than the first life.",
        fr: "Certes la vie future est meilleure pour toi que la vie présente.",
      },
      {
        arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى",
        transliteration: "Wa lasawfa yu'tika rabbuka fatarda",
        en: "And your Lord is going to give you, and you will be satisfied.",
        fr: "Et certes ton Seigneur te donnera, et tu seras satisfait.",
      },
    ],
  },
]

export default function Recitation() {
  const { t, lang, isRTL } = useLang()
  const [activeSurah, setActiveSurah] = useState<number>(0)
  const [showTranslation, setShowTranslation] = useState(true)

  const surah = SURAHS[activeSurah]

  const getName = (s: Surah) =>
    lang === "ar" ? s.nameAr : lang === "fr" ? s.nameFr : s.nameEn

  const getContext = (s: Surah) =>
    lang === "ar" ? s.context.ar : lang === "fr" ? s.context.fr : s.context.en

  const getTranslation = (v: Surah["verses"][0]) =>
    lang === "fr" ? v.fr : v.en

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto pb-28 md:pb-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {t("recitation")}
        </h1>
        <p className="text-muted-foreground font-sans">
          {lang === "ar"
            ? "سور قصيرة للتلاوة والطمأنينة"
            : lang === "fr"
            ? "Courts chapitres pour la récitation et l'apaisement"
            : "Short surahs for comfort and recitation"}
        </p>
      </header>

      {/* Surah selector */}
      <div className="flex flex-col gap-2">
        {SURAHS.map((s, idx) => (
          <button
            key={s.number}
            onClick={() => setActiveSurah(idx)}
            className={`text-start w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${
              activeSurah === idx
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-card-border text-foreground hover:border-primary/20"
            }`}
          >
            <span className="text-2xl font-serif font-bold opacity-30 tabular-nums w-8 text-center">
              {s.number}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-semibold text-sm leading-tight">{getName(s)}</p>
            </div>
            {activeSurah === idx && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Context */}
      <div className="bg-accent/10 rounded-2xl p-5">
        <p className="text-sm text-foreground/80 font-sans leading-relaxed italic">
          {getContext(surah)}
        </p>
      </div>

      {/* Translation toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {showTranslation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showTranslation
            ? lang === "ar" ? "إخفاء الترجمة" : lang === "fr" ? "Masquer la traduction" : "Hide translation"
            : lang === "ar" ? "إظهار الترجمة" : lang === "fr" ? "Afficher la traduction" : "Show translation"}
        </button>
      </div>

      {/* Verses */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSurah}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {surah.verses.map((verse, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-card rounded-2xl p-5 border border-card-border space-y-3"
            >
              {/* Arabic — always RTL */}
              <p
                className="text-2xl leading-loose text-foreground font-serif text-end"
                dir="rtl"
                style={{ fontFamily: "'Amiri', 'Scheherazade New', 'Lora', serif" }}
              >
                {verse.arabic}
              </p>

              {showTranslation && (
                <div className="space-y-1.5 pt-2 border-t border-border" dir={isRTL ? "rtl" : "ltr"}>
                  <p className="text-xs text-muted-foreground italic font-sans">
                    {verse.transliteration}
                  </p>
                  <p className="text-sm text-foreground/80 font-sans leading-relaxed">
                    {getTranslation(verse)}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Listen link */}
      <a
        href={`https://quran.com/${surah.number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-primary/30 text-primary font-semibold font-sans text-sm hover:bg-primary/5 transition-colors"
      >
        <Play className="w-4 h-4" />
        {lang === "ar" ? "استمع على موقع القرآن الكريم" : lang === "fr" ? "Écouter sur Quran.com" : "Listen on Quran.com"}
      </a>
    </div>
  )
}
