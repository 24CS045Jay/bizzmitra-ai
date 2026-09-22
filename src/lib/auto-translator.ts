import { SupportedLanguage, getCurrentLanguage } from "./i18n";

/**
 * Universal In-App Phrase Dictionary mapping English text to 7 other languages.
 */
export const PHRASE_DICTIONARY: Record<
  Exclude<SupportedLanguage, "en">,
  Record<string, string>
> = {
  hi: {
    // Auth & Account
    "Welcome back": "वापसी पर स्वागत है",
    "Pick up your workspace where you left it.": "अपने कार्यक्षेत्र को वहीं से शुरू करें जहाँ आपने छोड़ा था।",
    "Continue with Google": "Google के साथ जारी रखें",
    "or": "या",
    "Email": "ईमेल",
    "Password": "पासवर्ड",
    "Sign in": "साइन इन करें",
    "Signing in…": "साइन इन हो रहा है…",
    "Signing in...": "साइन इन हो रहा है…",
    "Forgot password?": "पासवर्ड भूल गए?",
    "New here?": "यहाँ नए हैं?",
    "Create an account": "खाता बनाएं",
    "Start your first blueprint": "अपना पहला ब्लूप्रिंट शुरू करें",
    "One workspace, free forever. No card needed.": "एक कार्यक्षेत्र, हमेशा के लिए मुफ़्त। किसी कार्ड की आवश्यकता नहीं।",
    "Full name": "पूरा नाम",
    "At least 6 characters": "कम से कम 6 अक्षर",
    "Create account": "खाता बनाएं",
    "Creating account…": "खाता बन रहा है…",
    "Already have an account?": "क्या आपके पास पहले से एक खाता मौजूद है?",
    "Sign up": "साइन अप करें",
    "Log in": "लॉग इन करें",
    "Sign out": "साइन आउट",
    "Go home": "होम पेज पर जाएं",
    "Page not found": "पेज नहीं मिला",

    // Landing Page
    "From business problem to blueprint": "व्यावसायिक समस्या से क्रियान्वयन ब्लूप्रिंट तक",
    "Describe a business problem": "किसी व्यावसायिक समस्या का वर्णन करें",
    "Modules": "मॉड्यूल",
    "Why one workspace": "एक ही कार्यक्षेत्र क्यों",
    "Pricing": "मूल्य निर्धारण",
    "Go to workspace": "कार्यक्षेत्र पर जाएं",
    "Start Building Free": "मुफ़्त निर्माण शुरू करें",
    "Watch Demo": "डेमो देखें",
    "Executive Operations Hub": "कार्यकारी संचालन केंद्र",
    "Interactive Talent Pipeline": "इंटरैक्टिव प्रतिभा पाइपलाइन",
    "Enterprise Governance": "उद्यम शासन और नियंत्रण",

    // Dashboard & Cockpit
    "Workspaces": "कार्यक्षेत्र (प्रोजेक्ट्स)",
    "Active Projects": "सक्रिय परियोजनाएं",
    "Saved Artifacts": "सहेजे गए आर्टिफ़ैक्ट्स",
    "Live Command Center": "लाइव कमांड सेंटर",
    "Active Blueprint": "सक्रिय ब्लूप्रिंट",
    "Transformation Cockpit": "परिवर्तन कॉकपिट",
    "Real-time portfolio overview of blueprint completeness, active risk exposure, and immediate execution milestones.": "ब्लूप्रिंट पूर्णता, सक्रिय जोखिम और तत्काल मील के पत्थरों का वास्तविक समय अवलोकन।",
    "Ask Copilot": "को-पायलट से पूछें",
    "View Full Roadmap": "पूर्ण रोडमैप देखें",
    "Blueprint Completion": "ब्लूप्रिंट पूर्णता",
    "In Progress": "प्रगति पर है",
    "Audit Ready": "ऑडिट के लिए तैयार",
    "Maturity Score": "परिपक्वता स्कोर",
    "Recent Workspaces": "हाल के कार्यक्षेत्र",
    "Search projects...": "परियोजनाएं खोजें...",
    "Create New Workspace": "नया कार्यक्षेत्र बनाएं",
    "Loading workspace...": "कार्यक्षेत्र लोड हो रहा है...",
    "All projects & blueprints": "सभी प्रोजेक्ट और ब्लूप्रिंट",

    // Workspace & Navigation
    "Workspace & Intake": "कार्यक्षेत्र और इनटेक",
    "Intelligence & Solution": "इंटेलिजेंस और समाधान",
    "Systems & Design": "सिस्टम और डिज़ाइन",
    "Execution & Strategy": "क्रियान्वयन और रणनीति",
    "Delivery & Governance": "वितरण और शासन",
    "Collaboration & Artifacts": "सहयोग और कलाकृतियां",
    "Governance & Admin": "प्रशासन और नियंत्रण",
    "New Intake": "नया इनटेक",
    "AI Discovery": "AI खोज और विश्लेषण",
    "Solution Studio": "समाधान स्टूडियो",
    "HR CRM": "एचआर सीआरएम",
    "Architecture": "सिस्टम वास्तुकला",
    "Process": "प्रक्रिया",
    "Process & BPMN": "प्रक्रिया और BPMN",
    "UX Designer": "UX डिज़ाइनर",
    "Data & APIs": "डेटा और API",
    "Roadmap & ROI": "क्रियान्वयन रोडमैप",
    "Roadmap": "रोडमैप",
    "Transformation Insights": "परिवर्तन अंतर्दृष्टि",
    "Artifact Map": "आर्टिफ़ैक्ट मैप",
    "Governance & Review": "शासन और समीक्षा",
    "Export Center": "निर्यात केंद्र",
    "Admin Console": "व्यवस्थापक कंसोल",
    "Settings & Billing": "सेटिंग्स और बिलिंग",
    "Settings & Monetization": "सेटिंग्स और मुद्रीकरण",
    "Active Workspace": "सक्रिय कार्यक्षेत्र",
    "Intake": "इनटेक",
    "Discovery": "खोज",
    "Solution": "समाधान",
    "CRM": "सीआरएम",
    "Regenerate": "पुनर्निर्मित करें",
    "Export": "निर्यात करें",
    "History": "इतिहास",

    // Common Actions & Settings
    "Save": "सहेजें",
    "Cancel": "रद्द करें",
    "Upload SOP / BRD": "SOP / BRD अपलोड करें",
    "Upload": "अपलोड करें",
    "Download": "डाउनलोड करें",
    "Close": "बंद करें",
    "Back": "पीछे जाएं",
    "Next": "आगे बढ़ें",
    "Submit": "जमा करें",
    "Delete": "हटाएं",
    "Edit": "संपादित करें",
    "Rename": "नाम बदलें",
    "Filter": "फ़िल्टर करें",
    "Search": "खोजें",
    "Status": "स्थिति",
    "Actions": "कार्रवाई",
    "Role": "भूमिका",
    "AI Credit Wallet": "AI क्रेडिट वॉलेट",
    "Current Balance": "वर्तमान शेष",
    "Subscription Tiers": "सदस्यता योजनाएं",
    "Current Plan": "वर्तमान योजना",
    "Pay & Upgrade": "भुगतान करें और अपग्रेड करें",
    "Appearance & Theme": "दिखावट (थीम)",
    "Language & Multilingual Support": "भाषा और बहुभाषी समर्थन",
    "Export Defaults": "निर्यात डिफ़ॉल्ट",
    "Razorpay Payment Gateway": "रेज़रपे भुगतान गेटवे",
    "Single workspace": "एकल कार्यक्षेत्र",
    "Unlimited workspaces": "असीमित कार्यक्षेत्र",
    "Free Starter": "मुफ़्त स्टार्टर",
    "Growth Pro": "ग्रोथ प्रो",
    "Enterprise Scale": "एंटरप्राइज स्केल",
    "Top-up Credits": "क्रेडिट जोड़ें",
    "Profile": "प्रोफ़ाइल",
  },

  gu: {
    // Auth & Account
    "Welcome back": "ફરી સ્વાગત છે",
    "Pick up your workspace where you left it.": "તમારું કાર્યસ્થળ જ્યાંથી છોડ્યું હતું ત્યાંથી શરૂ કરો.",
    "Continue with Google": "Google સાથે ચાલુ રાખો",
    "or": "અથવા",
    "Email": "ઇમેઇલ",
    "Password": "પાસવર્ડ",
    "Sign in": "સાઇન ઇન કરો",
    "Signing in…": "સાઇન ઇન થઈ રહ્યું છે…",
    "Signing in...": "સાઇન ઇન થઈ રહ્યું છે…",
    "Forgot password?": "પાસવર્ડ ભૂલી ગયા છો?",
    "New here?": "અહીં નવા છો?",
    "Create an account": "ખાતું બનાવો",
    "Start your first blueprint": "તમારું પ્રથમ બ્લૂપ્રિન્ટ શરૂ કરો",
    "One workspace, free forever. No card needed.": "એક કાર્યસ્થળ, હંમેશા માટે મફત. કાર્ડની જરૂર નથી.",
    "Full name": "પૂરું નામ",
    "At least 6 characters": "ઓછામાં ઓછા 6 અક્ષરો",
    "Create account": "ખાતું બનાવો",
    "Creating account…": "ખાતું બની રહ્યું છે…",
    "Already have an account?": "પહેલેથી ખાતું છે?",
    "Sign up": "સાઇન અપ કરો",
    "Log in": "લૉગ ઇન કરો",
    "Sign out": "સાઇન આઉટ",
    "Go home": "હોમ પેજ પર જાઓ",
    "Page not found": "પેજ મળ્યું નથી",

    // Landing Page
    "From business problem to blueprint": "વ્યાપાર સમસ્યાથી અમલીકરણ બ્લૂપ્રિન્ટ સુધી",
    "Describe a business problem": "વ્યાપાર સમસ્યાનું વર્ણન કરો",
    "Modules": "મોડ્યુલ્સ",
    "Why one workspace": "એક જ કાર્યસ્થળ શા માટે",
    "Pricing": "કિંમત અને યોજનાઓ",
    "Go to workspace": "કાર્યસ્થળ પર જાઓ",
    "Start Building Free": "મફતમાં શરૂ કરો",
    "Watch Demo": "ડેમો જુઓ",
    "Executive Operations Hub": "ઓપરેશન્સ હબ",
    "Interactive Talent Pipeline": "ટેલેન્ટ પાઇપલાઇન",
    "Enterprise Governance": "એન્ટરપ્રાઇઝ ગવર્નન્સ",

    // Dashboard & Cockpit
    "Workspaces": "પ્રોજેક્ટ્સ (વર્કસ્પેસ)",
    "Active Projects": "સક્રિય પ્રોજેક્ટ્સ",
    "Saved Artifacts": "સાચવેલા દસ્તાવેજો",
    "Live Command Center": "લાઇવ કમાન્ડ સેન્ટર",
    "Active Blueprint": "સક્રિય બ્લૂપ્રિન્ટ",
    "Transformation Cockpit": "ટ્રાન્સફોર્મેશન કોકપિટ",
    "Real-time portfolio overview of blueprint completeness, active risk exposure, and immediate execution milestones.": "બ્લૂપ્રિન્ટ પ્રગતિ, જોખમો અને લક્ષ્યાંકોનું રીઅલ-ટાઇમ વિહંગાવલોકન.",
    "Ask Copilot": "કો-પાયલટને પૂછો",
    "View Full Roadmap": "સંપૂર્ણ રોડમેપ જુઓ",
    "Blueprint Completion": "બ્લૂપ્રિન્ટ પૂર્ણતા",
    "In Progress": "પ્રગતિમાં છે",
    "Audit Ready": "ઑડિટ માટે તૈયાર",
    "Maturity Score": "પરિપક્વતા સ્કોર",
    "Recent Workspaces": "તાજેતરના વર્કસ્પેસ",
    "Search projects...": "પ્રોજેક્ટ્સ શોધો...",
    "Create New Workspace": "નવું વર્કસ્પેસ બનાવો",
    "Loading workspace...": "વર્કસ્પેસ લોડ થઈ રહ્યું છે...",
    "All projects & blueprints": "બધા પ્રોજેક્ટ્સ અને બ્લૂપ્રિન્ટ્સ",

    // Workspace & Navigation
    "Workspace & Intake": "કાર્યસ્થળ અને ઇન્ટેક",
    "Intelligence & Solution": "ઇન્ટેલિજન્સ અને સોલ્યુશન",
    "Systems & Design": "સિસ્ટમ્સ અને ડિઝાઇન",
    "Execution & Strategy": "અમલીકરણ અને વ્યૂહરચના",
    "Delivery & Governance": "ડિલિવરી અને ગવર્નન્સ",
    "Collaboration & Artifacts": "સહયોગ અને દસ્તાવેજો",
    "Governance & Admin": "ગવર્નન્સ અને એડમિન",
    "New Intake": "નવો ઇન્ટેક",
    "AI Discovery": "AI ડિસ્કવરી",
    "Solution Studio": "સોલ્યુશન સ્ટુડિયો",
    "HR CRM": "HR CRM",
    "Architecture": "સિસ્ટમ આર્કિટેક્ચર",
    "Process": "પ્રક્રિયા",
    "Process & BPMN": "પ્રક્રિયા અને BPMN",
    "UX Designer": "UX ડિઝાઇનર",
    "Data & APIs": "ડેટા અને API",
    "Roadmap & ROI": "રોડમેપ અને ROI",
    "Roadmap": "રોડમેપ",
    "Transformation Insights": "આર્કિટેક્ચરલ સમજ",
    "Artifact Map": "આર્ટિફેક્ટ નકશો",
    "Governance & Review": "ગવર્નન્સ અને સમીક્ષા",
    "Export Center": "નિકાસ કેન્દ્ર",
    "Admin Console": "એડમિન કન્સોલ",
    "Settings & Billing": "સેટિંગ્સ અને બિલિંગ",
    "Settings & Monetization": "સેટિંગ્સ અને મોનેટાઇઝેશન",
    "Active Workspace": "સક્રિય વર્કસ્પેસ",
    "Intake": "ઇન્ટેક",
    "Discovery": "ડિસ્કવરી",
    "Solution": "સોલ્યુશન",
    "CRM": "CRM",
    "Regenerate": "ફરીથી બનાવો",
    "Export": "નિકાસ કરો",
    "History": "ઇતિહાસ",

    // Common Actions & Settings
    "Save": "સાચવો",
    "Cancel": "રદ કરો",
    "Upload SOP / BRD": "SOP / BRD અપલોડ કરો",
    "Upload": "અપલોડ કરો",
    "Download": "ડાઉનલોડ કરો",
    "Close": "બંધ કરો",
    "Back": "પાછળ",
    "Next": "આગળ",
    "Submit": "સબમિટ કરો",
    "Delete": "કાઢી નાખો",
    "Edit": "સંપાદિત કરો",
    "Rename": "નામ બદલો",
    "Filter": "ફિલ્ટર",
    "Search": "શોધો",
    "Status": "સ્થિતિ",
    "Actions": "ક્રિયાઓ",
    "Role": "ભૂમિકા",
    "AI Credit Wallet": "AI ક્રેડિટ વૉલેટ",
    "Current Balance": "કુલ બેલેન્સ",
    "Subscription Tiers": "સબ્સ્ક્રિપ્શન પ્લાન્સ",
    "Current Plan": "હાલનો પ્લાન",
    "Pay & Upgrade": "ચૂકવો અને અપગ્રેડ કરો",
    "Appearance & Theme": "થીમ અને દેખાવ",
    "Language & Multilingual Support": "ભાષા અને બહુભાષી સપોર્ટ",
    "Export Defaults": "નિકાસ ડિફૉલ્ટ",
    "Razorpay Payment Gateway": "રેઝરપે પેમેન્ટ ગેટવે",
    "Single workspace": "એક જ વર્કસ્પેસ",
    "Unlimited workspaces": "અમર્યાદિત વર્કસ્પેસ",
    "Free Starter": "ફ્રી સ્ટાર્ટર",
    "Growth Pro": "ગ્રોથ પ્રો",
    "Enterprise Scale": "એન્ટરપ્રાઇઝ સ્કેલ",
    "Top-up Credits": "ક્રેડિટ ઉમેરો",
    "Profile": "પ્રોફાઇલ",
  },

  es: {
    "Welcome back": "Bienvenido de nuevo",
    "Pick up your workspace where you left it.": "Retoma tu espacio de trabajo donde lo dejaste.",
    "Continue with Google": "Continuar con Google",
    "or": "o",
    "Email": "Correo electrónico",
    "Password": "Contraseña",
    "Sign in": "Iniciar sesión",
    "Signing in…": "Iniciando sesión…",
    "Signing in...": "Iniciando sesión…",
    "Forgot password?": "¿Olvidaste tu contraseña?",
    "New here?": "¿Eres nuevo aquí?",
    "Create an account": "Crear una cuenta",
    "Start your first blueprint": "Inicia tu primer plano",
    "One workspace, free forever. No card needed.": "Un espacio de trabajo, gratis para siempre. Sin tarjeta.",
    "Full name": "Nombre completo",
    "At least 6 characters": "Al menos 6 caracteres",
    "Create account": "Crear cuenta",
    "Creating account…": "Creando cuenta…",
    "Already have an account?": "¿Ya tienes una cuenta?",
    "Sign up": "Registrarse",
    "Log in": "Iniciar sesión",
    "Sign out": "Cerrar sesión",
    "Go home": "Ir al inicio",
    "Page not found": "Página no encontrada",
    "Workspaces": "Espacios de Trabajo",
    "Active Projects": "Proyectos Activos",
    "Saved Artifacts": "Artefactos Guardados",
    "Live Command Center": "Centro de Comando en Vivo",
    "Active Blueprint": "Plano Activo",
    "Transformation Cockpit": "Panel de Transformación",
    "Ask Copilot": "Preguntar a Copilot",
    "View Full Roadmap": "Ver Hoja de Ruta Completa",
    "Blueprint Completion": "Finalización del Plano",
    "In Progress": "En Progreso",
    "Audit Ready": "Listo para Auditoría",
    "Save": "Guardar",
    "Cancel": "Cancelar",
    "Upload SOP / BRD": "Subir SOP / BRD",
    "Download": "Descargar",
    "Close": "Cerrar",
    "Back": "Atrás",
    "Next": "Siguiente",
    "AI Credit Wallet": "Billetera de Créditos IA",
    "Current Balance": "Saldo Actual",
    "Subscription Tiers": "Planes de Suscripción",
    "Current Plan": "Plan Actual",
    "Pay & Upgrade": "Pagar y Mejorar",
    "Profile": "Perfil",
  },

  fr: {
    "Welcome back": "Bienvenue",
    "Pick up your workspace where you left it.": "Reprenez votre espace de travail là où vous l'avez laissé.",
    "Continue with Google": "Continuer avec Google",
    "or": "ou",
    "Email": "E-mail",
    "Password": "Mot de passe",
    "Sign in": "Se connecter",
    "Signing in…": "Connexion en cours…",
    "Signing in...": "Connexion en cours…",
    "Forgot password?": "Mot de passe oublié ?",
    "New here?": "Nouveau ici ?",
    "Create an account": "Créer un compte",
    "Start your first blueprint": "Lancez votre premier projet",
    "One workspace, free forever. No card needed.": "Un espace, gratuit pour toujours. Aucune carte requise.",
    "Full name": "Nom complet",
    "At least 6 characters": "Au moins 6 caractères",
    "Create account": "Créer un compte",
    "Creating account…": "Création en cours…",
    "Already have an account?": "Vous avez déjà un compte ?",
    "Sign up": "S'inscrire",
    "Log in": "Connexion",
    "Sign out": "Se déconnecter",
    "Go home": "Retour à l'accueil",
    "Page not found": "Page non trouvée",
    "Workspaces": "Espaces de Travail",
    "Active Projects": "Projets Actifs",
    "Saved Artifacts": "Artefacts Enregistrés",
    "Live Command Center": "Centre de Commande",
    "Active Blueprint": "Plan Actif",
    "Transformation Cockpit": "Cockpit de Transformation",
    "Ask Copilot": "Demander à Copilot",
    "View Full Roadmap": "Voir la Feuille de Route",
    "Blueprint Completion": "Achèvement du Plan",
    "In Progress": "En cours",
    "Audit Ready": "Prêt pour Audit",
    "Save": "Enregistrer",
    "Cancel": "Annuler",
    "Upload SOP / BRD": "Téléverser SOP / BRD",
    "Download": "Télécharger",
    "Close": "Fermer",
    "Back": "Retour",
    "Next": "Suivant",
    "AI Credit Wallet": "Portefeuille de Crédits IA",
    "Current Balance": "Solde Actuel",
    "Subscription Tiers": "Abonnements",
    "Current Plan": "Plan Actuel",
    "Pay & Upgrade": "Payer et Mettre à Niveau",
    "Profile": "Profil",
  },

  de: {
    "Welcome back": "Willkommen zurück",
    "Pick up your workspace where you left it.": "Setzen Sie Ihre Arbeit dort fort, wo Sie aufgehört haben.",
    "Continue with Google": "Weiter mit Google",
    "or": "oder",
    "Email": "E-Mail",
    "Password": "Passwort",
    "Sign in": "Anmelden",
    "Signing in…": "Anmeldung läuft…",
    "Signing in...": "Anmeldung läuft…",
    "Forgot password?": "Passwort vergessen?",
    "New here?": "Neu hier?",
    "Create an account": "Konto erstellen",
    "Start your first blueprint": "Erstellen Sie Ihren ersten Plan",
    "One workspace, free forever. No card needed.": "Ein Arbeitsbereich, für immer kostenlos. Keine Karte nötig.",
    "Full name": "Vollständiger Name",
    "At least 6 characters": "Mindestens 6 Zeichen",
    "Create account": "Konto anlegen",
    "Creating account…": "Konto wird erstellt…",
    "Already have an account?": "Haben Sie bereits ein Konto?",
    "Sign up": "Registrieren",
    "Log in": "Einloggen",
    "Sign out": "Abmelden",
    "Go home": "Zur Startseite",
    "Page not found": "Seite nicht gefunden",
    "Workspaces": "Arbeitsbereiche",
    "Active Projects": "Aktive Projekte",
    "Saved Artifacts": "Gespeicherte Artefakte",
    "Live Command Center": "Live-Kommandozentrale",
    "Active Blueprint": "Aktiver Plan",
    "Transformation Cockpit": "Transformations-Cockpit",
    "Ask Copilot": "Copilot fragen",
    "View Full Roadmap": "Vollständigen Fahrplan ansehen",
    "Blueprint Completion": "Plan-Fertigstellung",
    "In Progress": "In Bearbeitung",
    "Audit Ready": "Auditbereit",
    "Save": "Speichern",
    "Cancel": "Abbrechen",
    "Upload SOP / BRD": "SOP / BRD hochladen",
    "Download": "Herunterladen",
    "Close": "Schließen",
    "Back": "Zurück",
    "Next": "Weiter",
    "AI Credit Wallet": "KI-Guthaben-Konto",
    "Current Balance": "Aktuelles Guthaben",
    "Subscription Tiers": "Abonnements",
    "Current Plan": "Aktueller Plan",
    "Pay & Upgrade": "Bezahlen & Upgraden",
    "Profile": "Profil",
  },

  ja: {
    "Welcome back": "お帰りなさい",
    "Pick up your workspace where you left it.": "前回の続きからワークスペースを再開します。",
    "Continue with Google": "Googleで続行",
    "or": "または",
    "Email": "メールアドレス",
    "Password": "パスワード",
    "Sign in": "サインイン",
    "Signing in…": "サインイン中…",
    "Signing in...": "サインイン中…",
    "Forgot password?": "パスワードをお忘れですか？",
    "New here?": "初めてのご利用ですか？",
    "Create an account": "アカウントを作成",
    "Start your first blueprint": "最初のブループリントを作成",
    "One workspace, free forever. No card needed.": "1つのワークスペース、ずっと無料。カード不要。",
    "Full name": "氏名",
    "At least 6 characters": "6文字以上",
    "Create account": "アカウント作成",
    "Creating account…": "アカウント作成中…",
    "Already have an account?": "既にアカウントをお持ちですか？",
    "Sign up": "新規登録",
    "Log in": "ログイン",
    "Sign out": "サインアウト",
    "Go home": "ホームへ戻る",
    "Page not found": "ページが見つかりません",
    "Workspaces": "ワークスペース一覧",
    "Active Projects": "アクティブプロジェクト",
    "Saved Artifacts": "保存された成果物",
    "Live Command Center": "ライブコマンドセンター",
    "Active Blueprint": "アクティブブループリント",
    "Transformation Cockpit": "変革コックピット",
    "Ask Copilot": "Copilotに質問",
    "View Full Roadmap": "ロードマップ全体を表示",
    "Blueprint Completion": "ブループリント完成度",
    "In Progress": "進行中",
    "Audit Ready": "監査準備完了",
    "Save": "保存",
    "Cancel": "キャンセル",
    "Upload SOP / BRD": "SOP / BRD アップロード",
    "Download": "ダウンロード",
    "Close": "閉じる",
    "Back": "戻る",
    "Next": "次へ",
    "AI Credit Wallet": "AIクレジットウォレット",
    "Current Balance": "現在の残高",
    "Subscription Tiers": "サブスクリプションプラン",
    "Current Plan": "現在のプラン",
    "Pay & Upgrade": "支払いとアップグレード",
    "Profile": "プロフィール",
  },

  ar: {
    "Welcome back": "مرحبًا بعودتك",
    "Pick up your workspace where you left it.": "استأنف مساحة عملك من حيث توقفت.",
    "Continue with Google": "المتابعة باستخدام Google",
    "or": "أو",
    "Email": "البريد الإلكتروني",
    "Password": "كلمة المرور",
    "Sign in": "تسجيل الدخول",
    "Signing in…": "جاري تسجيل الدخول…",
    "Signing in...": "جاري تسجيل الدخول…",
    "Forgot password?": "هل نسيت كلمة المرور؟",
    "New here?": "جديد هنا؟",
    "Create an account": "إنشاء حساب",
    "Start your first blueprint": "ابدأ مخططك الأول",
    "One workspace, free forever. No card needed.": "مساحة عمل واحدة مجانًا إلى الأبد. لا حاجة لبطاقة ائتمان.",
    "Full name": "الاسم الكامل",
    "At least 6 characters": "6 أحرف على الأقل",
    "Create account": "إنشاء الحساب",
    "Creating account…": "جاري إنشاء الحساب…",
    "Already have an account?": "هل لديك حساب بالفعل؟",
    "Sign up": "إنشاء حساب",
    "Log in": "تسجيل الدخول",
    "Sign out": "تسجيل الخروج",
    "Go home": "الصفحة الرئيسية",
    "Page not found": "الصفحة غير موجودة",
    "Workspaces": "مساحات العمل",
    "Active Projects": "المشاريع النشطة",
    "Saved Artifacts": "الأصول المحفوظة",
    "Live Command Center": "مركز القيادة المباشر",
    "Active Blueprint": "المخطط النشط",
    "Transformation Cockpit": "قمرة قيادة التحول",
    "Ask Copilot": "اسأل المساعد الذكي",
    "View Full Roadmap": "عرض خريطة الطريق الكاملة",
    "Blueprint Completion": "اكتمال المخطط",
    "In Progress": "قيد التنفيذ",
    "Audit Ready": "جاهز للتدقيق",
    "Save": "حفظ",
    "Cancel": "إلغاء",
    "Upload SOP / BRD": "رفع ملف SOP / BRD",
    "Download": "تنزيل",
    "Close": "إغلاق",
    "Back": "رجوع",
    "Next": "التالي",
    "AI Credit Wallet": "محفظة نقاط الذكاء الاصطناعي",
    "Current Balance": "الرصيد الحالي",
    "Subscription Tiers": "خطط الاشتراك",
    "Current Plan": "الخطة الحالية",
    "Pay & Upgrade": "الدفع والترقية",
    "Profile": "الملف الشخصي",
  },
};

// Store original text of nodes so we never lose original English content
const originalTextMap = new WeakMap<Node, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();

/**
 * Translates a single text string according to current language dictionary.
 */
export function translateText(text: string, lang: SupportedLanguage): string {
  if (lang === "en" || !text) return text;

  const dict = PHRASE_DICTIONARY[lang as Exclude<SupportedLanguage, "en">];
  if (!dict) return text;

  const trimmed = text.trim();
  if (!trimmed) return text;

  // 1. Direct match
  if (dict[trimmed]) {
    return text.replace(trimmed, dict[trimmed]);
  }

  // 2. Case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [enKey, val] of Object.entries(dict)) {
    if (enKey.toLowerCase() === lower) {
      return text.replace(trimmed, val);
    }
  }

  // 3. Multi-word phrase replacement within longer sentences
  let result = text;
  for (const [enKey, val] of Object.entries(dict)) {
    if (enKey.length >= 4 && result.includes(enKey)) {
      result = result.split(enKey).join(val);
    }
  }

  return result;
}

/**
 * Recursively walks the DOM and replaces visible text nodes with translated equivalents.
 */
export function runUniversalDomTranslation(targetLang: SupportedLanguage): void {
  if (typeof document === "undefined" || !document.body) return;

  const isEnglish = targetLang === "en";

  const walk = (node: Node) => {
    // Ignore script, style, code, and svg non-text tags
    const parent = node.parentElement;
    if (parent) {
      const tag = parent.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "noscript") {
        return;
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const currentVal = node.nodeValue || "";
      if (!currentVal.trim()) return;

      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, currentVal);
      }

      const original = originalTextMap.get(node) || currentVal;

      if (isEnglish) {
        if (node.nodeValue !== original) {
          node.nodeValue = original;
        }
      } else {
        const translated = translateText(original, targetLang);
        if (translated !== node.nodeValue) {
          node.nodeValue = translated;
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      // Handle input / textarea placeholders
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        if (input.placeholder) {
          if (!originalPlaceholderMap.has(input)) {
            originalPlaceholderMap.set(input, input.placeholder);
          }
          const origPl = originalPlaceholderMap.get(input) || input.placeholder;
          if (isEnglish) {
            input.placeholder = origPl;
          } else {
            input.placeholder = translateText(origPl, targetLang);
          }
        }
      }

      // Walk children
      for (let child = el.firstChild; child; child = child.nextSibling) {
        walk(child);
      }
    }
  };

  walk(document.body);
}

let observerInstance: MutationObserver | null = null;

/**
 * Initializes continuous DOM translation observer so newly mounted views,
 * dialogs, tooltips, and router pages automatically translate.
 */
export function initUniversalDomObserver(): void {
  if (typeof window === "undefined" || typeof MutationObserver === "undefined") return;

  if (observerInstance) {
    observerInstance.disconnect();
  }

  const trigger = () => {
    const lang = getCurrentLanguage();
    if (lang !== "en") {
      runUniversalDomTranslation(lang);
    }
  };

  observerInstance = new MutationObserver(() => {
    trigger();
  });

  observerInstance.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Run initial pass
  trigger();
}
