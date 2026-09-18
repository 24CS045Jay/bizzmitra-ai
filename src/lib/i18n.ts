import { useEffect, useState } from "react";

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
    // Navigation Groups
    "group.workspace": "Workspace & Intake",
    "group.intelligence": "Intelligence & Solution",
    "group.systems": "Systems & Design",
    "group.execution": "Execution & Strategy",
    "group.delivery": "Delivery & Governance",
    "group.collaboration": "Collaboration & Artifacts",
    "group.governance": "Governance & Admin",

    // Navigation Items
    "nav.dashboard": "Workspaces",
    "nav.newIntake": "New Intake",
    "nav.discovery": "AI Discovery",
    "nav.solution": "Solution Studio",
    "nav.crm": "HR CRM",
    "nav.architecture": "Architecture",
    "nav.process": "Process & BPMN",
    "nav.wireframes": "UX Designer",
    "nav.data": "Data & APIs",
    "nav.roadmap": "Roadmap",
    "nav.insights": "Transformation Insights",
    "nav.collaboration": "Collaboration",
    "nav.artifactMap": "Artifact Map",
    "nav.export": "Export Center",
    "nav.settings": "Settings & Billing",
    "nav.admin": "Admin Console",

    // Chain Steps
    "chain.intake": "Intake",
    "chain.discovery": "Discovery",
    "chain.solution": "Solution",
    "chain.crm": "HR CRM",
    "chain.architecture": "Architecture",
    "chain.process": "Process",
    "chain.wireframes": "UX",
    "chain.data": "Data & APIs",
    "chain.roadmap": "Roadmap",
    "chain.dashboard": "Insights",
    "chain.map": "Artifact Map",
    "chain.regenerate": "Regenerate",
    "chain.export": "Export",
    "chain.history": "History",

    // Settings & Billing
    "settings.title": "Settings & Monetization",
    "settings.subtitle": "Manage your profile, AI credit balance, subscription plans, and language preferences.",
    "settings.profile": "Profile",
    "settings.profileDesc": "Your personal details and identity.",
    "settings.fullName": "Full name",
    "settings.saveProfile": "Save profile",
    "settings.workspace": "Workspace Name",
    "settings.renameWorkspace": "Rename workspace",
    "settings.wallet": "AI Credit Wallet",
    "settings.balance": "Current Balance",
    "settings.topupTitle": "Top-up Credits",
    "settings.plans": "Subscription Tiers",
    "settings.currentPlan": "Current Plan",
    "settings.upgrade": "Pay & Upgrade",
    "settings.language": "Language & Multilingual Support",
    "settings.languageDesc": "Set your primary language for navigation, blueprints, and AI recommendations.",
    "settings.appearance": "Appearance",
    "settings.exportDefaults": "Export Defaults",
    "settings.razorpay": "Razorpay Payment Gateway",

    // Common Actions
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.upload": "Upload SOP / BRD",
    "action.download": "Download",
    "action.close": "Close",
    "action.back": "Back",
    "action.next": "Next",
  },
  hi: {
    // Navigation Groups
    "group.workspace": "कार्यक्षेत्र और इनटेक",
    "group.intelligence": "इंटेलिजेंस और समाधान",
    "group.systems": "सिस्टम और डिज़ाइन",
    "group.execution": "क्रियान्वयन और रणनीति",
    "group.delivery": "वितरण और शासन",
    "group.collaboration": "सहयोग और कलाकृतियां",
    "group.governance": "प्रशासन और नियंत्रण",

    // Navigation Items
    "nav.dashboard": "कार्यक्षेत्र (प्रोजेक्ट्स)",
    "nav.newIntake": "नया इनटेक",
    "nav.discovery": "AI खोज और विश्लेषण",
    "nav.solution": "समाधान स्टूडियो",
    "nav.crm": "एचआर सीआरएम",
    "nav.architecture": "सिस्टम वास्तुकला",
    "nav.process": "प्रक्रिया और BPMN",
    "nav.wireframes": "UX डिज़ाइनर",
    "nav.data": "डेटा और API",
    "nav.roadmap": "क्रियान्वयन रोडमैप",
    "nav.insights": "परिवर्तन अंतर्दृष्टि",
    "nav.collaboration": "टीम सहयोग",
    "nav.artifactMap": "आर्टिफ़ैक्ट मैप",
    "nav.export": "निर्यात केंद्र",
    "nav.settings": "सेटिंग्स और बिलिंग",
    "nav.admin": "व्यवस्थापक कंसोल",

    // Chain Steps
    "chain.intake": "इनटेक",
    "chain.discovery": "खोज",
    "chain.solution": "समाधान",
    "chain.crm": "सीआरएम",
    "chain.architecture": "वास्तुकला",
    "chain.process": "प्रक्रिया",
    "chain.wireframes": "UX",
    "chain.data": "डेटा/API",
    "chain.roadmap": "रोडमैप",
    "chain.dashboard": "अंतर्दृष्टि",
    "chain.map": "नक्शा",
    "chain.regenerate": "पुनर्निर्मित करें",
    "chain.export": "निर्यात करें",
    "chain.history": "इतिहास",

    // Settings & Billing
    "settings.title": "सेटिंग्स और मुद्रीकरण",
    "settings.subtitle": "अपनी प्रोफ़ाइल, AI क्रेडिट बैलेंस, सब्सक्रिप्शन प्लान और भाषा प्राथमिकताएं प्रबंधित करें।",
    "settings.profile": "उपयोगकर्ता प्रोफ़ाइल",
    "settings.profileDesc": "आपका व्यक्तिगत विवरण और पहचान।",
    "settings.fullName": "पूरा नाम",
    "settings.saveProfile": "प्रोफ़ाइल सहेजें",
    "settings.workspace": "कार्यक्षेत्र का नाम",
    "settings.renameWorkspace": "नाम बदलें",
    "settings.wallet": "AI क्रेडिट वॉलेट",
    "settings.balance": "वर्तमान शेष",
    "settings.topupTitle": "क्रेडिट जोड़ें (टॉप-अप)",
    "settings.plans": "सदस्यता योजनाएं",
    "settings.currentPlan": "वर्तमान योजना",
    "settings.upgrade": "भुगतान करें और अपग्रेड करें",
    "settings.language": "भाषा और बहुभाषी समर्थन",
    "settings.languageDesc": "नेविगेशन, ब्लूप्रिंट और AI अनुशंसाओं के लिए अपनी प्राथमिक भाषा चुनें।",
    "settings.appearance": "दिखावट (थीम)",
    "settings.exportDefaults": "निर्यात डिफ़ॉल्ट",
    "settings.razorpay": "रेज़रपे भुगतान गेटवे (Razorpay INR)",

    // Common Actions
    "action.save": "सहेजें",
    "action.cancel": "रद्द करें",
    "action.upload": "SOP / BRD अपलोड करें",
    "action.download": "डाउनलोड करें",
    "action.close": "बंद करें",
    "action.back": "पीछे जाएं",
    "action.next": "आगे बढ़ें",
  },
  gu: {
    // Navigation Groups
    "group.workspace": "કાર્યસ્થળ અને ઇન્ટેક",
    "group.intelligence": "ઇન્ટેલિજન્સ અને સોલ્યુશન",
    "group.systems": "સિસ્ટમ્સ અને ડિઝાઇન",
    "group.execution": "અમલીકરણ અને વ્યૂહરચના",
    "group.delivery": "ડિલિવરી અને ગવર્નન્સ",
    "group.collaboration": "સહયોગ અને દસ્તાવેજો",
    "group.governance": "ગવર્નન્સ અને એડમિન",

    // Navigation Items
    "nav.dashboard": "પ્રોજેક્ટ્સ (વર્કસ્પેસ)",
    "nav.newIntake": "નવો ઇન્ટેક",
    "nav.discovery": "AI ડિસ્કવરી",
    "nav.solution": "સોલ્યુશન સ્ટુડિયો",
    "nav.crm": "HR CRM",
    "nav.architecture": "સિસ્ટમ આર્કિટેક્ચર",
    "nav.process": "પ્રક્રિયા અને BPMN",
    "nav.wireframes": "UX ડિઝાઇનર",
    "nav.data": "ડેટા અને API",
    "nav.roadmap": "રોડમેપ",
    "nav.insights": "આર્કિટેક્ચરલ સમજ",
    "nav.collaboration": "ટીમ સહયોગ",
    "nav.artifactMap": "આર્ટિફેક્ટ નકશો",
    "nav.export": "નિકાસ કેન્દ્ર",
    "nav.settings": "સેટિંગ્સ અને બિલિંગ",
    "nav.admin": "એડમિન કન્સોલ",

    // Chain Steps
    "chain.intake": "ઇન્ટેક",
    "chain.discovery": "ડિસ્કવરી",
    "chain.solution": "સોલ્યુશન",
    "chain.crm": "CRM",
    "chain.architecture": "આર્કિટેક્ચર",
    "chain.process": "પ્રક્રિયા",
    "chain.wireframes": "UX",
    "chain.data": "ડેટા/API",
    "chain.roadmap": "રોડમેપ",
    "chain.dashboard": "સમજ",
    "chain.map": "નકશો",
    "chain.regenerate": "ફરીથી બનાવો",
    "chain.export": "નિકાસ કરો",
    "chain.history": "ઇતિહાસ",

    // Settings & Billing
    "settings.title": "સેટિંગ્સ અને બિલિંગ",
    "settings.subtitle": "તમારી પ્રોફાઇલ, AI ક્રેડિટ બેલેન્સ, સબ્સ્ક્રિપ્શન પ્લાન અને ભાષા પસંદગીઓનું સંચાલન કરો.",
    "settings.profile": "પ્રોફાઇલ",
    "settings.profileDesc": "તમારી વ્યક્તિગત વિગતો અને ઓળખ.",
    "settings.fullName": "પૂરું નામ",
    "settings.saveProfile": "પ્રોફાઇલ સાચવો",
    "settings.workspace": "વર્કસ્પેસ નામ",
    "settings.renameWorkspace": "નામ બદલો",
    "settings.wallet": "AI ક્રેડિટ વૉલેટ",
    "settings.balance": "કુલ ક્રેડિટ બેલેન્સ",
    "settings.topupTitle": "ક્રેડિટ ઉમેરો",
    "settings.plans": "સબ્સ્ક્રિપ્શન પ્લાન્સ",
    "settings.currentPlan": "હાલનો પ્લાન",
    "settings.upgrade": "ચૂકવો અને અપગ્રેડ કરો",
    "settings.language": "ભાષા અને બહુભાષી સપોર્ટ",
    "settings.languageDesc": "નેવિગેશન, બ્લૂપ્રિન્ટ અને AI ભલામણો માટે તમારી પ્રાથમિક ભાષા સેટ કરો.",
    "settings.appearance": "થીમ અને દેખાવ",
    "settings.exportDefaults": "નિકાસ ડિફૉલ્ટ",
    "settings.razorpay": "રેઝરપે પેમેન્ટ ગેટવે (Razorpay INR)",

    // Common Actions
    "action.save": "સાચવો",
    "action.cancel": "રદ કરો",
    "action.upload": "SOP / BRD અપલોડ કરો",
    "action.download": "ડાઉનલોડ કરો",
    "action.close": "બંધ કરો",
    "action.back": "પાછળ",
    "action.next": "આગળ",
  },
  es: {
    "group.workspace": "Espacio y Admisión",
    "group.intelligence": "Inteligencia y Solución",
    "group.systems": "Sistemas y Diseño",
    "group.execution": "Ejecución y Estrategia",
    "group.delivery": "Entrega y Gobernanza",
    "group.collaboration": "Colaboración",
    "group.governance": "Gobernanza y Admin",
    "nav.dashboard": "Espacios de Trabajo",
    "nav.newIntake": "Nueva Admisión",
    "nav.discovery": "Descubrimiento IA",
    "nav.solution": "Estudio de Soluciones",
    "nav.crm": "CRM de RRHH",
    "nav.architecture": "Arquitectura",
    "nav.process": "Procesos y BPMN",
    "nav.wireframes": "Diseñador UX",
    "nav.data": "Datos y API",
    "nav.roadmap": "Hoja de Ruta",
    "nav.insights": "Perspectivas",
    "nav.collaboration": "Colaboración",
    "nav.artifactMap": "Mapa de Artefactos",
    "nav.export": "Centro de Exportación",
    "nav.settings": "Ajustes y Facturación",
    "nav.admin": "Consola Admin",
    "chain.intake": "Admisión",
    "chain.discovery": "Descubrimiento",
    "chain.solution": "Solución",
    "chain.crm": "CRM",
    "chain.architecture": "Arquitectura",
    "chain.process": "Procesos",
    "chain.wireframes": "UX",
    "chain.data": "Datos",
    "chain.roadmap": "Hoja de Ruta",
    "chain.dashboard": "Perspectivas",
    "chain.map": "Mapa",
    "chain.regenerate": "Regenerar",
    "chain.export": "Exportar",
    "chain.history": "Historial",
    "settings.title": "Ajustes y Monetización",
    "settings.subtitle": "Gestiona tu perfil, saldo de créditos IA y planes de suscripción.",
    "settings.profile": "Perfil",
    "settings.profileDesc": "Tus datos personales e identidad.",
    "settings.fullName": "Nombre completo",
    "settings.saveProfile": "Guardar perfil",
    "settings.workspace": "Nombre del espacio",
    "settings.renameWorkspace": "Renombrar",
    "settings.wallet": "Billetera de Créditos IA",
    "settings.balance": "Saldo actual",
    "settings.topupTitle": "Recargar Créditos",
    "settings.plans": "Planes de Suscripción",
    "settings.currentPlan": "Plan Actual",
    "settings.upgrade": "Pagar y Mejorar",
    "settings.language": "Idioma y Localización",
    "settings.languageDesc": "Configura el idioma principal para navegación y planos IA.",
    "settings.appearance": "Apariencia",
    "settings.exportDefaults": "Valores por defecto",
    "settings.razorpay": "Pasarela de Pago Razorpay",
    "action.save": "Guardar",
    "action.cancel": "Cancelar",
    "action.upload": "Subir SOP / BRD",
    "action.download": "Descargar",
    "action.close": "Cerrar",
    "action.back": "Atrás",
    "action.next": "Siguiente",
  },
  fr: {
    "group.workspace": "Espace & Ingestion",
    "group.intelligence": "Intelligence & Solution",
    "group.systems": "Systèmes & Conception",
    "group.execution": "Exécution & Stratégie",
    "group.delivery": "Livraison & Gouvernance",
    "group.collaboration": "Collaboration",
    "group.governance": "Gouvernance & Admin",
    "nav.dashboard": "Espaces de Travail",
    "nav.newIntake": "Nouveau Projet",
    "nav.discovery": "Découverte IA",
    "nav.solution": "Studio Solution",
    "nav.crm": "CRM RH",
    "nav.architecture": "Architecture",
    "nav.process": "Processus & BPMN",
    "nav.wireframes": "Concepteur UX",
    "nav.data": "Données & APIs",
    "nav.roadmap": "Feuille de Route",
    "nav.insights": "Aperçus Transformation",
    "nav.collaboration": "Collaboration",
    "nav.artifactMap": "Carte des Artefacts",
    "nav.export": "Centre d'Exportation",
    "nav.settings": "Paramètres & Facturation",
    "nav.admin": "Console Admin",
    "chain.intake": "Ingestion",
    "chain.discovery": "Découverte",
    "chain.solution": "Solution",
    "chain.crm": "CRM",
    "chain.architecture": "Architecture",
    "chain.process": "Processus",
    "chain.wireframes": "UX",
    "chain.data": "Données",
    "chain.roadmap": "Feuille de Route",
    "chain.dashboard": "Aperçus",
    "chain.map": "Carte",
    "chain.regenerate": "Régénérer",
    "chain.export": "Exporter",
    "chain.history": "Historique",
    "settings.title": "Paramètres & Facturation",
    "settings.subtitle": "Gérez votre profil, crédits IA et abonnements.",
    "settings.profile": "Profil",
    "settings.profileDesc": "Vos informations personnelles.",
    "settings.fullName": "Nom complet",
    "settings.saveProfile": "Enregistrer le profil",
    "settings.workspace": "Nom de l'espace",
    "settings.renameWorkspace": "Renommer",
    "settings.wallet": "Portefeuille de Crédits IA",
    "settings.balance": "Solde actuel",
    "settings.topupTitle": "Recharger Crédits",
    "settings.plans": "Plans d'Abonnement",
    "settings.currentPlan": "Plan Actuel",
    "settings.upgrade": "Payer & Mettre à Niveau",
    "settings.language": "Langue & Régionalisation",
    "settings.languageDesc": "Définissez votre langue pour la navigation et les recommandations IA.",
    "settings.appearance": "Apparence",
    "settings.exportDefaults": "Options d'Export",
    "settings.razorpay": "Passerelle Razorpay",
    "action.save": "Enregistrer",
    "action.cancel": "Annuler",
    "action.upload": "Téléverser SOP / BRD",
    "action.download": "Télécharger",
    "action.close": "Fermer",
    "action.back": "Retour",
    "action.next": "Suivant",
  },
  de: {
    "group.workspace": "Arbeitsbereich & Aufnahme",
    "group.intelligence": "Intelligenz & Lösung",
    "group.systems": "Systeme & Design",
    "group.execution": "Ausführung & Strategie",
    "group.delivery": "Bereitstellung & Governance",
    "group.collaboration": "Zusammenarbeit",
    "group.governance": "Governance & Admin",
    "nav.dashboard": "Arbeitsbereiche",
    "nav.newIntake": "Neue Aufnahme",
    "nav.discovery": "KI-Analyse",
    "nav.solution": "Lösungs-Studio",
    "nav.crm": "Personal-CRM",
    "nav.architecture": "Architektur",
    "nav.process": "Prozesse & BPMN",
    "nav.wireframes": "UX-Designer",
    "nav.data": "Daten & APIs",
    "nav.roadmap": "Fahrplan",
    "nav.insights": "Einblicke",
    "nav.collaboration": "Zusammenarbeit",
    "nav.artifactMap": "Artefakt-Karte",
    "nav.export": "Export-Zentrum",
    "nav.settings": "Einstellungen & Abrechnung",
    "nav.admin": "Admin-Konsole",
    "chain.intake": "Aufnahme",
    "chain.discovery": "Analyse",
    "chain.solution": "Lösung",
    "chain.crm": "CRM",
    "chain.architecture": "Architektur",
    "chain.process": "Prozess",
    "chain.wireframes": "UX",
    "chain.data": "Daten",
    "chain.roadmap": "Fahrplan",
    "chain.dashboard": "Einblicke",
    "chain.map": "Karte",
    "chain.regenerate": "Neu generieren",
    "chain.export": "Exportieren",
    "chain.history": "Verlauf",
    "settings.title": "Einstellungen & Abrechnung",
    "settings.subtitle": "Verwalten Sie Ihr Profil, KI-Guthaben und Pläne.",
    "settings.profile": "Profil",
    "settings.profileDesc": "Ihre persönlichen Daten.",
    "settings.fullName": "Vollständiger Name",
    "settings.saveProfile": "Profil speichern",
    "settings.workspace": "Name des Arbeitsbereichs",
    "settings.renameWorkspace": "Umbenennen",
    "settings.wallet": "KI-Guthaben-Konto",
    "settings.balance": "Aktuelles Guthaben",
    "settings.topupTitle": "Guthaben aufladen",
    "settings.plans": "Abonnements",
    "settings.currentPlan": "Aktueller Plan",
    "settings.upgrade": "Bezahlen & Upgraden",
    "settings.language": "Sprache & Lokalisierung",
    "settings.languageDesc": "Legen Sie Ihre bevorzugte Sprache für die Benutzeroberfläche fest.",
    "settings.appearance": "Erscheinungsbild",
    "settings.exportDefaults": "Export-Standards",
    "settings.razorpay": "Razorpay Zahlungs-Gateway",
    "action.save": "Speichern",
    "action.cancel": "Abbrechen",
    "action.upload": "SOP / BRD hochladen",
    "action.download": "Herunterladen",
    "action.close": "Schließen",
    "action.back": "Zurück",
    "action.next": "Weiter",
  },
  ja: {
    "group.workspace": "ワークスペース ＆ 受付",
    "group.intelligence": "インテリジェンス ＆ ソリューション",
    "group.systems": "システム ＆ 設計",
    "group.execution": "実行 ＆ 戦略",
    "group.delivery": "デリバリーとガバナンス",
    "group.collaboration": "共同作業 ＆ 成果物",
    "group.governance": "ガバナンス ＆ 管理",
    "nav.dashboard": "ワークスペース一覧",
    "nav.newIntake": "新規課題インテーク",
    "nav.discovery": "AI要件ディスカバリー",
    "nav.solution": "ソリューションスタジオ",
    "nav.crm": "HR CRM",
    "nav.architecture": "システムアーキテクチャ",
    "nav.process": "プロセス ＆ BPMN",
    "nav.wireframes": "UXデザイナー",
    "nav.data": "データ ＆ API",
    "nav.roadmap": "実装ロードマップ",
    "nav.insights": "変革インサイト",
    "nav.collaboration": "チームコラボレーション",
    "nav.artifactMap": "成果物マップ",
    "nav.export": "エクスポートセンター",
    "nav.settings": "設定と請求",
    "nav.admin": "管理者コンソール",
    "chain.intake": "インテーク",
    "chain.discovery": "要件分析",
    "chain.solution": "ソリューション",
    "chain.crm": "CRM",
    "chain.architecture": "アーキテクチャ",
    "chain.process": "プロセス",
    "chain.wireframes": "UX",
    "chain.data": "データ/API",
    "chain.roadmap": "ロードマップ",
    "chain.dashboard": "インサイト",
    "chain.map": "マップ",
    "chain.regenerate": "再生成",
    "chain.export": "出力",
    "chain.history": "履歴",
    "settings.title": "設定 ＆ 課金管理",
    "settings.subtitle": "プロフィール、AIクレジット残高、プランを管理します。",
    "settings.profile": "プロフィール",
    "settings.profileDesc": "ユーザーの個人情報および認証情報。",
    "settings.fullName": "氏名",
    "settings.saveProfile": "プロフィール保存",
    "settings.workspace": "ワークスペース名",
    "settings.renameWorkspace": "名前を変更",
    "settings.wallet": "AIクレジットウォレット",
    "settings.balance": "現在の残高",
    "settings.topupTitle": "クレジットチャージ",
    "settings.plans": "サブスクリプションプラン",
    "settings.currentPlan": "現在のプラン",
    "settings.upgrade": "支払い ＆ アップグレード",
    "settings.language": "言語設定 ＆ 多言語対応",
    "settings.languageDesc": "ナビゲーションとAIレコメンデーションの基本言語を設定します。",
    "settings.appearance": "テーマ設定",
    "settings.exportDefaults": "出力デフォルト",
    "settings.razorpay": "Razorpay決済ゲートウェイ",
    "action.save": "保存",
    "action.cancel": "キャンセル",
    "action.upload": "SOP / BRD アップロード",
    "action.download": "ダウンロード",
    "action.close": "閉じる",
    "action.back": "戻る",
    "action.next": "次へ",
  },
  ar: {
    "group.workspace": "مساحة العمل والإدخال",
    "group.intelligence": "الذكاء والحلول",
    "group.systems": "الأنظمة والتصميم",
    "group.execution": "التنفيذ والاستراتيجية",
    "group.delivery": "التسليم والحوكمة",
    "group.collaboration": "التعاون والأصول",
    "group.governance": "الحوكمة والإدارة",
    "nav.dashboard": "مساحات العمل",
    "nav.newIntake": "إدخال جديد",
    "nav.discovery": "اكتشاف الذكاء الاصطناعي",
    "nav.solution": "استوديو الحلول",
    "nav.crm": "نظام إدارة الموارد البشرية",
    "nav.architecture": "الهندسة المعمارية",
    "nav.process": "العمليات و BPMN",
    "nav.wireframes": "مصمم واجهة المستخدم",
    "nav.data": "البيانات وواجهات البرمجة",
    "nav.roadmap": "خريطة الطريق",
    "nav.insights": "رؤى التحول",
    "nav.collaboration": "التعاون",
    "nav.artifactMap": "خريطة الأصول",
    "nav.export": "مركز التصدير",
    "nav.settings": "الإعدادات والفواتير",
    "nav.admin": "لوحة تحكم المسؤول",
    "chain.intake": "الإدخال",
    "chain.discovery": "الاكتشاف",
    "chain.solution": "الحل",
    "chain.crm": "CRM",
    "chain.architecture": "الهيكل",
    "chain.process": "العمليات",
    "chain.wireframes": "الواجهة",
    "chain.data": "البيانات",
    "chain.roadmap": "خريطة الطريق",
    "chain.dashboard": "الرؤى",
    "chain.map": "الخريطة",
    "chain.regenerate": "إعادة التوليد",
    "chain.export": "تصدير",
    "chain.history": "السجل",
    "settings.title": "الإعدادات والاشتراكات",
    "settings.subtitle": "إدارة ملفك الشخصي ورصيد نقاط الذكاء الاصطناعي وخطط الاشتراك.",
    "settings.profile": "الملف الشخصي",
    "settings.profileDesc": "تفاصيلك الشخصية وهويتك.",
    "settings.fullName": "الاسم الكامل",
    "settings.saveProfile": "حفظ الملف الشخصي",
    "settings.workspace": "اسم مساحة العمل",
    "settings.renameWorkspace": "إعادة التسمية",
    "settings.wallet": "محفظة نقاط الذكاء الاصطناعي",
    "settings.balance": "الرصيد الحالي",
    "settings.topupTitle": "شحن النقاط",
    "settings.plans": "خطط الاشتراك",
    "settings.currentPlan": "الخطة الحالية",
    "settings.upgrade": "الدفع والترقية",
    "settings.language": "اللغة والدعم متعدد اللغات",
    "settings.languageDesc": "حدد لغتك المفضلة للتنقل وتوصيات الذكاء الاصطناعي.",
    "settings.appearance": "المظهر والسمات",
    "settings.exportDefaults": "إعدادات التصدير الافتراضية",
    "settings.razorpay": "بوابة الدفع Razorpay",
    "action.save": "حفظ",
    "action.cancel": "إلغاء",
    "action.upload": "تحميل SOP / BRD",
    "action.download": "تحميل",
    "action.close": "إغلاق",
    "action.back": "رجوع",
    "action.next": "التالي",
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

export function triggerGoogleTranslate(lang: SupportedLanguage): void {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const isEn = lang === "en";
  const cookieVal = isEn ? "" : `/en/${lang}`;
  const expires = isEn
    ? "expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    : "expires=Fri, 31 Dec 2030 23:59:59 GMT;";

  // Set cookie on both current domain and with dot prefix
  document.cookie = `googtrans=${cookieVal}; path=/; ${expires}`;
  document.cookie = `googtrans=${cookieVal}; domain=.${host}; path=/; ${expires}`;
  document.cookie = `googtrans=${cookieVal}; domain=${host}; path=/; ${expires}`;

  const applyCombo = (): boolean => {
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      if (combo.value !== lang) {
        combo.value = lang;
        combo.dispatchEvent(new Event("change"));
      }
      return true;
    }
    return false;
  };

  if (!applyCombo()) {
    let tries = 0;
    const interval = setInterval(() => {
      tries++;
      if (applyCombo() || tries > 25) {
        clearInterval(interval);
      }
    }, 200);
  }
}

export function setLanguage(lang: SupportedLanguage): void {
  if (typeof window !== "undefined") {
    const previous = window.localStorage.getItem(STORAGE_KEY);
    window.localStorage.setItem(STORAGE_KEY, lang);
    const selected = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    if (selected?.direction) {
      document.documentElement.setAttribute("dir", selected.direction);
    } else {
      document.documentElement.setAttribute("dir", "ltr");
    }
    document.documentElement.setAttribute("lang", lang);

    // Trigger universal whole-page translation
    triggerGoogleTranslate(lang);

    // If reverting from a foreign language back to English, reload if necessary to restore pure English DOM
    if (lang === "en" && previous && previous !== "en") {
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    window.dispatchEvent(new CustomEvent("bizzmitra:lang-changed", { detail: lang }));
  }
}

export function t(key: string, fallback?: string): string {
  const lang = getCurrentLanguage();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  return dict[key] || TRANSLATIONS["en"][key] || fallback || key;
}

/**
 * React hook to access reactive translations and current language.
 */
export function useTranslation() {
  const [lang, setLangState] = useState<SupportedLanguage>(getCurrentLanguage());

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SupportedLanguage>;
      if (custom.detail) setLangState(custom.detail);
    };
    window.addEventListener("bizzmitra:lang-changed", handler);
    return () => window.removeEventListener("bizzmitra:lang-changed", handler);
  }, []);

  const translate = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS["en"];
    return dict[key] || TRANSLATIONS["en"][key] || fallback || key;
  };

  return {
    lang,
    setLanguage,
    t: translate,
  };
}

export function getAiLanguageInstruction(): string {
  const lang = getCurrentLanguage();
  const opt = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  if (!opt || opt.code === "en") return "";
  return `\nIMPORTANT: Please generate all recommendations, explanations, and blueprint descriptions in ${opt.name} (${opt.nativeName}) language.`;
}
