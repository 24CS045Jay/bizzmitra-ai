export type SupportedLanguage = "en" | "hi" | "gu" | "es" | "fr" | "de" | "ja" | "ar";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction?: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪", direction: "rtl" },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.studio": "Blueprint Studio",
    "nav.artifactMap": "Artifact Map",
    "nav.roadmap": "Execution Roadmap",
    "nav.insights": "Architectural Insights",
    "nav.wireframes": "AI UX & Wireframes",
    "nav.process": "Process & BPMN",
    "nav.collaboration": "Collaboration",
    "nav.export": "Export Center",
    "nav.settings": "Settings & Billing",
    "nav.admin": "Admin Console",
    "nav.upload": "Upload Document",
    "hero.title": "AI Solution Builder",
    "hero.subtitle": "From business challenges to implementation-ready blueprints in minutes.",
    "action.generate": "Generate Blueprint",
    "action.export": "Export Report",
    "action.save": "Save Changes",
    "action.cancel": "Cancel",
    "action.upload": "Upload SOP / BRD",
    "action.upgrade": "Upgrade Plan",
    "credits.balance": "Credits Balance",
    "credits.topup": "Top-up Credits",
    "role.superAdmin": "Super Admin",
    "role.editor": "Editor",
    "role.viewer": "Viewer",
    "lang.select": "Select Language",
    "doc.uploadTitle": "Business Document Ingestion",
    "doc.uploadDesc": "Upload SOPs, BRDs, PDFs, Word documents or PPTs to extract context automatically.",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.studio": "ब्लूप्रिंट स्टूडियो",
    "nav.artifactMap": "आर्टिफ़ैक्ट मैप",
    "nav.roadmap": "क्रियान्वयन रोडमैप",
    "nav.insights": "वास्तुकला अंतर्दृष्टि",
    "nav.wireframes": "AI UX और वायरफ्रेम्स",
    "nav.process": "प्रक्रिया और BPMN",
    "nav.collaboration": "टीम सहयोग",
    "nav.export": "निर्यात केंद्र",
    "nav.settings": "सेटिंग्स और बिलिंग",
    "nav.admin": "व्यवस्थापक कंसोल",
    "nav.upload": "दस्तावेज़ अपलोड करें",
    "hero.title": "AI समाधान निर्माता",
    "hero.subtitle": "व्यावसायिक चुनौतियों से मिनटों में कार्यान्वयन योग्य समाधान तैयार करें।",
    "action.generate": "ब्लूप्रिंट बनाएं",
    "action.export": "रिपोर्ट निर्यात करें",
    "action.save": "परिवर्तन सहेजें",
    "action.cancel": "रद्द करें",
    "action.upload": "SOP / BRD अपलोड करें",
    "action.upgrade": "योजना अपग्रेड करें",
    "credits.balance": "क्रेडिट शेष",
    "credits.topup": "क्रेडिट जोड़ें",
    "role.superAdmin": "सुपर एडमिन",
    "role.editor": "संपादक",
    "role.viewer": "दर्शक",
    "lang.select": "भाषा चुनें",
    "doc.uploadTitle": "व्यावसायिक दस्तावेज़ अंतर्ग्रहण",
    "doc.uploadDesc": "संदर्भ स्वतः निकालने के लिए SOP, BRD, PDF, Word या PPT अपलोड करें।",
  },
  gu: {
    "nav.dashboard": "ડેશબોર્ડ",
    "nav.studio": "બ્લૂપ્રિન્ટ સ્ટુડિયો",
    "nav.artifactMap": "આર્ટિફેક્ટ નકશો",
    "nav.roadmap": "અમલીકરણ રોડમેપ",
    "nav.insights": "આર્કિટેક્ચરલ સમજ",
    "nav.wireframes": "AI UX અને વાયરફ્રેમ્સ",
    "nav.process": "પ્રક્રિયા અને BPMN",
    "nav.collaboration": "ટીમ સહયોગ",
    "nav.export": "નિકાસ કેન્દ્ર",
    "nav.settings": "સેટિંગ્સ અને બિલિંગ",
    "nav.admin": "એડમિન કન્સોલ",
    "nav.upload": "દસ્તાવેજ અપલોડ કરો",
    "hero.title": "AI સોલ્યુશન બિલ્ડર",
    "hero.subtitle": "વ્યાપારી પડકારોમાંથી મિનિટોમાં અમલીકરણ-તૈયાર બ્લુપ્રિન્ટ બનાવો.",
    "action.generate": "બ્લૂપ્રિન્ટ બનાવો",
    "action.export": "અહેવાલ નિકાસ કરો",
    "action.save": "ફેરફારો સાચવો",
    "action.cancel": "રદ કરો",
    "action.upload": "SOP / BRD અપલોડ કરો",
    "action.upgrade": "પ્લાન અપગ્રેડ કરો",
    "credits.balance": "ક્રેડિટ બેલેન્સ",
    "credits.topup": "ક્રેડિટ ઉમેરો",
    "role.superAdmin": "સુપર એડમિન",
    "role.editor": "સંપાદક",
    "role.viewer": "દર્શક",
    "lang.select": "ભાષા પસંદ કરો",
    "doc.uploadTitle": "વ્યવસાયિક દસ્તાવેજ ઇન્જેશન",
    "doc.uploadDesc": "સંદર્ભ આપમેળે કાઢવા માટે SOP, BRD, PDF, Word અથવા PPT અપલોડ કરો.",
  },
  es: {
    "nav.dashboard": "Panel de Control",
    "nav.studio": "Estudio de Planos",
    "nav.artifactMap": "Mapa de Artefactos",
    "nav.roadmap": "Hoja de Ruta",
    "nav.insights": "Perspectivas de Arquitectura",
    "nav.wireframes": "AI UX y Wireframes",
    "nav.process": "Procesos y BPMN",
    "nav.collaboration": "Colaboración",
    "nav.export": "Centro de Exportación",
    "nav.settings": "Ajustes y Facturación",
    "nav.admin": "Consola de Administrador",
    "nav.upload": "Subir Documento",
    "hero.title": "Constructor de Soluciones AI",
    "hero.subtitle": "De desafíos comerciales a planos listos para producción en minutos.",
    "action.generate": "Generar Plano",
    "action.export": "Exportar Informe",
    "action.save": "Guardar Cambios",
    "action.cancel": "Cancelar",
    "action.upload": "Subir SOP / BRD",
    "action.upgrade": "Mejorar Plan",
    "credits.balance": "Saldo de Créditos",
    "credits.topup": "Recargar Créditos",
    "role.superAdmin": "Superadministrador",
    "role.editor": "Editor",
    "role.viewer": "Espectador",
    "lang.select": "Seleccionar Idioma",
    "doc.uploadTitle": "Ingesta de Documentos Comerciales",
    "doc.uploadDesc": "Sube SOP, BRD, PDF, Word o PPT para extraer contexto automáticamente.",
  },
  fr: {
    "nav.dashboard": "Tableau de Bord",
    "nav.studio": "Studio de Conception",
    "nav.artifactMap": "Carte des Artefacts",
    "nav.roadmap": "Feuille de Route",
    "nav.insights": "Aperçus d'Architecture",
    "nav.wireframes": "AI UX & Maquettes",
    "nav.process": "Processus & BPMN",
    "nav.collaboration": "Collaboration",
    "nav.export": "Centre d'Exportation",
    "nav.settings": "Paramètres & Facturation",
    "nav.admin": "Console Admin",
    "nav.upload": "Téléverser Document",
    "hero.title": "Générateur de Solutions IA",
    "hero.subtitle": "Des défis d'entreprise aux architectures prêtes à déployer en quelques minutes.",
    "action.generate": "Générer la Solution",
    "action.export": "Exporter le Rapport",
    "action.save": "Enregistrer",
    "action.cancel": "Annuler",
    "action.upload": "Téléverser SOP / BRD",
    "action.upgrade": "Mettre à Niveau",
    "credits.balance": "Solde de Crédits",
    "credits.topup": "Recharger Crédits",
    "role.superAdmin": "Super Administrateur",
    "role.editor": "Éditeur",
    "role.viewer": "Lecteur",
    "lang.select": "Choisir la Langue",
    "doc.uploadTitle": "Ingestion de Documents d'Entreprise",
    "doc.uploadDesc": "Téléversez vos SOP, BRD, PDF, Word ou PPT pour extraire le contexte.",
  },
  de: {
    "nav.dashboard": "Dashboard",
    "nav.studio": "Lösungs-Studio",
    "nav.artifactMap": "Artefakt-Karte",
    "nav.roadmap": "Umsetzungs-Fahrplan",
    "nav.insights": "Architektur-Einblicke",
    "nav.wireframes": "AI UX & Wireframes",
    "nav.process": "Prozesse & BPMN",
    "nav.collaboration": "Zusammenarbeit",
    "nav.export": "Export-Zentrum",
    "nav.settings": "Einstellungen & Abrechnung",
    "nav.admin": "Admin-Konsole",
    "nav.upload": "Dokument Hochladen",
    "hero.title": "KI-Lösungsarchitekt",
    "hero.subtitle": "Von geschäftlichen Herausforderungen zu fertigen Architekturen in Minuten.",
    "action.generate": "Blueprint Erstellen",
    "action.export": "Bericht Exportieren",
    "action.save": "Speichern",
    "action.cancel": "Abbrechen",
    "action.upload": "SOP / BRD Hochladen",
    "action.upgrade": "Plan Upgraden",
    "credits.balance": "Guthaben",
    "credits.topup": "Guthaben Aufladen",
    "role.superAdmin": "Super-Administrator",
    "role.editor": "Editor",
    "role.viewer": "Betrachter",
    "lang.select": "Sprache Wählen",
    "doc.uploadTitle": "Unternehmensdokument-Analyse",
    "doc.uploadDesc": "Laden Sie SOPs, BRDs, PDFs, Word- oder PPT-Dateien zur automatischen Analyse hoch.",
  },
  ja: {
    "nav.dashboard": "ダッシュボード",
    "nav.studio": "ブループリントスタジオ",
    "nav.artifactMap": "成果物マップ",
    "nav.roadmap": "実行ロードマップ",
    "nav.insights": "アーキテクチャ分析",
    "nav.wireframes": "AI UX ＆ ワイヤーフレーム",
    "nav.process": "プロセス ＆ BPMN",
    "nav.collaboration": "チームコラボレーション",
    "nav.export": "エクスポートセンター",
    "nav.settings": "設定と請求",
    "nav.admin": "管理者コンソール",
    "nav.upload": "ドキュメントをアップロード",
    "hero.title": "AIソリューションビルダー",
    "hero.subtitle": "ビジネスの課題から実装可能な青写真を数分で自動生成します。",
    "action.generate": "ブループリント生成",
    "action.export": "レポート出力",
    "action.save": "保存",
    "action.cancel": "キャンセル",
    "action.upload": "SOP / BRD アップロード",
    "action.upgrade": "プランをアップグレード",
    "credits.balance": "クレジット残高",
    "credits.topup": "クレジットチャージ",
    "role.superAdmin": "特権管理者",
    "role.editor": "編集者",
    "role.viewer": "閲覧者",
    "lang.select": "言語を選択",
    "doc.uploadTitle": "ビジネスドキュメント解析",
    "doc.uploadDesc": "SOP、BRD、PDF、Word、またはPPTをアップロードしてコンテキストを自動抽出します。",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.studio": "استوديو المخططات",
    "nav.artifactMap": "خريطة الأصول",
    "nav.roadmap": "خريطة طريق التنفيذ",
    "nav.insights": "رؤى الهندسة المعمارية",
    "nav.wireframes": "واجهة المستخدم والمخططات",
    "nav.process": "العمليات و BPMN",
    "nav.collaboration": "التعاون الفريقي",
    "nav.export": "مركز التصدير",
    "nav.settings": "الإعدادات والفواتير",
    "nav.admin": "لوحة تحكم المسؤول",
    "nav.upload": "تحميل المستند",
    "hero.title": "منشئ حلول الذكاء الاصطناعي",
    "hero.subtitle": "تحويل التحديات التجارية إلى مخططات جاهزة للتنفيذ في دقائق معدودة.",
    "action.generate": "إنشاء المخطط",
    "action.export": "تصدير التقرير",
    "action.save": "حفظ التغييرات",
    "action.cancel": "إلغاء",
    "action.upload": "تحميل SOP / BRD",
    "action.upgrade": "ترقية الخطة",
    "credits.balance": "رصيد النقاط",
    "credits.topup": "شحن النقاط",
    "role.superAdmin": "المسؤول المتميز",
    "role.editor": "محرر",
    "role.viewer": "مشاهد",
    "lang.select": "اختر اللغة",
    "doc.uploadTitle": "استيعاب المستندات التجارية",
    "doc.uploadDesc": "قم بتحميل ملفات SOP أو BRD أو PDF أو Word أو PPT لاستخراج السياق تلقائيًا.",
  },
};

const STORAGE_KEY = "bizzmitra.language";

export function getCurrentLanguage(): SupportedLanguage {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && TRANSLATIONS[saved]) return saved;
    const browserLang = navigator.language.slice(0, 2) as SupportedLanguage;
    if (TRANSLATIONS[browserLang]) return browserLang;
  }
  return "en";
}

export function setLanguage(lang: SupportedLanguage): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
    const selected = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    if (selected?.direction) {
      document.documentElement.setAttribute("dir", selected.direction);
    } else {
      document.documentElement.setAttribute("dir", "ltr");
    }
    document.documentElement.setAttribute("lang", lang);
    window.dispatchEvent(new CustomEvent("bizzmitra:lang-changed", { detail: lang }));
  }
}

export function t(key: string, fallback?: string): string {
  const lang = getCurrentLanguage();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  return dict[key] || TRANSLATIONS["en"][key] || fallback || key;
}

export function getAiLanguageInstruction(): string {
  const lang = getCurrentLanguage();
  const opt = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  if (!opt || opt.code === "en") return "";
  return `\nIMPORTANT: Please generate all recommendations, explanations, and blueprint descriptions in ${opt.name} (${opt.nativeName}) language.`;
}
