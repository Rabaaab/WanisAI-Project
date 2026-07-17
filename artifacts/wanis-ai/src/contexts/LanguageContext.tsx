import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "en" | "ar" | "fr"

// ── Translation dictionary ───────────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    home: "Home",
    check_in: "Check-in",
    family: "Family",
    memory: "Memory",
    talk: "Talk",
    rufqa: "Hajj/Umrah Rufqa",
    settings: "Settings",
    duas: "Duas",
    recitation: "Recitation",

    // Settings sheet
    experience: "Experience",
    simple_mode: "Simple",
    for_me: "For me",
    full_mode: "Full",
    for_family: "For family",
    language: "Language",
    cancel: "Cancel",
    switch_account: "Reset / Switch Account",

    // Companion
    companion_title: "Wanis is here",
    companion_subtitle: "Your daily companion",
    hello: "Hello",
    im_here: "I'm here",
    wanis_status: "Wanis is listening",
    type_message: "Type a message…",
    type_or_tap: "Type or tap the mic…",
    listening: "Listening…",
    start_talking: "Start talking",
    tap_mic: "Tap the mic to speak your answer",
    send: "Send",
    whats_on_your_mind: "What's on your mind?",
    what_would_you_like: "What would you like to talk about?",

    // Check-in
    weekly_checkin: "Weekly Check-in",
    write_much_little: "Write as much or as little as you like. We're just here to listen.",
    this_week_i: "This week, I…",
    save_reflection: "Save Reflection",
    saving: "Saving…",
    our_thoughts: "Our Thoughts",
    reading_checkin: "Reflecting on your words…",
    suggestion_waiting: "Reflecting on your words…",
    thank_you_sharing: "Thank you for sharing",
    thought_of_you: "Taking a moment for yourself is a wonderful habit.",
    view_full_detail: "View Full Detail",
    past_checkins: "Past Check-ins",
    week_of: "Week of",

    // Memory
    add_memory: "Add Memory",
    person_name: "Person's Name",
    relationship: "Relationship",
    photo: "Photo",
    a_small_note: "A small note (optional)",
    save_memory: "Save Memory",
    remove_memory: "Remove this memory?",

    // Guardian / Rufqa
    rufqa_desc: "Your Hajj & Umrah companion profile",
    rufqa_active: "Rufqa Active",
    setup_rufqa: "Set Up Rufqa",
    pilgrim_info: "Pilgrim Information",
    group_leader: "Group Leader",
    leader_name: "Leader's Name",
    leader_phone: "Leader's Phone",
    hotel_name: "Hotel Name",
    hotel_address: "Hotel Address",
    hotel_phone: "Hotel Phone",
    accommodation: "Accommodation",
    medical_emergency: "Medical Emergency",
    medical_notes: "Medical Notes",
    emergency_note: "Emergency Note",

    // Profile
    full_name: "Full Name",
    edit_profile: "Edit Profile",
    save_profile: "Save Profile",

    // Prayer
    prayer_times: "Prayer Times",
    prayer_fajr: "Fajr",
    prayer_dhuhr: "Dhuhr",
    prayer_asr: "Asr",
    prayer_maghrib: "Maghrib",
    prayer_isha: "Isha",
  },

  ar: {
    // Nav
    home: "الرئيسية",
    check_in: "تسجيل الحال",
    family: "العائلة",
    memory: "الذاكرة",
    talk: "تحدث",
    rufqa: "رفقة الحج/العمرة",
    settings: "الإعدادات",
    duas: "الأدعية",
    recitation: "التلاوة",

    // Settings sheet
    experience: "التجربة",
    simple_mode: "بسيط",
    for_me: "لي أنا",
    full_mode: "كامل",
    for_family: "للعائلة",
    language: "اللغة",
    cancel: "إلغاء",
    switch_account: "إعادة ضبط / تغيير الحساب",

    // Companion
    companion_title: "وانيس هنا",
    companion_subtitle: "رفيقك اليومي",
    hello: "مرحباً",
    im_here: "أنا هنا",
    wanis_status: "وانيس يستمع",
    type_message: "اكتب رسالة…",
    type_or_tap: "اكتب أو اضغط على الميكروفون…",
    listening: "أستمع…",
    start_talking: "ابدأ الحديث",
    tap_mic: "اضغط على الميكروفون للتحدث",
    send: "إرسال",
    whats_on_your_mind: "ما الذي يشغل بالك؟",
    what_would_you_like: "عم تريد أن تتحدث؟",

    // Check-in
    weekly_checkin: "تسجيل أسبوعي",
    write_much_little: "اكتب ما تشاء، كثيراً أم قليلاً. نحن هنا للاستماع.",
    this_week_i: "هذا الأسبوع، أنا…",
    save_reflection: "حفظ التأمل",
    saving: "جارٍ الحفظ…",
    our_thoughts: "أفكارنا",
    reading_checkin: "نتأمل في كلامك…",
    suggestion_waiting: "نتأمل في كلامك…",
    thank_you_sharing: "شكراً لك على المشاركة",
    thought_of_you: "أخذ لحظة لنفسك عادة رائعة.",
    view_full_detail: "عرض التفاصيل كاملة",
    past_checkins: "التسجيلات السابقة",
    week_of: "أسبوع",

    // Memory
    add_memory: "إضافة ذكرى",
    person_name: "اسم الشخص",
    relationship: "صلة القرابة",
    photo: "صورة",
    a_small_note: "ملاحظة صغيرة (اختياري)",
    save_memory: "حفظ الذكرى",
    remove_memory: "هل تريد حذف هذه الذكرى؟",

    // Guardian / Rufqa
    rufqa_desc: "ملف رفيق الحج والعمرة",
    rufqa_active: "الرفقة نشطة",
    setup_rufqa: "إعداد الرفقة",
    pilgrim_info: "معلومات الحاج",
    group_leader: "قائد المجموعة",
    leader_name: "اسم القائد",
    leader_phone: "هاتف القائد",
    hotel_name: "اسم الفندق",
    hotel_address: "عنوان الفندق",
    hotel_phone: "هاتف الفندق",
    accommodation: "السكن",
    medical_emergency: "طوارئ طبية",
    medical_notes: "ملاحظات طبية",
    emergency_note: "ملاحظة طوارئ",

    // Profile
    full_name: "الاسم الكامل",
    edit_profile: "تعديل الملف",
    save_profile: "حفظ الملف",

    // Prayer
    prayer_times: "مواقيت الصلاة",
    prayer_fajr: "الفجر",
    prayer_dhuhr: "الظهر",
    prayer_asr: "العصر",
    prayer_maghrib: "المغرب",
    prayer_isha: "العشاء",
  },

  fr: {
    // Nav
    home: "Accueil",
    check_in: "Bilan",
    family: "Famille",
    memory: "Mémoire",
    talk: "Parler",
    rufqa: "Rufqa Hajj/Umrah",
    settings: "Paramètres",
    duas: "Douaas",
    recitation: "Récitation",

    // Settings sheet
    experience: "Expérience",
    simple_mode: "Simple",
    for_me: "Pour moi",
    full_mode: "Complet",
    for_family: "Pour la famille",
    language: "Langue",
    cancel: "Annuler",
    switch_account: "Réinitialiser / Changer de compte",

    // Companion
    companion_title: "Wanis est là",
    companion_subtitle: "Votre compagnon du quotidien",
    hello: "Bonjour",
    im_here: "Je suis là",
    wanis_status: "Wanis écoute",
    type_message: "Écrivez un message…",
    type_or_tap: "Écrivez ou appuyez sur le micro…",
    listening: "J'écoute…",
    start_talking: "Commencez à parler",
    tap_mic: "Appuyez sur le micro pour parler",
    send: "Envoyer",
    whats_on_your_mind: "À quoi pensez-vous ?",
    what_would_you_like: "De quoi souhaitez-vous parler ?",

    // Check-in
    weekly_checkin: "Bilan hebdomadaire",
    write_much_little: "Écrivez autant ou aussi peu que vous voulez. Nous sommes là pour écouter.",
    this_week_i: "Cette semaine, j'ai…",
    save_reflection: "Enregistrer la réflexion",
    saving: "Enregistrement…",
    our_thoughts: "Nos pensées",
    reading_checkin: "En train de réfléchir à vos mots…",
    suggestion_waiting: "En train de réfléchir à vos mots…",
    thank_you_sharing: "Merci de partager",
    thought_of_you: "Prendre un moment pour soi est une belle habitude.",
    view_full_detail: "Voir les détails complets",
    past_checkins: "Bilans passés",
    week_of: "Semaine du",

    // Memory
    add_memory: "Ajouter un souvenir",
    person_name: "Nom de la personne",
    relationship: "Relation",
    photo: "Photo",
    a_small_note: "Une petite note (optionnel)",
    save_memory: "Enregistrer le souvenir",
    remove_memory: "Supprimer ce souvenir ?",

    // Guardian / Rufqa
    rufqa_desc: "Votre profil de compagnon Hajj & Umrah",
    rufqa_active: "Rufqa actif",
    setup_rufqa: "Configurer la Rufqa",
    pilgrim_info: "Informations du pèlerin",
    group_leader: "Chef de groupe",
    leader_name: "Nom du chef",
    leader_phone: "Téléphone du chef",
    hotel_name: "Nom de l'hôtel",
    hotel_address: "Adresse de l'hôtel",
    hotel_phone: "Téléphone de l'hôtel",
    accommodation: "Hébergement",
    medical_emergency: "Urgence médicale",
    medical_notes: "Notes médicales",
    emergency_note: "Note d'urgence",

    // Profile
    full_name: "Nom complet",
    edit_profile: "Modifier le profil",
    save_profile: "Enregistrer le profil",

    // Prayer
    prayer_times: "Horaires de prière",
    prayer_fajr: "Fajr",
    prayer_dhuhr: "Dhuhr",
    prayer_asr: "Asr",
    prayer_maghrib: "Maghrib",
    prayer_isha: "Isha",
  },
}

// ── Context ──────────────────────────────────────────────────────────────────

interface LangContextValue {
  lang: Language
  setLang: (l: Language) => void
  dir: "ltr" | "rtl"
  isRTL: boolean
  t: (key: string) => string
}

const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = "wanis-lang"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "en" || stored === "ar" || stored === "fr") return stored
    const browser = navigator.language.slice(0, 2)
    if (browser === "ar") return "ar"
    if (browser === "fr") return "fr"
    return "en"
  })

  const setLang = (l: Language) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr"

  // Apply dir + lang to <html> so RTL layout propagates automatically
  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [lang, dir])

  const t = (key: string): string =>
    translations[lang][key] ?? translations["en"][key] ?? key

  return (
    <LangContext.Provider value={{ lang, setLang, dir, isRTL: dir === "rtl", t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>")
  return ctx
}
