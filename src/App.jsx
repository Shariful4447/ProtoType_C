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

// --- Firebase Configuration (Fixed for Preview Environment) ---
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
  botAvatar: "bg-blue-600 text-white",
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

// --- Custom NLP API Simulation ---

async function mockNlpApi(query, scenarioId) {
  const delay = Math.floor(Math.random() * 400) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const text = query.toLowerCase();

  const getRichResponse = (context) => {
    switch (context) {
      case "housing":
        return {
          text: "To apply for housing assistance, start by verifying your eligibility based on [regional income limits](https://www.hud.gov/contactus/public-housing-contacts). Once confirmed, you can submit an initial application to the [Section 8 waitlist](https://www.huduser.gov/portal/datasets/il.html) or view current affordable [listings](https://www.hud.gov/fha) for affordable housing.",
        };
      case "tax":
        return {
          text: "To file your local taxes, start by gathering your income statements (W-2s, 1099s) and previous year's return. Calculate your local deduction, then choose a digital filing option below for immediate processing.",
        };
      default:
        return null;
    }
  };

  if (text.match(/\b(hi|hello|hey|greetings)\b/)) {
    return {
      text: "Welcome to LocalSphere. Welcome to PublicSphere. How can I assist you with city services today?",
    };
  }

  let context = scenarioId;
  if (text.includes("hous")) context = "housing";
  else if (text.includes("tax")) context = "tax";

  const response = getRichResponse(context);
  if (response) return response;

  return {
    text: "I can assist you with local government services. Please select a department or type your specific question below.",
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
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-white" : "bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const data = message.data || { text: message.content };

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
        {/* Linked bot avatar BG to theme variable */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${THEME.botAvatar} shadow-sm mt-auto border border-gray-200`}
        >
          <Bot size={16} />
        </div>
        <div className="flex flex-col gap-3 w-full bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-lg overflow-hidden">
          <div className="p-5 text-sm text-gray-700 leading-relaxed">
            {parseMarkdownLinks(data.text)}
          </div>
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
              ? "Welcome to LocalSphere. Welcome to PublicSphere. How can I assist you with city services today?"
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

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputValue.trim() || !user) return;
    const txt = inputValue;
    setInputValue("");
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
      <nav
        className={`h-16 ${THEME.primary} border-b border-blue-800 sticky top-0 z-50 flex items-center shadow-lg w-full`}
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between text-white">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveScenario("home")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
              <Grid size={22} className="text-white" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tighter uppercase">
              {SITE_BRAND.name}
              <span className="text-blue-100 font-normal opacity-80 lowercase">
                {SITE_BRAND.domain}
              </span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => setActiveScenario("home")}
              className="text-[11px] font-black uppercase tracking-widest hover:text-blue-100"
            >
              Home
            </button>
            {Object.values(SCENARIOS).map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {React.cloneElement(s.icon, { size: 14 })} {s.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col overflow-y-auto">
        {activeScenario === "home" ? (
          <div className="max-w-7xl mx-auto px-6 py-12 w-full">
            <div
              className={`${THEME.primary} rounded-[2.5rem] p-16 md:p-24 text-center text-white mb-16 shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase">
                Welcome to {SITE_BRAND.name}
              </h1>
              <p className="text-2xl opacity-90 mb-12 font-light tracking-tight">
                {SITE_BRAND.description}
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="px-10 py-5 bg-white text-blue-700 rounded-full font-black shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto uppercase tracking-widest text-sm"
              >
                <MessageSquare size={22} className="fill-blue-700" /> Open
                Assistant
              </button>
            </div>
            <section className="mb-20">
              <Carousel />
            </section>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {Object.values(SCENARIOS).map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setActiveScenario(scen.id)}
                  className="bg-white border border-slate-100 rounded-[2rem] p-8 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group shadow-sm"
                >
                  <div className="w-14 h-14 rounded-[1rem] bg-blue-50 flex items-center justify-center mb-8 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                    {React.cloneElement(scen.icon, { size: 30 })}
                  </div>
                  <h3 className="font-black text-xl text-slate-900 mb-3 uppercase tracking-tight">
                    {scen.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8">
                    {scen.heroSubtitle}
                  </p>
                  <div className="text-blue-700 font-black flex items-center gap-2 group-hover:gap-4 transition-all text-[11px] tracking-widest uppercase">
                    ACCESS <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-20 w-full flex-1">
            <div className="bg-white rounded-[3rem] shadow-xl p-16 flex flex-col lg:flex-row gap-16 items-center border border-slate-100">
              <div className="flex-1 space-y-10">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100 italic">
                  Official Government Portal
                </span>
                <h1 className="text-7xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
                  {SCENARIOS[activeScenario].heroTitle}
                </h1>
                <p className="text-2xl text-slate-500 font-light leading-relaxed max-w-2xl">
                  {SCENARIOS[activeScenario].heroSubtitle}
                </p>
                <div className="flex gap-4">
                  <button className="px-10 py-5 bg-blue-700 text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 transition-all uppercase tracking-widest text-sm">
                    Launch Portal
                  </button>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="px-10 py-5 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
                  >
                    Consult Assistant
                  </button>
                </div>
              </div>
              <div className="w-full max-w-sm aspect-square bg-slate-50 rounded-[4rem] flex items-center justify-center text-blue-100 shadow-inner">
                {React.cloneElement(SCENARIOS[activeScenario].icon, {
                  size: 160,
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- Floating Chat Widget --- */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {isOpen && (
          <div className="w-[90vw] md:w-[400px] h-[calc(100vh-140px)] max-h-[650px] bg-white rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 border border-slate-200">
            {/* CHAT HEADER: Redesigned with glassmorphic square icon style */}
            <div
              className={`h-24 ${THEME.primary} p-8 flex items-center justify-between shadow-lg shrink-0`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
                  <Bot size={24} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg leading-none mb-1 text-white tracking-tighter uppercase">
                    askMe
                  </h3>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-100 opacity-80">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>{" "}
                    Live Support
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white opacity-70 hover:opacity-100 transition-opacity p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-3">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <span className="animate-pulse text-slate-400 font-bold italic text-xs">
                      THINKING...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-5 bg-white border-t border-slate-100"
            >
              <div className="relative flex items-center">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full bg-slate-50 border-2 border-blue-600/30 rounded-full py-3.5 pl-6 pr-14 text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 p-2.5 bg-blue-700 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                >
                  <Send size={18} className="rotate-0" />
                </button>
              </div>
            </form>
          </div>
        )}

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-20 h-20 rounded-full shadow-2xl flex items-center justify-center text-white bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 group overflow-hidden"
          >
            <MessageSquare size={36} className="stroke-[1.5px]" />
          </button>
        )}
      </div>
    </div>
  );
}
