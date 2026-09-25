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

    // Landing Page & Hero
    "From business problem to blueprint": "व्यावसायिक समस्या से क्रियान्वयन ब्लूप्रिंट तक",
    "From Business Problem to Blueprint": "व्यावसायिक समस्या से क्रियान्वयन ब्लूप्रिंट तक",
    "From Business Idea to Full Blueprint": "व्यावसायिक विचार से पूर्ण ब्लूप्रिंट तक",
    "Empowered by Autonomous Multi-Agent AI": "स्वायत्त मल्टी-एजेंट AI द्वारा संचालित",
    "Autonomous Multi-Agent Architecture": "स्वायत्त मल्टी-एजेंट वास्तुकला",
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

    // Dashboard, Cockpit & Widgets
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
    "Search projects": "परियोजनाएं खोजें",
    "Create New Workspace": "नया कार्यक्षेत्र बनाएं",
    "Loading workspace...": "कार्यक्षेत्र लोड हो रहा है...",
    "All projects & blueprints": "सभी प्रोजेक्ट और ब्लूप्रिंट",
    "Flagged Open Risks": "चिह्नित खुले जोखिम",
    "Total Risks": "कुल जोखिम",
    "Action Items": "आगे बढ़ें (Action Items)",
    "Milestones": "मील के पत्थर (Milestones)",
    "AI Copilot Assistant": "AI को-पायलट सहायक",
    "Have questions about your blueprint?": "क्या आपके ब्लूप्रिंट के बारे में प्रश्न हैं?",
    "Instant answers grounded on your Supabase artifacts.": "आपके आर्टिफ़ैक्ट्स पर आधारित त्वरित उत्तर।",
    "Launch Copilot": "को-पायलट शुरू करें",
    "Review Risk Register": "जोखिम रजिस्टर की समीक्षा करें",
    "Inspect Sprints": "स्प्रिंट्स का निरीक्षण करें",
    "Top 3 Flagged Risks": "शीर्ष 3 चिह्नित जोखिम",
    "All Risks": "सभी जोखिम",
    "Sprint Plan": "स्प्रिंट योजना",
    "All Transformation Workspaces": "सभी परिवर्तन कार्यक्षेत्र (प्रोजेक्ट्स)",
    "All Transformation": "सभी परिवर्तन",
    "Switch or create blueprints for client initiatives.": "क्लाइंट पहलों के लिए ब्लूप्रिंट बदलें या नए बनाएं।",
    "Workspace Used": "कार्यक्षेत्र उपयोग किया गया",
    "New workspace": "नया कार्यक्षेत्र",
    "High Priority": "उच्च प्राथमिकता",
    "Compliance Signoff Needed": "अनुपालन हस्ताक्षर आवश्यक",
    "Technical Risk": "तकनीकी जोखिम",
    "Geospatial Data Architect": "भू-स्थानिक डेटा आर्किटेक्ट",
    "Telematics Ingestion Engine": "टेलीमैटिक्स डेटा इंजन",
    "Circular & Polygon Warehouse Geofencing Engine": "गोदाम जियोफेंसिंग इंजन",
    "Fleet Dispatch Command Map Visualizer": "फ्लीट डिस्पैच कमांड मैप",

    // CRM, Shipments, Logistics & HR Fields
    "Consignment": "कंसाइनमेंट",
    "Route & Cargo Spec": "रूट और कार्गो विवरण",
    "Metric": "मीट्रिक",
    "Stage (Click to advance)": "चरण (आगे बढ़ने के लिए क्लिक करें)",
    "Stage": "चरण",
    "Rating": "रेटिंग",
    "Status": "स्थिति",
    "Notes": "नोट्स",
    "Notice Period": "नोटिस अवधि",
    "Expected CTC": "अपेक्षित सीटीसी",
    "LinkedIn URL": "लिंक्डइन लिंक",
    "Actions": "कार्रवाई",
    "Total Shipments": "कुल शिपमेंट",
    "In Pipeline": "पाइपलाइन में",
    "Top Rated": "शीर्ष मूल्यांकित",
    "Avg. Rating": "औसत रेटिंग",
    "Avg Rating": "औसत रेटिंग",
    "Dispatched": "भेजा गया (Dispatched)",
    "In Transit": "मार्ग में (In Transit)",
    "Customs / Hub": "कस्टम्स / हब",
    "Delivered": "वितरित (Delivered)",
    "Active": "सक्रिय",
    "Hired": "नियुक्त (Hired)",
    "Add Consignment": "नया कंसाइनमेंट जोड़ें",
    "Filters": "फ़िल्टर",
    "Export CSV": "CSV निर्यात करें",
    "Search by name, route & cargo spec, or email...": "नाम, रूट, कार्गो या ईमेल से खोजें...",
    "CLINICAL STAFF & PHLEBOTOMIST DUTY CLOCK": "क्लिनिकल स्टाफ और फ्लेबोटोमिस्ट ड्यूटी क्लॉक",
    "Operational Shift Check-In / Check-Out": "परिचालन शिफ्ट चेक-इन / चेक-आउट",
    "Punch In": "पंच इन (शुरू करें)",
    "Punch Out": "पंच आउट (समाप्त करें)",
    "Session elapsed": "सत्र की बीती अवधि",
    "Not clocked in": "क्लॉक-इन नहीं किया गया",
    "Date": "दिनांक",
    "Hours Worked": "कार्य किए गए घंटे",
    "Staff / Field Agent": "स्टाफ / फील्ड एजेंट",
    "Candidates": "उम्मीदवार",

    // Navigation & Chain Items
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

    // Build vs Buy Decision Matrix
    "Build vs. Buy vs. Hybrid — Strategic Decision Matrix": "बिल्ड बनाम बाय बनाम हाइब्रिड — रणनीतिक निर्णय मैट्रिक्स",
    "Strategic Decision Matrix": "रणनीतिक निर्णय मैट्रिक्स",
    "BizzMitra AI Tailored Platform": "बिजमित्र AI टेलर्ड प्लेटफॉर्म",
    "Custom Ground-Up Microservices": "कस्टम ग्राउंड-अप माइक्रो-सर्विसेज",
    "Off-the-shelf Generic Enterprise SaaS": "ऑफ-द-शेल्फ जेनेरिक एंटरप्राइज SaaS",
    "COST EFFICIENCY": "लागत दक्षता",
    "DELIVERY SPEED": "वितरण गति",
    "CONTROL": "नियंत्रण और स्वामित्व",
    "DOMAIN FIT": "डोमेन उपयुक्तता",
    "Recommended": "अनुशंसित",
    "Viable": "व्यवहार्य",
    "Rejected": "अस्वीकृत",

    // Governance, Review & Sign-Off
    "Governance, Review & Stakeholder Sign-Off": "शासन, समीक्षा और हितधारक हस्ताक्षर",
    "Enterprise Collaboration & Governance Hub": "उद्यम सहयोग और शासन केंद्र",
    "In-Context Artifact Review Threads": "इन-कॉन्टेक्स्ट आर्टिफ़ैक्ट समीक्षा सूत्र",
    "Collaborative notes and feedback pinned to technical blueprints.": "तकनीकी ब्लूप्रिंट से जुड़े सहयोगात्मक नोट्स और सुझाव।",
    "Leave In-Context Blueprint Feedback": "ब्लूप्रिंट पर इन-कॉन्टेक्स्ट फीडबैक छोड़ें",
    "Target Artifact": "लक्षित आर्टिफ़ैक्ट",
    "Severity": "गंभीरता",
    "Feedback / Suggestion": "सुझाव / प्रतिक्रिया",
    "Post Comment": "टिप्पणी पोस्ट करें",
    "Cross-Functional Stakeholder Sign-Offs": "क्रॉस-फंक्शनल हितधारक हस्ताक्षर",
    "Sign-Off Progress": "हस्ताक्षर प्रगति",
    "Review Comments": "समीक्षा टिप्पणियां",
    "Audit Trail Entries": "ऑडिट ट्रेल प्रविष्टियां",
    "Governance Compliance": "शासन अनुपालन",
    "Approved": "स्वीकृत",
    "Signed": "हस्ताक्षरित",
    "Mark Draft": "ड्राफ्ट चिह्नित करें",
    "Submit for Review": "समीक्षा के लिए जमा करें",
    "Approve Blueprint": "ब्लूप्रिंट स्वीकृत करें",

    // AI Copilot & Chat
    "Blueprint Copilot": "ब्लूप्रिंट को-पायलट",
    "Live Grounded": "लाइव कनेक्टेड",
    "Chat History": "चैट इतिहास",
    "New Chat": "नई चैट",
    "Ask about your risks, timeline, budget...": "अपने जोखिम, समयसीमा, बजट के बारे में पूछें...",
    "Live metered • Deducts per token": "लाइव मीटर्ड • टोकन अनुसार कटौती",
    "Multi-session memory • Deducts per token": "मल्टी-सत्र मेमोरी • टोकन अनुसार कटौती",
    "Analyzing blueprint data…": "ब्लूप्रिंट डेटा का विश्लेषण हो रहा है…",

    // Common Actions, Billing & Modals
    "AI Credit Wallet": "AI क्रेडिट वॉलेट",
    "Current Balance": "वर्तमान शेष",
    "Monthly Quota": "मासिक कोटा",
    "5-Hour Throttle Ceiling": "5-घंटे की थ्रॉटल सीमा",
    "7-Day Rolling Weekly Ceiling": "7-दिवसीय साप्ताहिक सीमा",
    "Subscription Tiers": "सदस्यता योजनाएं",
    "Current Plan": "वर्तमान योजना",
    "Pay & Upgrade": "भुगतान करें और अपग्रेड करें",
    "Appearance & Theme": "दिखावट (थीम)",
    "Language & Multilingual Support": "भाषा और बहुभाषी समर्थन",
    "Export Defaults": "निर्यात डिफ़ॉल्ट",
    "Free Starter": "मुफ़्त स्टार्टर",
    "Growth Pro": "ग्रोथ प्रो",
    "Enterprise Scale": "एंटरप्राइज स्केल",
    "Top-up Credits": "क्रेडिट जोड़ें (टॉप-अप)",
    "Profile": "उपयोगकर्ता प्रोफ़ाइल",
    "Save": "सहेजें",
    "Cancel": "रद्द करें",
    "Download": "डाउनलोड करें",
    "Close": "बंद करें",
    "Back": "पीछे जाएं",
    "Next": "आगे बढ़ें",
    "Skip": "छोड़ें (Skip)",
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

    // Landing Page & Hero
    "From business problem to blueprint": "વ્યાપાર સમસ્યાથી અમલીકરણ બ્લૂપ્રિન્ટ સુધી",
    "From Business Problem to Blueprint": "વ્યાપાર સમસ્યાથી અમલીકરણ બ્લૂપ્રિન્ટ સુધી",
    "From Business Idea to Full Blueprint": "વ્યાપાર વિચારથી સંપૂર્ણ બ્લૂપ્રિન્ટ સુધી",
    "Empowered by Autonomous Multi-Agent AI": "સ્વાયત્ત મલ્ટી-એજન્ટ AI દ્વારા સંચાલિત",
    "Autonomous Multi-Agent Architecture": "સ્વાયત્ત મલ્ટી-એજન્ટ આર્કિટેક્ચર",
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

    // Dashboard, Cockpit & Widgets
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
    "Search projects": "પ્રોજેક્ટ્સ શોધો",
    "Create New Workspace": "નવું વર્કસ્પેસ બનાવો",
    "Loading workspace...": "વર્કસ્પેસ લોડ થઈ રહ્યું છે...",
    "All projects & blueprints": "બધા પ્રોજેક્ટ્સ અને બ્લૂપ્રિન્ટ્સ",
    "Flagged Open Risks": "ચિહ્નિત ખુલ્લા જોખમો",
    "Total Risks": "કુલ જોખમો",
    "Action Items": "આગળ વધવાનાં કાર્યો (Action Items)",
    "Milestones": "માઇલસ્ટોન્સ",
    "AI Copilot Assistant": "AI કો-પાયલટ સહાયક",
    "Have questions about your blueprint?": "શું તમારા બ્લૂપ્રિન્ટ વિશે પ્રશ્નો છે?",
    "Instant answers grounded on your Supabase artifacts.": "તમારા સુપાબેસ આર્ટિફેક્ટ્સ પર આધારિત ત્વરિત જવાબો.",
    "Launch Copilot": "કો-પાયલટ શરૂ કરો",
    "Review Risk Register": "જોખમ રજિસ્ટરની સમીક્ષા કરો",
    "Inspect Sprints": "સ્પ્રિન્ટ્સ તપાસો",
    "Top 3 Flagged Risks": "ટોચના ૩ ચિહ્નિત જોખમો",
    "All Risks": "બધા જોખમો",
    "Sprint Plan": "સ્પ્રિન્ટ યોજના",
    "All Transformation Workspaces": "બધા ટ્રાન્સફોર્મેશન વર્કસ્પેસ (પ્રોજેક્ટ્સ)",
    "All Transformation": "બધા ટ્રાન્સફોર્મેશન",
    "Switch or create blueprints for client initiatives.": "ક્લાયન્ટ પ્રોજેક્ટ્સ માટે બ્લૂપ્રિન્ટ્સ સ્વિચ કરો અથવા નવા બનાવો.",
    "Workspace Used": "વર્કસ્પેસ વપરાયેલ",
    "New workspace": "નવું વર્કસ્પેસ",
    "High Priority": "ઉચ્ચ પ્રાથમિકતા",
    "Compliance Signoff Needed": "અનુપાલન સહી જરૂરી",
    "Technical Risk": "ટેકનિકલ જોખમ",
    "Geospatial Data Architect": "ભૂ-અવકાશીય ડેટા આર્કિટેક્ટ",
    "Telematics Ingestion Engine": "ટેલિમેટિક્સ ઇન્જેશન એન્જિન",
    "Circular & Polygon Warehouse Geofencing Engine": "ગોદામ જીઓફેન્સિંગ એન્જિન",
    "Fleet Dispatch Command Map Visualizer": "ફ્લીટ ડિસ્પેચ કમાન્ડ મેપ",

    // CRM, Shipments, Logistics & HR Fields
    "Consignment": "કન્સાઇનમેન્ટ",
    "Route & Cargo Spec": "રૂટ અને કાર્ગો વિગત",
    "Metric": "મેટ્રિક",
    "Stage (Click to advance)": "સ્ટેજ (આગળ વધવા ક્લિક કરો)",
    "Stage": "સ્ટેજ",
    "Rating": "રેટિંગ",
    "Status": "સ્થિતિ",
    "Notes": "નોંધ",
    "Notice Period": "નોટિસ પીરિયડ",
    "Expected CTC": "અપેક્ષિત સીટીસી",
    "LinkedIn URL": "લિંક્ડઇન લિંક",
    "Actions": "ક્રિયાઓ",
    "Total Shipments": "કુલ શિપમેન્ટ્સ",
    "In Pipeline": "પાઇપલાઇનમાં",
    "Top Rated": "શ્રેષ્ઠ કરેલ",
    "Avg. Rating": "સરેરાશ રેટિંગ",
    "Avg Rating": "સરેરાશ રેટિંગ",
    "Dispatched": "રવાના થયેલ (Dispatched)",
    "In Transit": "ટ્રાન્ઝિટમાં (In Transit)",
    "Customs / Hub": "કસ્ટમ્સ / હબ",
    "Delivered": "ડિલિવર થયેલ",
    "Active": "સક્રિય",
    "Hired": "હાયર કરેલ",
    "Add Consignment": "કન્સાઇનમેન્ટ ઉમેરો",
    "Filters": "ફિલ્ટર્સ",
    "Export CSV": "CSV નિકાસ કરો",
    "Search by name, route & cargo spec, or email...": "નામ, રૂટ, કાર્ગો અથવા ઇમેઇલ દ્વારા શોધો...",
    "CLINICAL STAFF & PHLEBOTOMIST DUTY CLOCK": "ક્લિનિકલ સ્ટાફ અને ફ્લેબોટોમિસ્ટ ડ્યુટી ક્લોક",
    "Operational Shift Check-In / Check-Out": "શિફ્ટ ચેક-ઇન / ચેક-આઉટ",
    "Punch In": "પંચ ઇન (શરૂ કરો)",
    "Punch Out": "પંચ આઉટ (સમાપ્ત કરો)",
    "Session elapsed": "સત્રનો વિતાવેલો સમય",
    "Not clocked in": "ક્લોક-ઇન થયેલ નથી",
    "Date": "તારીખ",
    "Hours Worked": "કામના કલાકો",
    "Staff / Field Agent": "સ્ટાફ / ફિલ્ડ એજન્ટ",
    "Candidates": "ઉમેદવારો",

    // Navigation & Chain Items
    "Workspace & Intake": "વર્કસ્પેસ અને ઇનટેક",
    "Intelligence & Solution": "ઇન્ટેલિજન્સ અને સોલ્યુશન",
    "Systems & Design": "સિસ્ટમ્સ અને ડિઝાઇન",
    "Execution & Strategy": "અમલીકરણ અને વ્યૂહરચના",
    "Delivery & Governance": "ડિલિવરી અને ગવર્નન્સ",
    "Collaboration & Artifacts": "સહયોગ અને દસ્તાવેજો",
    "Governance & Admin": "વહીવટ અને નિયંત્રણ",
    "New Intake": "નવું ઇનટેક",
    "AI Discovery": "AI શોધ અને વિશ્લેષણ",
    "Solution Studio": "સોલ્યુશન સ્ટુડિયો",
    "HR CRM": "એચઆર સીઆરએમ",
    "Architecture": "સિસ્ટમ આર્કિટેક્ચર",
    "Process": "પ્રક્રિયા",
    "Process & BPMN": "પ્રક્રિયા અને BPMN",
    "UX Designer": "UX ડિઝાઇનર",
    "Data & APIs": "ડેટા અને API",
    "Roadmap & ROI": "અમલીકરણ રોડમેપ",
    "Roadmap": "રોડમેપ",
    "Transformation Insights": "ટ્રાન્સફોર્મેશન ઇનસાઇટ્સ",
    "Artifact Map": "આર્ટિફેક્ટ મેપ",
    "Governance & Review": "ગવર્નન્સ અને રિવ્યુ",
    "Export Center": "નિકાસ કેન્દ્ર",
    "Admin Console": "એડમિન કન્સોલ",
    "Settings & Billing": "સેટિંગ્સ અને બિલિંગ",
    "Settings & Monetization": "સેટિંગ્સ અને મુદ્રીકરણ",
    "Active Workspace": "સક્રિય વર્કસ્પેસ",
    "Intake": "ઇનટેક",
    "Discovery": "શોધ",
    "Solution": "સોલ્યુશન",
    "CRM": "સીઆરએમ",
    "Regenerate": "ફરીથી બનાવો",
    "Export": "નિકાસ કરો",
    "History": "ઇતિહાસ",

    // Build vs Buy Decision Matrix
    "Build vs. Buy vs. Hybrid — Strategic Decision Matrix": "બિલ્ડ વિ. બાય વિ. હાઇબ્રિડ — વ્યૂહાત્મક નિર્ણય મેટ્રિક્સ",
    "Strategic Decision Matrix": "વ્યૂહાત્મક નિર્ણય મેટ્રિક્સ",
    "BizzMitra AI Tailored Platform": "બિઝમિત્ર AI ટેલર્ડ પ્લેટફોર્મ",
    "Custom Ground-Up Microservices": "કસ્ટમ ગ્રાઉન્ડ-અપ માઇક્રોસર્વિસિસ",
    "Off-the-shelf Generic Enterprise SaaS": "ઑફ-ધ-શેલ્ફ જેનેરિક SaaS",
    "COST EFFICIENCY": "ખર્ચ કાર્યક્ષમતા",
    "DELIVERY SPEED": "ડિલિવરી ઝડપ",
    "CONTROL": "નિયંત્રણ અને માલિકી",
    "DOMAIN FIT": "યોગ્યતા",
    "Recommended": "ભલામણ કરેલ",
    "Viable": "શક્ય",
    "Rejected": "નકારવામાં આવેલ",

    // Governance, Review & Sign-Off
    "Governance, Review & Stakeholder Sign-Off": "ગવર્નન્સ, રિવ્યુ અને સાઇન-ઑફ",
    "Enterprise Collaboration & Governance Hub": "એન્ટરપ્રાઇઝ સહયોગ અને ગવર્નન્સ હબ",
    "In-Context Artifact Review Threads": "ઇન-કોન્ટેક્સ્ટ રિવ્યુ થ્રેડ્સ",
    "Leave In-Context Blueprint Feedback": "બ્લૂપ્રિન્ટ પર ફીડબેક આપો",
    "Target Artifact": "લક્ષ્ય આર્ટિફેક્ટ",
    "Severity": "ગંભીરતા",
    "Feedback / Suggestion": "સૂચન / પ્રતિભાવ",
    "Post Comment": "ટિપ્પણી પોસ્ટ કરો",
    "Cross-Functional Stakeholder Sign-Offs": "સ્ટેકહોલ્ડર સાઇન-ઑફ",
    "Sign-Off Progress": "સાઇન-ઑફ પ્રગતિ",
    "Approved": "મંજૂર થયેલ",
    "Signed": "સહી કરેલ",
    "Mark Draft": "ડ્રાફ્ટ ચિહ્નિત કરો",
    "Submit for Review": "સમીક્ષા માટે સબમિટ કરો",
    "Approve Blueprint": "બ્લૂપ્રિન્ટ મંજૂર કરો",

    // AI Copilot & Chat
    "Blueprint Copilot": "બ્લૂપ્રિન્ટ કો-પાયલટ",
    "Live Grounded": "લાઇવ કનેક્ટેડ",
    "Chat History": "ચેટ ઇતિહાસ",
    "New Chat": "નવી ચેટ",
    "Ask about your risks, timeline, budget...": "તમારા જોખમો, સમયરેખા, બજેટ વિશે પૂછો...",
    "Live metered • Deducts per token": "લાઇવ મીટર કરેલ • ટોકન દીઠ કપાત",
    "Multi-session memory • Deducts per token": "મલ્ટી-સત્ર મેમરી • ટોકન દીઠ કપાત",
    "Analyzing blueprint data…": "બ્લૂપ્રિન્ટ ડેટાનું વિશ્લેષણ થઈ રહ્યું છે…",

    // Common Actions, Billing & Modals
    "AI Credit Wallet": "AI ક્રેડિટ વૉલેટ",
    "Current Balance": "હાલનું બેલેન્સ",
    "Monthly Quota": "માસિક ક્વોટા",
    "5-Hour Throttle Ceiling": "5-કલાકની થ્રોટલ મર્યાદા",
    "7-Day Rolling Weekly Ceiling": "7-દિવસની સાપ્તાહિક મર્યાદા",
    "Subscription Tiers": "સબ્સ્ક્રિપ્શન પ્લાન",
    "Current Plan": "વર્તમાન પ્લાન",
    "Pay & Upgrade": "ચુકવણી કરો અને અપગ્રેડ કરો",
    "Appearance & Theme": "થીમ અને દેખાવ",
    "Language & Multilingual Support": "ભાષા સપોર્ટ",
    "Export Defaults": "ડિફોલ્ટ નિકાસ",
    "Free Starter": "ફ્રી સ્ટાર્ટર",
    "Growth Pro": "ગ્રોથ પ્રો",
    "Enterprise Scale": "એન્ટરપ્રાઇઝ સ્કેલ",
    "Top-up Credits": "ક્રેડિટ્સ ઉમેરો",
    "Profile": "પ્રોફાઇલ",
    "Save": "સાચવો",
    "Cancel": "રદ કરો",
    "Download": "ડાઉનલોડ કરો",
    "Close": "બંધ કરો",
    "Back": "પાછળ જાઓ",
    "Next": "આગળ વધો",
    "Skip": "છોડો (Skip)",
  },

  es: {
    "Welcome back": "Bienvenido de nuevo",
    "Pick up your workspace where you left it.": "Continúa tu espacio de trabajo donde lo dejaste.",
    "Continue with Google": "Continuar con Google",
    "Email": "Correo electrónico",
    "Password": "Contraseña",
    "Sign in": "Iniciar sesión",
    "Create an account": "Crear una cuenta",
    "Start your first blueprint": "Comienza tu primer anteproyecto",
    "Workspaces": "Espacios de trabajo",
    "Live Command Center": "Centro de Comando en Vivo",
    "Transformation Cockpit": "Cabina de Transformación",
    "Ask Copilot": "Preguntar al Copiloto",
    "View Full Roadmap": "Ver hoja de ruta completa",
    "Blueprint Completion": "Finalización del anteproyecto",
    "In Progress": "En progreso",
    "Audit Ready": "Listo para auditoría",
    "Save": "Guardar",
    "Cancel": "Cancelar",
    "Download": "Descargar",
    "Close": "Cerrar",
    "Back": "Atrás",
    "Next": "Siguiente",
    "AI Credit Wallet": "Billetera de Créditos IA",
    "Current Balance": "Saldo Actual",
    "Subscription Tiers": "Planes de Suscripción",
    "Current Plan": "Plan Actual",
    "Pay & Upgrade": "Pagar y Actualizar",
    "Operational Shift Check-In / Check-Out": "Registro de Turno Operativo",
    "Punch In": "Registrar Entrada",
    "Punch Out": "Registrar Salida",
    "Session elapsed": "Tiempo transcurrido",
    "Not clocked in": "No registrado",
    "Consignment": "Envío / Consignación",
    "Route & Cargo Spec": "Ruta y Carga",
    "Status": "Estado",
    "Rating": "Calificación",
    "Notice Period": "Período de Preaviso",
    "Expected CTC": "Salario Esperado",
    "Actions": "Acciones",
    "Total Shipments": "Envíos Totales",
    "In Pipeline": "En Proceso",
    "Dispatched": "Despachado",
    "In Transit": "En Tránsito",
    "Delivered": "Entregado",
    "Flagged Open Risks": "Riesgos Abiertos",
    "Total Risks": "Riesgos Totales",
    "Action Items": "Acciones Clave",
    "Milestones": "Hitos",
    "Governance, Review & Stakeholder Sign-Off": "Gobernanza y Aprobación",
    "Approved": "Aprobado",
    "Recommended": "Recomendado",
    "Viable": "Viable",
    "Rejected": "Rechazado",
  },

  fr: {
    "Welcome back": "Bon retour",
    "Pick up your workspace where you left it.": "Reprenez votre espace de travail là où vous l'avez laissé.",
    "Continue with Google": "Continuer avec Google",
    "Email": "E-mail",
    "Password": "Mot de passe",
    "Sign in": "Se connecter",
    "Create an account": "Créer un compte",
    "Workspaces": "Espaces de travail",
    "Transformation Cockpit": "Cockpit de Transformation",
    "Ask Copilot": "Demander au Copilote",
    "View Full Roadmap": "Voir la feuille de route",
    "Save": "Enregistrer",
    "Cancel": "Annuler",
    "Download": "Télécharger",
    "Close": "Fermer",
    "AI Credit Wallet": "Portefeuille de Crédits IA",
    "Current Balance": "Solde Actuel",
    "Subscription Tiers": "Niveaux d'abonnement",
    "Current Plan": "Plan Actuel",
    "Operational Shift Check-In / Check-Out": "Pointage des quarts de travail",
    "Punch In": "Pointer Entrée",
    "Punch Out": "Pointer Sortie",
    "Consignment": "Expédition",
    "Status": "Statut",
    "Actions": "Actions",
    "Total Shipments": "Expéditions Totales",
    "Approved": "Approuvé",
    "Recommended": "Recommandé",
  },

  de: {
    "Welcome back": "Willkommen zurück",
    "Continue with Google": "Mit Google fortfahren",
    "Email": "E-Mail",
    "Password": "Passwort",
    "Sign in": "Anmelden",
    "Create an account": "Konto erstellen",
    "Workspaces": "Arbeitsbereiche",
    "Transformation Cockpit": "Transformations-Cockpit",
    "Ask Copilot": "Copilot fragen",
    "Save": "Speichern",
    "Cancel": "Abbrechen",
    "Download": "Herunterladen",
    "AI Credit Wallet": "KI-Guthaben-Wallet",
    "Current Balance": "Aktuelles Guthaben",
    "Subscription Tiers": "Abonnement-Stufen",
    "Operational Shift Check-In / Check-Out": "Schicht-Einchecken / Auschecken",
    "Punch In": "Einstempeln",
    "Punch Out": "Ausstempeln",
    "Consignment": "Sendung",
    "Status": "Status",
    "Actions": "Aktionen",
    "Total Shipments": "Gesamtsendungen",
    "Approved": "Genehmigt",
    "Recommended": "Empfohlen",
  },

  ja: {
    "Welcome back": "おかえりなさい",
    "Continue with Google": "Googleで続行",
    "Email": "メールアドレス",
    "Password": "パスワード",
    "Sign in": "サインイン",
    "Create an account": "アカウントを作成",
    "Workspaces": "ワークスペース",
    "Transformation Cockpit": "変革コックピット",
    "Ask Copilot": "Copilotに質問",
    "Save": "保存",
    "Cancel": "キャンセル",
    "Download": "ダウンロード",
    "AI Credit Wallet": "AIクレジットウォレット",
    "Current Balance": "現在の残高",
    "Subscription Tiers": "サブスクリプションプラン",
    "Operational Shift Check-In / Check-Out": "シフト出勤 / 退勤",
    "Punch In": "出勤打刻",
    "Punch Out": "退勤打刻",
    "Consignment": "出荷・委託",
    "Status": "ステータス",
    "Actions": "アクション",
    "Total Shipments": "総出荷数",
    "Approved": "承認済み",
    "Recommended": "推奨",
  },

  ar: {
    "Welcome back": "مرحبًا بك مجددًا",
    "Continue with Google": "المتابعة باستخدام Google",
    "Email": "البريد الإلكتروني",
    "Password": "كلمة المرور",
    "Sign in": "تسجيل الدخول",
    "Create an account": "إنشاء حساب",
    "Workspaces": "مساحات العمل",
    "Transformation Cockpit": "قمرة قيادة التحول",
    "Ask Copilot": "اسأل المساعد الذكي",
    "Save": "حفظ",
    "Cancel": "إلغاء",
    "Download": "تنزيل",
    "AI Credit Wallet": "محفظة نقاط الذكاء الاصطناعي",
    "Current Balance": "الرصيد الحالي",
    "Subscription Tiers": "خطط الاشتراك",
    "Operational Shift Check-In / Check-Out": "تسجيل الحضور / الانصراف للوردية",
    "Punch In": "تسجيل دخول",
    "Punch Out": "تسجيل خروج",
    "Consignment": "الشحنة",
    "Status": "الحالة",
    "Actions": "الإجراءات",
    "Total Shipments": "إجمالي الشحنات",
    "Approved": "تمت الموافقة",
    "Recommended": "موصى به",
  },
};

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Cached sorted dictionary keys for longest-first matching
const sortedDictionaryCache = new Map<SupportedLanguage, Array<[string, string]>>();

function getSortedDictionary(lang: SupportedLanguage): Array<[string, string]> {
  if (lang === "en") return [];
  if (sortedDictionaryCache.has(lang)) {
    return sortedDictionaryCache.get(lang)!;
  }
  const dict = PHRASE_DICTIONARY[lang as Exclude<SupportedLanguage, "en">] || {};
  const entries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
  sortedDictionaryCache.set(lang, entries);
  return entries;
}

// Maps to store original English text nodes and attributes
const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

/**
 * Translates a single text string according to current language dictionary.
 * Performs case-insensitive matching so UPPERCASE headers (e.g. CONSIGNMENT, FLAGGED RISKS)
 * are accurately translated.
 */
export function translateText(text: string, lang: SupportedLanguage): string {
  if (lang === "en" || !text) return text;

  const dict = PHRASE_DICTIONARY[lang as Exclude<SupportedLanguage, "en">];
  if (!dict) return text;

  const trimmed = text.trim();
  if (!trimmed) return text;

  // 1. Direct exact match
  if (dict[trimmed]) {
    return text.replace(trimmed, dict[trimmed]);
  }

  // 2. Case-insensitive exact match for standalone words/phrases
  const lower = trimmed.toLowerCase();
  for (const [enKey, val] of Object.entries(dict)) {
    if (enKey.toLowerCase() === lower) {
      return text.replace(trimmed, val);
    }
  }

  // 3. Multi-word & substring phrase replacement (longest matches first)
  const sorted = getSortedDictionary(lang);
  let result = text;

  for (const [enKey, val] of sorted) {
    if (enKey.length >= 2) {
      const escaped = escapeRegExp(enKey);
      // Case-insensitive boundary or substring match
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      if (regex.test(result)) {
        result = result.replace(regex, val);
      } else if (result.toLowerCase().includes(enKey.toLowerCase()) && enKey.length >= 4) {
        const genericRegex = new RegExp(escaped, "gi");
        result = result.replace(genericRegex, val);
      }
    }
  }

  return result;
}

let isCurrentlyTranslating = false;

/**
 * Recursively walks the DOM and replaces all visible text nodes, input placeholders,
 * buttons, tooltips, and attributes with translated equivalents.
 */
export function runUniversalDomTranslation(targetLang: SupportedLanguage): void {
  if (typeof document === "undefined" || !document.body || isCurrentlyTranslating) return;

  isCurrentlyTranslating = true;
  const isEnglish = targetLang === "en";

  try {
    const walk = (node: Node) => {
      // Ignore script, style, code blocks, and SVG paths
      const parent = node.parentElement;
      if (parent) {
        const tag = parent.tagName.toLowerCase();
        if (
          tag === "script" ||
          tag === "style" ||
          tag === "noscript" ||
          tag === "code" ||
          tag === "pre"
        ) {
          return;
        }
      }

      // 1. Handle TEXT_NODE
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
      }
      // 2. Handle ELEMENT_NODE attributes (placeholders, values, tooltips, options)
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // Attribute caching
        if (!originalAttrMap.has(el)) {
          originalAttrMap.set(el, {});
        }
        const cache = originalAttrMap.get(el)!;

        // Placeholders on input / textarea
        if (tag === "input" || tag === "textarea") {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          if (input.placeholder) {
            if (!cache["placeholder"]) cache["placeholder"] = input.placeholder;
            const origPl = cache["placeholder"];
            input.placeholder = isEnglish ? origPl : translateText(origPl, targetLang);
          }

          // Input button values
          if (input.type === "button" || input.type === "submit" || input.type === "reset") {
            if (input.value) {
              if (!cache["value"]) cache["value"] = input.value;
              const origVal = cache["value"];
              input.value = isEnglish ? origVal : translateText(origVal, targetLang);
            }
          }
        }

        // Title tooltips
        if (el.title) {
          if (!cache["title"]) cache["title"] = el.title;
          const origTitle = cache["title"];
          el.title = isEnglish ? origTitle : translateText(origTitle, targetLang);
        }

        // Aria-labels
        const ariaLabel = el.getAttribute("aria-label");
        if (ariaLabel) {
          if (!cache["aria-label"]) cache["aria-label"] = ariaLabel;
          const origAria = cache["aria-label"];
          el.setAttribute("aria-label", isEnglish ? origAria : translateText(origAria, targetLang));
        }

        // Walk children
        for (let child = el.firstChild; child; child = child.nextSibling) {
          walk(child);
        }
      }
    };

    walk(document.body);
  } finally {
    isCurrentlyTranslating = false;
  }
}

let observerInstance: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initializes continuous DOM translation observer so newly mounted views,
 * dialogs, tooltips, and router pages automatically translate smoothly.
 */
export function initUniversalDomObserver(): void {
  if (typeof window === "undefined" || typeof MutationObserver === "undefined") return;

  if (observerInstance) {
    observerInstance.disconnect();
  }

  const trigger = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const lang = getCurrentLanguage();
      if (lang !== "en") {
        runUniversalDomTranslation(lang);
      }
    }, 40);
  };

  observerInstance = new MutationObserver((mutations) => {
    if (isCurrentlyTranslating) return;
    // Only trigger if meaningful nodes were added or modified
    let hasRelevantChanges = false;
    for (const m of mutations) {
      if (m.type === "childList" && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
        hasRelevantChanges = true;
        break;
      }
      if (m.type === "characterData") {
        hasRelevantChanges = true;
        break;
      }
    }
    if (hasRelevantChanges) {
      trigger();
    }
  });

  observerInstance.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Run initial pass
  trigger();
}
