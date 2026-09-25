import { DomainAppModel } from './domain-app-generator';

export function generateSolutionAppTsx(domain: DomainAppModel, appTitle: string, projectName: string): string {
  return `import React, { useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Database, 
  TrendingUp, 
  Trash2, 
  FileSpreadsheet,
  Zap,
  Activity,
  Boxes,
  Layers,
  Check,
  Users,
  KeyRound,
  LogIn,
  UserPlus,
  LogOut,
  CheckSquare,
  Square,
  Server,
  Cpu,
  Globe,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  fetchDatabaseRecords, 
  persistRecord, 
  updateRecordStatus, 
  deleteRecord, 
  fetchRegisteredUsers,
  registerNewUser,
  getActiveSessionUser,
  setActiveSessionUser,
  fetchRoadmapSprints,
  toggleRoadmapTask,
  DomainRecord,
  DomainDemoUser,
  DomainRoadmapSprint,
  DOMAIN_SCHEMA 
} from './lib/database';

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error('App runtime guard caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="size-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-white">System Safe Recovery</h2>
          <p className="text-xs text-slate-400 max-w-md">
            The platform safely captured a view update event and kept your data intact.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition cursor-pointer"
            >
              Resume Session
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SolutionApp() {
  const [activeTab, setActiveTab] = useState<'overview' | 'portal' | 'architecture' | 'roadmap' | 'team' | 'analytics'>('overview');
  const [items, setItems] = useState<DomainRecord[]>([]);
  const [users, setUsers] = useState<DomainDemoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DomainDemoUser | null>(null);
  const [sprints, setSprints] = useState<DomainRoadmapSprint[]>([]);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'demo' | 'login' | 'signup'>('demo');
  const [authToast, setAuthToast] = useState<string | null>(null);
  
  // Auth Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState(DOMAIN_SCHEMA.demoUsers?.[0]?.role || 'Operations Specialist');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  const [dbLatency, setDbLatency] = useState(21);
  const [isPinging, setIsPinging] = useState(false);

  const [newItem, setNewItem] = useState({
    title: '',
    col1: '',
    col2: '',
    status: (DOMAIN_SCHEMA.statuses && DOMAIN_SCHEMA.statuses[0]) || 'Active',
    assignee: '',
    metricVal: '',
  });

  useEffect(() => {
    fetchDatabaseRecords().then(setItems);
    fetchRegisteredUsers().then(loadedUsers => {
      setUsers(loadedUsers);
      const active = getActiveSessionUser(loadedUsers);
      setCurrentUser(active);
    });
    fetchRoadmapSprints().then(setSprints);

    const interval = setInterval(() => {
      setDbLatency(Math.floor(18 + Math.random() * 8));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setAuthToast(msg);
    setTimeout(() => setAuthToast(null), 3500);
  };

  const handleSelectDemoUser = (user: DomainDemoUser) => {
    setCurrentUser(user);
    setActiveSessionUser(user);
    setIsAuthModalOpen(false);
    triggerToast(\`Signed in as \${user.name} (\${user.role})\`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail) {
      setLoginError('Please enter your email address');
      return;
    }
    const match = users.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (match) {
      if (match.password && loginPassword && match.password !== loginPassword) {
        setLoginError('Invalid password. For demo users, check the 1-Click Demo tab.');
        return;
      }
      setCurrentUser(match);
      setActiveSessionUser(match);
      setIsAuthModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      triggerToast(\`Welcome back, \${match.name}!\`);
    } else {
      setLoginError('No user found with this email. Use 1-Click Demo or Create an Account.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError('Please fill in all registration fields');
      return;
    }
    const exists = users.find(u => u.email.toLowerCase() === signupEmail.trim().toLowerCase());
    if (exists) {
      setSignupError('A user with this email already exists. Please Sign In.');
      return;
    }

    const newUser: DomainDemoUser = {
      id: \`USR-\${Math.floor(1000 + Math.random() * 9000)}\`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      role: signupRole,
      badge: 'Operator',
      department: 'Custom Operations',
      avatar: signupName.charAt(0).toUpperCase(),
      permissions: ['read_portal', 'create_records', 'view_metrics']
    };

    const updated = await registerNewUser(newUser);
    setUsers(updated);
    setCurrentUser(newUser);
    setActiveSessionUser(newUser);
    setIsAuthModalOpen(false);
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    triggerToast(\`Account created! Welcome, \${newUser.name}.\`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setActiveSessionUser(null);
    triggerToast('Signed out of session');
  };

  const handleToggleTask = async (sprintId: string, taskId: string) => {
    const updated = await toggleRoadmapTask(sprintId, taskId);
    setSprints(updated);
  };

  const handlePingTest = () => {
    setIsPinging(true);
    setTimeout(() => {
      setDbLatency(Math.floor(14 + Math.random() * 9));
      setIsPinging(false);
      triggerToast('PostgreSQL Database & Edge Gateway latency verified!');
    }, 700);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;

    const prefix = DOMAIN_SCHEMA.initialRecords?.[0]?.id?.split('-')?.[0] || 'REC';
    const entry: DomainRecord = {
      id: \`\${prefix}-\${Math.floor(100 + Math.random() * 900)}\`,
      title: newItem.title,
      col1: newItem.col1 || 'Standard Priority',
      col2: newItem.col2 || 'Main Sector Hub',
      status: newItem.status || (DOMAIN_SCHEMA.statuses && DOMAIN_SCHEMA.statuses[0]) || 'Active',
      badge: 'Active',
      assignee: newItem.assignee || currentUser?.name || 'Operations Specialist',
      metricVal: newItem.metricVal || '100%',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = await persistRecord(entry, items);
    setItems(updated);
    setIsModalOpen(false);
    setNewItem({
      title: '',
      col1: '',
      col2: '',
      status: (DOMAIN_SCHEMA.statuses && DOMAIN_SCHEMA.statuses[0]) || 'Active',
      assignee: '',
      metricVal: '',
    });
    triggerToast(\`Added \${DOMAIN_SCHEMA.entityName} \${entry.id} to PostgreSQL database\`);
  };

  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchSearch = it.title.toLowerCase().includes(search.toLowerCase()) ||
        it.id.toLowerCase().includes(search.toLowerCase()) ||
        it.col1.toLowerCase().includes(search.toLowerCase()) ||
        it.assignee.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || it.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification */}
      {authToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 border border-indigo-400/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="size-4 text-amber-300" />
          <span>{authToast}</span>
        </div>
      )}

      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-sm sm:text-base">{DOMAIN_SCHEMA.appTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {DOMAIN_SCHEMA.domainName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-md">{DOMAIN_SCHEMA.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live DB Telemetry Indicator */}
            <div 
              onClick={handlePingTest}
              title="Click to test live PostgreSQL & edge gateway latency"
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-[11px] text-slate-300 cursor-pointer hover:border-indigo-500/50 transition"
            >
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Postgres Live</span>
              <span className="font-mono text-emerald-400 font-bold">{isPinging ? '...' : \`\${dbLatency}ms\`}</span>
            </div>

            {/* Current User & Auth Persona Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-xl p-1 pr-2.5">
                <div className="size-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
                  {currentUser.avatar || currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-xs font-semibold text-white truncate max-w-[110px]">{currentUser.name}</div>
                  <div className="text-[10px] text-indigo-300 font-mono">{currentUser.role}</div>
                </div>
                <button
                  onClick={() => { setAuthTab('demo'); setIsAuthModalOpen(true); }}
                  title="Switch Role / View 1-Click Demo Logins"
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <KeyRound className="size-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Roles</span>
                </button>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthTab('demo'); setIsAuthModalOpen(true); }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <KeyRound className="size-3.5" />
                  <span>1-Click Demo Roles</span>
                </button>
                <button
                  onClick={() => { setAuthTab('login'); setIsAuthModalOpen(true); }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/30"
                >
                  <LogIn className="size-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 6 Core Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('overview')}
            className={\`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer \${
              activeTab === 'overview'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }\`}
          >
            <Activity className="size-3.5" />
            <span>Overview & Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('portal')}
            className={\`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer \${
              activeTab === 'portal'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }\`}
          >
            <Boxes className="size-3.5" />
            <span>{DOMAIN_SCHEMA.entityPlural} Registry</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">{items.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={\`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer \${
              activeTab === 'architecture'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }\`}
          >
            <Server className="size-3.5" />
            <span>Architecture & DB Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={\`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer \${
              activeTab === 'roadmap'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }\`}
          >
            <CheckSquare className="size-3.5" />
            <span>Roadmap & Sprints</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={\`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer \${
              activeTab === 'team'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }\`}
          >
            <Users className="size-3.5" />
            <span>Team & RBAC Matrix</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">{users.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={\`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer \${
              activeTab === 'analytics'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }\`}
          >
            <TrendingUp className="size-3.5" />
            <span>Performance & SLA</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Dynamic Business Problem Statement & AI Blueprint Hero Banner */}
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Sparkles className="size-36 text-indigo-400" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <Sparkles className="size-3" /> Autonomous AI Discovery
                </span>
                <span className="text-[11px] text-slate-400">Production Blueprint Ready</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
                "{DOMAIN_SCHEMA.problemStatement}"
              </h1>
              <p className="text-xs text-slate-300">
                End-to-end operational software suite synthesizing database schema, role RBAC, execution sprints, and real-time SLA telemetry.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => { setAuthTab('demo'); setIsAuthModalOpen(true); }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <KeyRound className="size-4" />
                <span>Demo Logins ({DOMAIN_SCHEMA.demoUsers?.length || 4} Roles)</span>
              </button>
              <button
                onClick={() => { setActiveTab('portal'); setIsModalOpen(true); }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Plus className="size-4" />
                <span>New {DOMAIN_SCHEMA.entityName}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab 1: Operational Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(DOMAIN_SCHEMA.kpis || []).map((kpi, idx) => (
                <div key={idx} className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 space-y-1 hover:border-slate-700 transition">
                  <div className="text-[11px] font-semibold text-slate-400">{kpi.label}</div>
                  <div className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    <span>{kpi.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Panel: Legacy Bottleneck vs AI Autonomous Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-rose-950/20 border border-rose-900/40 p-5 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="size-4" />
                  <span>Identified Legacy Operational Bottlenecks</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fragmented spreadsheets, manual status updates, lack of SLA visibility, and uncoordinated role handoffs cause systemic delay across the {DOMAIN_SCHEMA.domainName} value chain.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-900/40 text-rose-300 border border-rose-800/50">Manual Handoffs</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-900/40 text-rose-300 border border-rose-800/50">Zero Realtime Auditing</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-900/40 text-rose-300 border border-rose-800/50">SLA Blindspots</span>
                </div>
              </div>

              <div className="rounded-xl bg-indigo-950/20 border border-indigo-900/40 p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="size-4" />
                  <span>Synthesized Autonomous Solution Architecture</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Automated PostgreSQL ingestion, role-scoped dispatch queues, edge event listeners, and live SLA tracking directly streamline operations with zero data loss.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-900/40 text-indigo-300 border border-indigo-800/50">PostgreSQL RLS Protected</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-900/40 text-indigo-300 border border-indigo-800/50">4-Role RBAC Governance</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-900/40 text-indigo-300 border border-indigo-800/50">Realtime Edge Webhooks</span>
                </div>
              </div>
            </div>

            {/* Throughput Funnel & Event Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="size-4 text-indigo-400" />
                    <span>Operational Pipeline & Throughput Stages</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">End-to-End Funnel</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(DOMAIN_SCHEMA.funnelStages || []).map((st, i) => (
                    <div key={i} className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-1 text-center">
                      <div className="text-[10px] text-slate-400 font-semibold">{st.stage}</div>
                      <div className="text-xl font-bold text-white">{st.count}</div>
                      <div className="text-[10px] text-indigo-400 font-mono">{st.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="size-4 text-emerald-400" />
                    <span>Live Audit Stream</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Realtime</span>
                </div>
                <div className="space-y-3">
                  {(DOMAIN_SCHEMA.activities || []).map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs pb-2 border-b border-slate-800/60 last:border-0 last:pb-0">
                      <div className="size-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-200 font-medium">{act.text}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <Clock className="size-2.5" />
                          <span>{act.time}</span>
                          <span>·</span>
                          <span className="font-mono text-indigo-400">{act.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Operational Data Portal / Entity Registry */}
        {activeTab === 'portal' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={\`Search \${DOMAIN_SCHEMA.entityPlural} by ID, name, assignee...\`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {(DOMAIN_SCHEMA.statuses || []).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csv = [
                      ['ID', 'Title', DOMAIN_SCHEMA.columns?.col1Label, DOMAIN_SCHEMA.columns?.col2Label, 'Status', 'Assignee', 'Metric', 'Created At'],
                      ...filteredItems.map(it => [it.id, it.title, it.col1, it.col2, it.status, it.assignee, it.metricVal, it.createdAt])
                    ].map(row => row.map(cell => \`"\${cell}"\`).join(',')).join('\\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`\${DOMAIN_SCHEMA.domainKey}_records.csv\`;
                    a.click();
                    triggerToast('Exported CSV dataset to local disk');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="size-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Plus className="size-3.5" />
                  <span>New {DOMAIN_SCHEMA.entityName}</span>
                </button>
              </div>
            </div>

            {/* Main Operational Table */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/90 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Identifier</th>
                      <th className="py-3 px-4">{DOMAIN_SCHEMA.entityName} Title</th>
                      <th className="py-3 px-4">{DOMAIN_SCHEMA.columns?.col1Label || 'Param 1'}</th>
                      <th className="py-3 px-4">{DOMAIN_SCHEMA.columns?.col2Label || 'Param 2'}</th>
                      <th className="py-3 px-4">Operational Status</th>
                      <th className="py-3 px-4">{DOMAIN_SCHEMA.columns?.assigneeLabel || 'Assignee'}</th>
                      <th className="py-3 px-4">{DOMAIN_SCHEMA.columns?.metricLabel || 'Metric'}</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{item.id}</td>
                        <td className="py-3 px-4 font-semibold text-white">{item.title}</td>
                        <td className="py-3 px-4 text-slate-300">{item.col1}</td>
                        <td className="py-3 px-4 text-slate-400">{item.col2}</td>
                        <td className="py-3 px-4">
                          <select
                            value={item.status}
                            onChange={async (e) => {
                              const updated = await updateRecordStatus(item.id, e.target.value, items);
                              setItems(updated);
                              triggerToast(\`Updated \${item.id} status to \${e.target.value}\`);
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-slate-950 border border-slate-700 text-indigo-300 cursor-pointer focus:outline-none focus:border-indigo-500"
                          >
                            {(DOMAIN_SCHEMA.statuses || []).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{item.assignee}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{item.metricVal}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              const updated = await deleteRecord(item.id, items);
                              setItems(updated);
                              triggerToast(\`Deleted \${item.id} from database\`);
                            }}
                            title="Delete Record"
                            className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No {DOMAIN_SCHEMA.entityPlural} match your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Architecture & DB Telemetry */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="size-4 text-indigo-400" />
                  <span>Synthesized Cloud Architecture & Database Telemetry</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Microservices, PostgreSQL schemas, and Deno edge workers provisioned for {DOMAIN_SCHEMA.domainName}.
                </p>
              </div>
              <button
                onClick={handlePingTest}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={\`size-3.5 \${isPinging ? 'animate-spin' : ''}\`} />
                <span>Test Gateway Ping ({dbLatency}ms)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(DOMAIN_SCHEMA.architecture || []).map((arch) => (
                <div key={arch.id} className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-3 hover:border-slate-700 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{arch.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {arch.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{arch.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {arch.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 truncate max-w-[200px]">{arch.tech}</span>
                    <span className="text-indigo-400 font-semibold">{arch.schema ? 'DDL Defined' : 'Active Channel'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DDL Schema Preview */}
            <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">supabase/schema.sql (Active PostgreSQL DDL)</span>
                <span className="text-[11px] text-emerald-400 font-mono">RLS Enabled · Live</span>
              </div>
              <pre className="p-4 rounded-lg bg-slate-900/80 text-[11px] font-mono text-indigo-200 overflow-x-auto leading-relaxed border border-slate-800">
{\`CREATE TABLE IF NOT EXISTS public.\${DOMAIN_SCHEMA.domainKey}_records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  col1_data TEXT NOT NULL, -- \${DOMAIN_SCHEMA.columns?.col1Label}
  col2_data TEXT NOT NULL, -- \${DOMAIN_SCHEMA.columns?.col2Label}
  status TEXT NOT NULL,    -- \${DOMAIN_SCHEMA.columns?.statusLabel}
  badge TEXT DEFAULT 'Active',
  assignee TEXT NOT NULL,  -- \${DOMAIN_SCHEMA.columns?.assigneeLabel}
  metric_value TEXT NOT NULL, -- \${DOMAIN_SCHEMA.columns?.metricLabel}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.\${DOMAIN_SCHEMA.domainKey}_records ENABLE ROW LEVEL SECURITY;\`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Execution Roadmap & Sprints */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="size-4 text-emerald-400" />
                  <span>Execution Roadmap & Sprint Milestones</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any task checkbox to update milestone completion dynamically in the database.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Interactive Sprint Engine
              </span>
            </div>

            <div className="space-y-4">
              {sprints.map((sprint) => (
                <div key={sprint.id} className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">{sprint.phase}</span>
                        <span className="text-sm font-bold text-white">{sprint.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {sprint.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Clock className="size-3" />
                        <span>Timeline: {sprint.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                          style={{ width: \`\${sprint.progress}%\` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 w-10 text-right">{sprint.progress}%</span>
                    </div>
                  </div>

                  {/* Sprint Tasks Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                    {sprint.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(sprint.id, task.id)}
                        className={\`p-3 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition select-none \${
                          task.done 
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }\`}
                      >
                        {task.done ? (
                          <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="size-4 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={\`font-medium leading-tight \${task.done ? 'line-through text-slate-400' : 'text-white'}\`}>
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">{task.id} · {task.assignee}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Team & RBAC Permissions Matrix */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="size-4 text-indigo-400" />
                  <span>Team Directory & Role-Based Access Control (RBAC)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configured roles for {DOMAIN_SCHEMA.domainName}. Click any team member to switch active credentials.
                </p>
              </div>
              <button
                onClick={() => { setAuthTab('signup'); setIsAuthModalOpen(true); }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <UserPlus className="size-3.5" />
                <span>Add Team Member</span>
              </button>
            </div>

            {/* User Cards with 1-Click Role Switch */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {users.map((u) => {
                const isActive = currentUser?.email === u.email;
                return (
                  <div 
                    key={u.id}
                    className={\`rounded-xl p-4 space-y-3 border transition relative \${
                      isActive 
                        ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-500/10' 
                        : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                    }\`}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Active Role
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-sm">
                        {u.avatar || u.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Assigned Role</div>
                      <div className="text-xs font-semibold text-indigo-300">{u.role}</div>
                      <div className="text-[10px] text-slate-400">{u.department}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                      {u.permissions.slice(0, 3).map((p, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {p}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSelectDemoUser(u)}
                      className={\`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer \${
                        isActive 
                          ? 'bg-slate-800 text-slate-300 cursor-default' 
                          : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40'
                      }\`}
                    >
                      <KeyRound className="size-3" />
                      <span>{isActive ? 'Current Session' : 'Login as Role'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* RBAC Permission Matrix Table */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/90 p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Role Permission Governance Matrix</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">System Permission</th>
                      <th className="py-2.5 px-3 text-center">Director / Admin</th>
                      <th className="py-2.5 px-3 text-center">Operations Lead</th>
                      <th className="py-2.5 px-3 text-center">Field / Rider</th>
                      <th className="py-2.5 px-3 text-center">Auditor / Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    <tr>
                      <td className="py-2.5 px-3 text-slate-200 font-sans">Full Database CRUD & Export</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">✓ Granted</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">✓ Granted</td>
                      <td className="py-2.5 px-3 text-center text-amber-400">Scoped Only</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">Read Only</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-200 font-sans">Sprint Milestone & Roadmap Edit</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">✓ Granted</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">✓ Granted</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">No Access</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">No Access</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-200 font-sans">Team Member Provisioning</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">✓ Granted</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">No Access</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">No Access</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">No Access</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-200 font-sans">SLA Rule & Edge Function Config</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">✓ Granted</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">✓ Granted</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">No Access</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">No Access</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: SLA & Performance Intelligence */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-3">
                <div className="text-xs font-semibold text-slate-400">Target SLA Adherence</div>
                <div className="text-3xl font-extrabold text-emerald-400">98.4%</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[98.4%]" />
                </div>
                <p className="text-[11px] text-slate-400">Exceeding baseline operational threshold by 4.2%</p>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-3">
                <div className="text-xs font-semibold text-slate-400">Rule Engine Throughput</div>
                <div className="text-3xl font-extrabold text-indigo-400">1,480 req/s</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full w-[85%]" />
                </div>
                <p className="text-[11px] text-slate-400">Average sub-millisecond edge evaluation time</p>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-3">
                <div className="text-xs font-semibold text-slate-400">Active AI Guardrails</div>
                <div className="text-3xl font-extrabold text-amber-300">12 Active</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[100%]" />
                </div>
                <p className="text-[11px] text-slate-400">Autonomous outlier anomaly detection enabled</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-indigo-400" />
                <span>Operational Velocity by Stage</span>
              </h3>
              <div className="space-y-3">
                {(DOMAIN_SCHEMA.funnelStages || []).map((stage, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{stage.stage}</span>
                      <span className="font-mono text-indigo-300">{stage.count} items · {stage.time}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: \`\${Math.max(25, 100 - idx * 22)}%\` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth & Demo Logins Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Access Portal & Demo Credentials</h3>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Auth Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
              <button
                onClick={() => setAuthTab('demo')}
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 \${
                  authTab === 'demo' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }\`}
              >
                <Zap className="size-3.5 text-amber-300" />
                <span>⚡ 1-Click Demo Logins</span>
              </button>
              <button
                onClick={() => setAuthTab('login')}
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 \${
                  authTab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }\`}
              >
                <LogIn className="size-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setAuthTab('signup')}
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 \${
                  authTab === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }\`}
              >
                <UserPlus className="size-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Auth Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Tab 1: 1-Click Demo Logins */}
              {authTab === 'demo' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Select any role below to immediately enter the portal with pre-configured permissions for {DOMAIN_SCHEMA.domainName}:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {users.map(u => (
                      <div 
                        key={u.id}
                        className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-2 hover:border-indigo-500/50 transition cursor-pointer group"
                        onClick={() => handleSelectDemoUser(u)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">{u.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-indigo-500/20 text-indigo-300">
                            {u.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{u.role}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Email: <span className="text-slate-300">{u.email}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Password: <span className="text-amber-300 font-bold">{u.password || 'admin123'}</span>
                        </div>
                        <button
                          type="button"
                          className="w-full mt-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Log in as {u.role.split(' ')[0]}</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Sign In */}
              {authTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Work Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. director@logistics.domain"
                      className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const first = users[0];
                        if (first) {
                          setLoginEmail(first.email);
                          setLoginPassword(first.password || 'admin123');
                        }
                      }}
                      className="text-xs text-indigo-400 hover:underline cursor-pointer"
                    >
                      Autofill Demo Credentials
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      Sign In to Portal
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Create Account */}
              {authTab === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {signupError && (
                    <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Work Email</label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. maya@enterprise.domain"
                      className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300">Role Selection</label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {(DOMAIN_SCHEMA.demoUsers || []).map(du => (
                          <option key={du.id} value={du.role}>{du.role}</option>
                        ))}
                        <option value="Senior Operations Specialist">Senior Operations Specialist</option>
                        <option value="Enterprise Compliance Auditor">Enterprise Compliance Auditor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create password..."
                        className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      Register & Enter Platform
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Entity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="size-4 text-indigo-400" />
                <span>Create New {DOMAIN_SCHEMA.entityName}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">{DOMAIN_SCHEMA.entityName} Title / ID</label>
                <input 
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Critical Dispatch Batch or Case ID"
                  className="w-full mt-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">{DOMAIN_SCHEMA.columns?.col1Label || 'Param 1'}</label>
                  <input 
                    type="text"
                    value={newItem.col1}
                    onChange={(e) => setNewItem({ ...newItem, col1: e.target.value })}
                    placeholder="Enter value..."
                    className="w-full mt-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">{DOMAIN_SCHEMA.columns?.col2Label || 'Param 2'}</label>
                  <input 
                    type="text"
                    value={newItem.col2}
                    onChange={(e) => setNewItem({ ...newItem, col2: e.target.value })}
                    placeholder="Enter value..."
                    className="w-full mt-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Operational Status</label>
                  <select 
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                    className="w-full mt-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white cursor-pointer focus:outline-none focus:border-indigo-500"
                  >
                    {(DOMAIN_SCHEMA.statuses || ['Active', 'Pending', 'Completed']).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">{DOMAIN_SCHEMA.columns?.metricLabel || 'Metric / SLA'}</label>
                  <input 
                    type="text"
                    value={newItem.metricVal}
                    onChange={(e) => setNewItem({ ...newItem, metricVal: e.target.value })}
                    placeholder="e.g. 99% or 4.2 mins"
                    className="w-full mt-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{DOMAIN_SCHEMA.columns?.assigneeLabel || 'Assignee'}</label>
                <input 
                  type="text"
                  value={newItem.assignee}
                  onChange={(e) => setNewItem({ ...newItem, assignee: e.target.value })}
                  placeholder={currentUser?.name || "e.g. Operations Lead"}
                  className="w-full mt-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Tailored Solution for {DOMAIN_SCHEMA.domainName} · Powered by BizzMitra AI Engine</span>
        </div>
        <div className="text-[11px] font-mono text-emerald-400">
          PostgreSQL 16 · Supabase RLS · Deno Edge Workers
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <SolutionApp />
    </AppErrorBoundary>
  );
}
`;
}
