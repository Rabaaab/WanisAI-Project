import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "en" | "ar" | "fr"

// ── Translation dictionary ───────────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    home: "Home",
    check_in: "Check-in",
    family: "Family",
    medications: "Medications",
    doctor_brief: "Doctor Brief",
    memory: "Memory",
    talk: "Talk",
    rufqa: "Hajj/Umrah Rufqa",
    settings: "Settings",
    duas: "Duas",
    recitation: "Recitation",
    together: "Together",
    together_desc: "Gentle moments of remembering",
    setting_up_together: "Gentle moments of remembering",

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

    // Family Circle
    family_circle: "Family Circle",
    people_who_matter: "The people who matter most.",
    add_member: "Add Member",
    add_family_member: "Add Family Member",
    name: "Name",
    phone_number: "Phone Number",
    emergency_contact: "Emergency Contact",
    emergency_contact_desc: "They can be reached quickly if needed",
    save_member: "Save Member",
    family_circle_empty: "Your family circle is empty",
    add_family_desc: "Add family members so Wanis knows who is important to you.",
    add_first_member: "Add First Member",
    remove_family_member: "Remove this family member?",

    // Prayer
    prayer_times: "Prayer Times",
    prayer_fajr: "Fajr",
    prayer_dhuhr: "Dhuhr",
    prayer_asr: "Asr",
    prayer_maghrib: "Maghrib",
    prayer_isha: "Isha",

    // Together / Audio
    audio_upload_prompt: "Record or upload a voice message, a song, or a story for your loved one.",
    upload_audio_btn: "Upload a voice message or song",
    uploading: "Uploading...",
    familiar_sound: "A familiar sound",
    songs_and_stories: "Songs and stories from your family",
    play_something: "Play something",
    shall_we_listen: "Shall we listen to something familiar?",
    listening_to: "Listening to a familiar sound",
    added_by: "Added by",

    // Family Letter
    letter_from_wanis: "Letter from Wanis",
    generate_letter: "Generate this week's letter",
    letter_loading: "Writing your letter…",
    letter_date: "Generated on",
    family_letter: "Family Letter",

    // Life Story
    their_story: "Their Story",
    story_subtitle: "This story grows with every conversation, check-in, and memory shared.",
    add_a_memory: "Add a memory",
    memory_placeholder: "Write a story, a childhood memory, or a fact about this person…",
    save_entry: "Save",
    no_story_yet: "No story entries yet. They will grow here automatically.",
  },

  ar: {
    // Nav
    home: "الرئيسية",
    check_in: "تسجيل الحال",
    family: "العائلة",
    medications: "الأدوية",
    doctor_brief: "موجز الطبيب",
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
    companion_title: "ونيس هنا",
    companion_subtitle: "رفيقك اليومي",
    hello: "مرحباً",
    im_here: "أنا هنا",
    wanis_status: "ونيس يستمع",
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

    // Family Circle
    family_circle: "دائرة العائلة",
    people_who_matter: "أهم الناس في حياتك.",
    add_member: "إضافة فرد",
    add_family_member: "إضافة فرد من العائلة",
    name: "الاسم",
    phone_number: "رقم الهاتف",
    emergency_contact: "جهة اتصال طوارئ",
    emergency_contact_desc: "يمكن الوصول إليهم بسرعة عند الحاجة",
    save_member: "حفظ الفرد",
    family_circle_empty: "دائرة عائلتك فارغة",
    add_family_desc: "أضف أفراد العائلة حتى يعرف ونيس من هم المهمون في حياتك.",
    add_first_member: "إضافة أول فرد",
    remove_family_member: "هل تريد حذف هذا الفرد؟",

    // Prayer
    prayer_times: "مواقيت الصلاة",
    prayer_fajr: "الفجر",
    prayer_dhuhr: "الظهر",
    prayer_asr: "العصر",
    prayer_maghrib: "المغرب",
    prayer_isha: "العشاء",

    // Together / Audio
    audio_upload_prompt: "سجّل أو ارفع رسالة صوتية أو أغنية أو قصة لمن تحب.",
    upload_audio_btn: "رفع رسالة صوتية أو أغنية",
    uploading: "جاري الرفع...",
    familiar_sound: "صوت مألوف",
    songs_and_stories: "أغاني وقصص من عائلتك",
    play_something: "تشغيل شيء ما",
    shall_we_listen: "هل نستمع إلى شيء مألوف؟",
    listening_to: "الاستماع إلى صوت مألوف",
    added_by: "أضيف بواسطة",

    // Family Letter
    letter_from_wanis: "رسالة من ونيس",
    generate_letter: "إنشاء رسالة هذا الأسبوع",
    letter_loading: "جاري كتابة الرسالة…",
    letter_date: "تم الإنشاء في",
    family_letter: "رسالة العائلة",

    // Life Story
    their_story: "قصتهم",
    story_subtitle: "تنمو هذه القصة مع كل محادثة وتسجيل وذكرى مشتركة.",
    add_a_memory: "أضف ذكرى",
    memory_placeholder: "اكتب قصة أو ذكرى من الطفولة أو معلومة عن هذا الشخص…",
    save_entry: "حفظ",
    no_story_yet: "لا توجد مدخلات بعد. ستنمو هنا تلقائيًا.",
  },

  fr: {
    // Nav
    home: "Accueil",
    check_in: "Bilan",
    family: "Famille",
    medications: "Médicaments",
    doctor_brief: "Bilan médical",
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

    // Family Circle
    family_circle: "Cercle familial",
    people_who_matter: "Les personnes qui comptent le plus.",
    add_member: "Ajouter un membre",
    add_family_member: "Ajouter un membre de la famille",
    name: "Nom",
    phone_number: "Numéro de téléphone",
    emergency_contact: "Contact d'urgence",
    emergency_contact_desc: "Peut être contacté rapidement si nécessaire",
    save_member: "Enregistrer le membre",
    family_circle_empty: "Votre cercle familial est vide",
    add_family_desc: "Ajoutez des membres de la famille pour que Wanis sache qui est important pour vous.",
    add_first_member: "Ajouter le premier membre",
    remove_family_member: "Supprimer ce membre de la famille ?",

    // Prayer
    prayer_times: "Horaires de prière",
    prayer_fajr: "Fajr",
    prayer_dhuhr: "Dhuhr",
    prayer_asr: "Asr",
    prayer_maghrib: "Maghrib",
    prayer_isha: "Isha",

    // Together / Audio
    audio_upload_prompt: "Enregistrez ou téléchargez un message vocal, une chanson ou une histoire pour votre proche.",
    upload_audio_btn: "Télécharger un message vocal ou une chanson",
    uploading: "Téléchargement...",
    familiar_sound: "Un son familier",
    songs_and_stories: "Chansons et histoires de votre famille",
    play_something: "Jouer quelque chose",
    shall_we_listen: "Si on écoutait quelque chose de familier ?",
    listening_to: "Écoute d'un son familier",
    added_by: "Ajouté par",

    // Family Letter
    letter_from_wanis: "Lettre de Wanis",
    generate_letter: "Générer la lettre de cette semaine",
    letter_loading: "Rédaction de la lettre…",
    letter_date: "Généré le",
    family_letter: "Lettre familiale",

    // Life Story
    their_story: "Leur histoire",
    story_subtitle: "Cette histoire grandit avec chaque conversation, bilan et souvenir partagé.",
    add_a_memory: "Ajouter un souvenir",
    memory_placeholder: "Écrivez une histoire, un souvenir d'enfance ou un fait sur cette personne…",
    save_entry: "Enregistrer",
    no_story_yet: "Aucune entrée pour l'instant. Elles apparaîtront automatiquement.",
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
