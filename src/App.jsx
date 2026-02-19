import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  User,
  Bot,
  X,
  MessageSquare,
  Landmark,
  Car,
  Briefcase,
  Building,
  ArrowRight,
  Grid,
  Home,
  Menu,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  FileCheck,
  Phone,
  Users,
  Clock,
  Mail,
  Globe,
  Trash2,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: "G-9KDDVB1DVR",
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rawAppId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, "_");

// --- Configuration & Data ---

const SITE_BRAND = {
  name: "LOCALSPHERE",
  domain: ".gov",
  description: "The Unified Citizen Services Portal",
};

const THEME = {
  primary: "bg-blue-700",
  primaryHover: "hover:bg-blue-800",
  secondary: "bg-blue-50",
  text: "text-blue-700",
  border: "border-blue-200",
  gradient: "from-blue-700 to-sky-600",
  chatHeader: "bg-blue-700 text-white",
  userBubble: "bg-blue-700 text-white",
  botAvatar: "bg-blue-700 text-white",
  launcher: "bg-blue-700 hover:bg-blue-800",
};

const SCENARIOS = {
  tax: {
    id: "tax",
    name: "Tax Office",
    brand: "TaxCentral",
    icon: <Landmark size={20} />,
    heroTitle: "Annual Tax Assessment",
    heroSubtitle:
      "Review your obligations and submit required fiscal documentation.",
    querySuggestion: "How to file taxes?",
  },
  vehicle: {
    id: "vehicle",
    name: "Vehicle Services",
    brand: "AutoReg",
    icon: <Car size={20} />,
    heroTitle: "Vehicle Services Portal",
    heroSubtitle: "Renew registrations, pay fines, and manage titles online.",
    querySuggestion: "Renew vehicle registration",
  },
  benefits: {
    id: "benefits",
    name: "Unemployment",
    brand: "LaborAssist",
    icon: <Briefcase size={20} />,
    heroTitle: "Unemployment Assistance",
    heroSubtitle:
      "Supporting the workforce during transitions with financial aid and job placement.",
    querySuggestion: "Apply for child care benefits",
  },
  housing: {
    id: "housing",
    name: "Housing Authority",
    brand: "CityHomes",
    icon: <Home size={20} />,
    heroTitle: "Affordable Housing Initiative",
    heroSubtitle:
      "Connecting families with safe, affordable, and sustainable housing options.",
    querySuggestion: "How to apply for housing?",
  },
};

const CAROUSEL_SLIDES = [
  {
    url: "https://i.ibb.co/q37JWdzN/family-financial-budget-household-planning-income-allocation-expense-tracking-savings-strategy-econo.webp",
    title: "Fiscal Responsibility",
    subtitle: "Transparent local tax allocation.",
  },
  {
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80",
    title: "Infrastructure",
    subtitle: "Building safer, smarter roads.",
  },
  {
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80",
    title: "Public Assemblies",
    subtitle: "Engaging our community through dialogue.",
  },
  {
    url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80",
    title: "Community Welfare",
    subtitle: "Supporting families and local youth programs.",
  },
];

const ICON_MAP = {
  FileText,
  DollarSign,
  Car,
  FileCheck,
  Calendar,
  Home,
  MapPin,
  Landmark,
  Grid,
  Users,
  Phone,
  ExternalLink,
  Mail,
  Globe,
  Briefcase,
  Trash2,
};

// --- Helper: Markdown Link Parser ---
const parseMarkdownLinks = (text) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (match) {
      return (
        <a
          key={index}
          href={match[2]}
          className="text-blue-600 font-bold underline hover:text-blue-800 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// --- Custom NLP API Simulation (Prototype C: Actionable Redirection) ---

async function mockNlpApi(query, scenarioId) {
  const delay = Math.floor(Math.random() * 400) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const text = query.toLowerCase();

  const getRichResponse = (context) => {
    switch (context) {
      case "housing":
        return {
          text: "To apply for housing assistance, start by verifying your eligibility based on [regional income limits](https://www.hud.gov/contactus/public-housing-contacts). Once confirmed, you can submit an initial application to the [Section 8 waitlist](https://www.huduser.gov/portal/datasets/il.html) or view current affordable [listings](https://www.hud.gov/fha) for affordable housing.",
          cards: [
            {
              title: "Apply Now",
              desc: "Submit waitlist form",
              iconName: "Home",
              action: "Apply Now",
              url: "https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/about",
            },
            {
              title: "View Map",
              desc: "Available properties",
              iconName: "MapPin",
              action: "View Map",
              url: "https://www.huduser.gov/portal/maps/hcv/home.html",
            },
          ],
          topics: [
            {
              label: "Income Limit Chart",
              url: "https://www.huduser.gov/portal/datasets/il.html",
            },
            {
              label: "Required Documentation",
              url: "https://www.usa.gov/housing-help-audiences",
            },
            {
              label: "Emergency Housing",
              url: "https://www.hud.gov/findshelter",
            },
          ],
          contact: {
            phone: "555-HOME-SOS",
            email: "housing@localsphere.org",
            hours: "9AM-4PM M-F",
          },
        };
      case "tax":
        return {
          text: "To file your local taxes, start by gathering your income statements (W-2s, 1099s) and previous year's return. Calculate your local deduction, then choose a digital filing option below for immediate processing.",
          cards: [
            {
              title: "Pay Now",
              desc: "Secure portal",
              iconName: "DollarSign",
              action: "Pay Now",
              url: "https://www.irs.gov/payments",
            },
            {
              title: "View Map",
              desc: "Assessment zones",
              iconName: "MapPin",
              action: "View Map",
              url: "https://www.arcgis.com/home/webmap/viewer.html",
            },
          ],
          topics: [
            {
              label: "Download Exemption Forms",
              url: "https://www.irs.gov/forms-instructions",
            },
            {
              label: "Payment Plan Options",
              url: "https://www.irs.gov/payments/payment-plans-installment-agreements",
            },
            { label: "Tax Calendar", url: "https://www.tax.gov/calendar/" },
          ],
          contact: { phone: "555-TAX-HELP", website: "taxes.localsphere.org" },
        };
      case "vehicle":
        return {
          text: "Vehicle registrations must be renewed annually. Ensure your insurance is valid and your emission test is on file before proceeding with the digital renewal portal below.",
          cards: [
            {
              title: "Renew Registration",
              desc: "Digital renewal",
              iconName: "Car",
              action: "Renew Now",
              url: "https://www.usa.gov/car-registration",
            },
            {
              title: "Pay Citation",
              desc: "Parking & Transit fines",
              iconName: "FileCheck",
              action: "Pay Now",
              url: "https://www.ncsc.org/information-and-resources/resource-centers/resource-centers/jury/payment-of-fines",
            },
          ],
          topics: [
            {
              label: "Permit Zone Lookup",
              url: "https://www.transportation.gov/",
            },
            {
              label: "Lost Title Process",
              url: "https://www.usa.gov/replace-car-title",
            },
            {
              label: "Plate Replacement",
              url: "https://www.dmv.org/license-plates.php",
            },
          ],
          contact: { phone: "555-MV-REG", hours: "8AM-4PM" },
        };
      case "benefits":
        return {
          text: "Child care subsidies help cover costs for eligible families. The application requires proof of income and employment. Use the tools below to calculate your tier and find providers.",
          cards: [
            {
              title: "Apply for Subsidy",
              desc: "New claim portal",
              iconName: "Users",
              action: "Apply Now",
              url: "https://www.childcare.gov/consumer-education/financial-assistance-for-families",
            },
            {
              title: "Find Provider",
              desc: "Search database",
              iconName: "MapPin",
              action: "Search",
              url: "https://www.childcare.gov/find-care",
            },
          ],
          topics: [
            {
              label: "Eligibility Calculator",
              url: "https://www.benefits.gov/benefit-finder",
            },
            {
              label: "Provider Quality Ratings",
              url: "https://childcareta.acf.hhs.gov/resource/quality-rating-and-improvement-system-qris-resource-guide",
            },
            {
              label: "Payment Schedule",
              url: "https://www.ssa.gov/pubs/calendar.htm",
            },
          ],
          contact: { phone: "555-AID-SOS", email: "support@localsphere.org" },
        };
      default:
        return null;
    }
  };

  if (
    text.includes("waste") ||
    text.includes("trash") ||
    text.includes("recycling") ||
    text.includes("schedule")
  ) {
    return {
      text: "Waste collection occurs weekly based on your municipal zone. Recycling is collected bi-weekly. Enter your address in the zone locator below to view your specific pickup calendar.",
      cards: [
        {
          title: "Find My Zone",
          desc: "Address lookup",
          iconName: "MapPin",
          action: "Check Schedule",
          url: "https://www.recyclesmartma.org/",
        },
      ],
      topics: [
        {
          label: "Bulk Pickup Request",
          url: "https://www.wm.com/us/en/home/bulk-trash-pickup",
        },
        {
          label: "Holiday Changes",
          url: "https://www.wm.com/us/en/holiday-schedule",
        },
        { label: "Hazardous Waste", url: "https://www.epa.gov/hw" },
      ],
      contact: { phone: "555-DUMP-IT", website: "waste.localsphere.org" },
    };
  }

  if (
    text.match(
      /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/,
    )
  ) {
    return {
      text: "Welcome to LocalSphere. How can I assist you with city services today?",
    };
  }

  let context = scenarioId;
  if (text.includes("hous")) context = "housing";
  else if (text.includes("tax")) context = "tax";
  else if (text.includes("vehicle")) context = "vehicle";
  else if (text.includes("child") || text.includes("benefit"))
    context = "benefits";

  const response = getRichResponse(context);
  if (response) return response;

  return {
    text: "I can assist you with local government services. Please select a department or type your specific question below.",
    cards: [
      {
        title: "Department Directory",
        desc: "View all offices",
        iconName: "Grid",
        action: "Browse",
        url: "https://www.usa.gov/federal-agencies",
      },
    ],
    topics: [
      { label: "Tax Office", url: "https://www.irs.gov" },
      { label: "Transit Services", url: "https://www.transportation.gov" },
      { label: "Social Aid", url: "https://www.benefits.gov" },
      { label: "Housing Help", url: "https://www.hud.gov" },
    ],
  };
}

// --- Components ---

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % CAROUSEL_SLIDES.length),
    [],
  );
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-[380px] overflow-hidden bg-slate-900 rounded-[1.5rem] shadow-xl">
      {CAROUSEL_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-3xl font-bold text-white mb-2">
              {slide.title}
            </h3>
            <p className="text-white/80 text-lg">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-8" : "bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, onCardAction }) => {
  const isUser = message.role === "user";
  const data = message.data || { text: message.content };

  const handleAction = (item) => {
    if (item.url) {
      window.open(item.url, "_blank");
    } else {
      onCardAction(item.title || item.label || item);
    }
  };

  if (isUser) {
    return (
      <div className="flex w-full justify-end mb-6">
        <div className="flex max-w-[85%] flex-row-reverse gap-3">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${THEME.botAvatar} shadow-sm mt-auto`}
          >
            <User size={14} />
          </div>
          <div
            className={`relative p-4 rounded-2xl rounded-tr-none shadow-sm ${THEME.primary} text-white text-sm leading-relaxed`}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start mb-6">
      <div className="flex max-w-[95%] flex-row gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 ${THEME.text} shadow-sm mt-auto`}
        >
          <Bot size={14} />
        </div>
        <div className="flex flex-col gap-3 w-full bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-lg overflow-hidden">
          <div className="p-5 text-sm text-gray-700 leading-relaxed border-b border-gray-50">
            {parseMarkdownLinks(data.text)}
          </div>

          {/* {data.cards && data.cards.length > 0 && (
            <div className="flex flex-col gap-2 px-5 py-2">
              {data.cards.map((card, idx) => {
                const IconComponent = ICON_MAP[card.iconName] || ExternalLink;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAction(card)}
                    className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold shadow-md hover:opacity-90 hover:scale-[1.01] transition-all ${THEME.primary}`}
                  >
                    <IconComponent size={18} />
                    {card.action}
                  </button>
                );
              })}
            </div>
          )} */}

          {/* {data.topics && data.topics.length > 0 && (
            <div className="bg-white px-5 pb-4 pt-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-1">
                Related Topics
              </div>
              <div className="divide-y divide-gray-100">
                {data.topics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(topic)}
                    className={`w-full text-left py-3 text-xs font-semibold ${THEME.text} hover:opacity-80 flex items-center justify-between group transition-colors`}
                  >
                    {topic.label || topic}
                    <ArrowRight
                      size={10}
                      className="text-gray-300 group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </div>
          )} */}

          {/* {data.contact && (
            <div className="bg-slate-50 border-t border-gray-200 p-4 grid grid-cols-2 gap-4">
              {
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <Globe size={12} className="text-blue-600" />{" "}
                  <span className="truncate">
                    {data.contact.website || "localsphere.org"}
                  </span>
                </div>
              }
              {data.contact.phone && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <Phone size={12} className="text-blue-600" />{" "}
                  {data.contact.phone}
                </div>
              )}
              {data.contact.email && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <Mail size={12} className="text-blue-600" />{" "}
                  <span className="truncate">
                    {data.contact.email || "support@localsphere.org"}
                  </span>
                </div>
              )}
              {data.contact.hours && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <Clock size={12} className="text-blue-600" />{" "}
                  <span className="truncate">
                    {data.contact.hours || "9AM-4PM M-F"}
                  </span>
                </div>
              )}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeScenario, setActiveScenario] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const chatEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token)
        await signInWithCustomToken(auth, __initial_auth_token);
      else await signInAnonymously(auth);
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const messagesRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "messages",
    );
    const q = query(messagesRef, where("scenarioId", "==", activeScenario));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map((d) => d.data());
      const msgs = allMsgs
        .filter((m) => m.sessionId === sessionId)
        .sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
        );
      if (msgs.length === 0) {
        const welcome = {
          text:
            activeScenario === "home"
              ? "Welcome to LocalSphere. How can I assist you with city services today?"
              : `Welcome to the ${SCENARIOS[activeScenario].name} assistant.`,
        };
        addDoc(messagesRef, {
          role: "assistant",
          content: welcome.text,
          data: welcome,
          scenarioId: activeScenario,
          sessionId,
          createdAt: serverTimestamp(),
        });
      } else {
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, [user, activeScenario, sessionId]);

  const handleSend = async (e, textOverride) => {
    if (e && e.preventDefault) e.preventDefault();
    const txt = typeof textOverride === "string" ? textOverride : inputValue;
    if (!txt.trim() || !user) return;
    if (!textOverride) setInputValue("");
    setIsTyping(true);
    try {
      const ref = collection(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "messages",
      );
      await addDoc(ref, {
        role: "user",
        content: txt,
        scenarioId: activeScenario,
        sessionId,
        createdAt: serverTimestamp(),
      });
      const resp = await mockNlpApi(txt, activeScenario);
      await addDoc(ref, {
        role: "assistant",
        content: resp.text,
        data: resp,
        scenarioId: activeScenario,
        sessionId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 flex flex-col">
      {/* Navbar - Blue background per screenshot */}
      <nav
        className={`h-16 ${THEME.primary} border-b border-blue-800 sticky top-0 z-50 flex items-center shadow-lg`}
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveScenario("home")}
          >
            <Grid size={22} className="text-white" />
            <span className="font-extrabold text-2xl text-white tracking-tighter">
              LOCALSPHERE
              <span className="text-blue-100 font-normal opacity-80">.gov</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => setActiveScenario("home")}
              className="text-[11px] font-black uppercase tracking-widest text-white hover:text-blue-100"
            >
              Home
            </button>
            {Object.values(SCENARIOS).map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white flex items-center gap-1.5"
              >
                {s.icon}
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col">
        {activeScenario === "home" ? (
          <div className="max-w-7xl mx-auto px-6 py-10 w-full">
            {/* Hero Container (Blue Rounded per image) */}
            <div
              className={`${THEME.primary} rounded-[2.5rem] p-16 text-center text-white mb-12 shadow-2xl relative overflow-hidden`}
            >
              <h1 className="text-6xl font-black mb-4 tracking-tighter">
                WELCOME TO LOCALSPHERE
              </h1>
              <p className="text-2xl opacity-90 mb-10 font-light tracking-tight">
                The Unified Citizen Services Portal
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="px-10 py-5 bg-white text-blue-700 rounded-full font-black shadow-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto uppercase tracking-widest text-sm"
              >
                <MessageSquare size={20} className="fill-blue-700" /> Open
                Assistant
              </button>
            </div>

            <section className="mb-16">
              <Carousel />
            </section>

            {/* Department Grid (4 Column per image) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {Object.values(SCENARIOS).map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setActiveScenario(scen.id)}
                  className="bg-white border border-slate-100 rounded-3xl p-8 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group shadow-sm"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 ${THEME.text} group-hover:${THEME.primary} group-hover:text-white transition-colors`}
                  >
                    {scen.icon}
                  </div>
                  <h3 className="font-black text-xl text-slate-900 mb-2 uppercase tracking-tight">
                    {scen.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {scen.heroSubtitle}
                  </p>
                  <div
                    className={`${THEME.text} font-bold flex items-center gap-1 group-hover:gap-3 transition-all text-xs tracking-widest uppercase`}
                  >
                    ACCESS <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-12 grid grid-cols-2 md:grid-cols-4 gap-12 text-center opacity-80 pb-20">
              <div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  4.2m
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Citizens Served
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  99.9%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Uptime
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  24/7
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Support Access
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  A+
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Security Rating
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-16 w-full">
            <div className="bg-white rounded-3xl shadow-xl p-12 flex flex-col lg:flex-row gap-16 items-center border border-slate-100">
              <div className="flex-1 space-y-8">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-50 ${THEME.text} italic`}
                >
                  Official Department
                </span>
                <h1 className="text-6xl font-black text-slate-900 leading-tight tracking-tighter">
                  {SCENARIOS[activeScenario].heroTitle}
                </h1>
                <p className="text-xl text-slate-500 font-light leading-relaxed">
                  {SCENARIOS[activeScenario].heroSubtitle}
                </p>
                <div className="flex gap-4">
                  <button
                    className={`px-10 py-5 ${THEME.primary} text-white rounded-2xl font-black shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-sm`}
                  >
                    Start Service
                  </button>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="px-10 py-5 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
                  >
                    Consult Assistant
                  </button>
                </div>
              </div>
              <div className="w-full max-w-sm aspect-square bg-slate-50 rounded-[3rem] flex items-center justify-center text-blue-100 shadow-inner">
                {React.cloneElement(SCENARIOS[activeScenario].icon, {
                  size: 160,
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        {isOpen && (
          <div className="w-[90vw] md:w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 border border-gray-100">
            {/* Header */}
            <div
              className={`h-20 ${THEME.primary} p-6 flex items-center justify-between text-white`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight leading-none mb-1">
                    askMe
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-blue-100 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>{" "}
                    Live Support
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="opacity-70 hover:opacity-100 p-1"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-2">
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  message={m}
                  onCardAction={(t) => handleSend(null, t)}
                />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <span className="animate-pulse text-slate-400 font-bold">
                      ...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-slate-100"
            >
              <div className="relative flex items-center border-2 border-blue-600 rounded-[1.5rem] bg-gray-50 p-1 shadow-inner">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full bg-transparent py-3 pl-4 pr-12 text-sm font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 p-2.5 text-slate-300 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
              {activeScenario !== "home" && (
                <button
                  type="button"
                  onClick={() =>
                    setInputValue(SCENARIOS[activeScenario].querySuggestion)
                  }
                  className={`mt-3 text-[10px] font-bold ${THEME.text} hover:opacity-80 w-full text-center flex items-center justify-center gap-1 uppercase tracking-widest`}
                >
                  <HelpCircle size={14} /> Suggestion: "
                  {SCENARIOS[activeScenario].querySuggestion}"
                </button>
              )}
            </form>
          </div>
        )}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white ${THEME.primary} hover:scale-110 transition-all border-2 border-white/20`}
          >
            <MessageSquare size={32} />
          </button>
        )}
      </div>
    </div>
  );
}
