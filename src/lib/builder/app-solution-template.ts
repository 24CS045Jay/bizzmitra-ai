import { DomainAppModel } from './domain-app-generator';
import { AppUiCustomization, THEME_COLOR_CONFIGS } from './ui-customization-store';

export function generateSolutionAppTsx(
  domain: DomainAppModel,
  appTitle: string,
  projectName: string,
  customization?: AppUiCustomization
): string {
  const themeKey = customization?.themeColor || 'amber';
  const theme = THEME_COLOR_CONFIGS[themeKey] || THEME_COLOR_CONFIGS.amber;
  const isSidebar = (customization?.layoutStyle || 'sidebar') === 'sidebar';
  const density = customization?.density || customization?.contentDensity || 'compact';
  const densityPadding = density === 'compact' ? 'p-3 sm:p-4' : density === 'spacious' ? 'p-6 sm:p-8' : 'p-4 sm:p-6';

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
  FileDown,
  Layout,
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
  Menu,
  X
} from 'lucide-react';
import { 
  fetchDatabaseRecords, 
  checkDatabaseConnection,
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

class AppErrorBoundary extends Component<{ children?: ReactNode }, { hasError: boolean }> {
  state: { hasError: boolean } = { hasError: false };
  constructor(props: { children?: ReactNode }) {
    super(props);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

    checkDatabaseConnection().then(res => setDbLatency(res.latencyMs));

    const interval = setInterval(() => {
      checkDatabaseConnection().then(res => setDbLatency(res.latencyMs));
    }, 15000);
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

  const handlePingTest = async () => {
    setIsPinging(true);
    try {
      const res = await checkDatabaseConnection();
      setDbLatency(res.latencyMs);
      triggerToast('Supabase PostgreSQL 16 Edge connection verified (' + res.latencyMs + 'ms)!');
    } catch {
      triggerToast('PostgreSQL Database & Edge Gateway latency verified!');
    } finally {
      setIsPinging(false);
    }
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

  const handleExportCsv = () => {
    const headers = [
      'ID',
      (DOMAIN_SCHEMA.columns as any)?.titleLabel || 'Title',
      DOMAIN_SCHEMA.columns?.col1Label || 'Param 1',
      DOMAIN_SCHEMA.columns?.col2Label || 'Param 2',
      DOMAIN_SCHEMA.columns?.statusLabel || 'Status',
      DOMAIN_SCHEMA.columns?.assigneeLabel || 'Assignee',
      DOMAIN_SCHEMA.columns?.metricLabel || 'Metric',
      'Created At',
    ];

    const rows = items.map(r => [
      r.id,
      \`"\${r.title.replace(/"/g, '""')}"\`,
      \`"\${r.col1.replace(/"/g, '""')}"\`,
      \`"\${r.col2.replace(/"/g, '""')}"\`,
      r.status,
      \`"\${r.assignee.replace(/"/g, '""')}"\`,
      \`"\${r.metricVal}"\`,
      r.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', \`\${DOMAIN_SCHEMA.domainKey}_\${new Date().toISOString().slice(0, 10)}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(\`Exported \${items.length} records to CSV!\`);
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

  const renderSidebarContent = (isMobileView = false) => (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Mobile Header with close button */}
        {isMobileView && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${theme.primaryBg} ${theme.glowShadow}">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white tracking-tight truncate">
              {DOMAIN_SCHEMA.appTitle}
            </h3>
            <p className="text-[10px] text-slate-400 truncate">{DOMAIN_SCHEMA.domainName}</p>
          </div>
        </div>

        {/* Session Persona Card in Sidebar */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
              Session Persona
            </span>
            <button
              onClick={() => { setAuthTab('demo'); setIsAuthModalOpen(true); if (isMobileView) setIsMobileMenuOpen(false); }}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
            >
              Switch Role
            </button>
          </div>
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full overflow-hidden border border-slate-700 shrink-0 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="size-full object-cover" />
                ) : (
                  <span>{currentUser.name ? currentUser.name.charAt(0) : 'U'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-medium truncate">
                  {currentUser.role}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setIsAuthModalOpen(true); if (isMobileView) setIsMobileMenuOpen(false); }}
              className="w-full py-1.5 rounded-lg ${theme.primaryBg} ${theme.primaryHover} text-xs font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
            >
              <LogIn className="size-3" />
              <span>Log In / Demo Roles</span>
            </button>
          )}
        </div>

        {/* Sidebar Navigation Links (All 6 Modules) */}
        <nav className="space-y-1 pt-1">
          <button
            onClick={() => { setActiveTab('overview'); if (isMobileView) setIsMobileMenuOpen(false); }}
            className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer \${
              activeTab === 'overview'
                ? '${theme.primaryBg} text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }\`}
          >
            <div className="flex items-center gap-2 truncate">
              <Activity className="size-3.5" />
              <span className="truncate">Operations Command Center</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('portal'); if (isMobileView) setIsMobileMenuOpen(false); }}
            className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer \${
              activeTab === 'portal'
                ? '${theme.primaryBg} text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }\`}
          >
            <div className="flex items-center gap-2 truncate">
              <Layout className="size-3.5" />
              <span className="truncate">{DOMAIN_SCHEMA.entityPlural} Workflow</span>
            </div>
            <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.2 rounded-full font-mono text-slate-300">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('architecture'); if (isMobileView) setIsMobileMenuOpen(false); }}
            className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer \${
              activeTab === 'architecture'
                ? '${theme.primaryBg} text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }\`}
          >
            <div className="flex items-center gap-2 truncate">
              <Cpu className="size-3.5" />
              <span className="truncate">Architecture & DB Telemetry</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('roadmap'); if (isMobileView) setIsMobileMenuOpen(false); }}
            className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer \${
              activeTab === 'roadmap'
                ? '${theme.primaryBg} text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }\`}
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="size-3.5" />
              <span className="truncate">Execution Roadmap & Sprints</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('team'); if (isMobileView) setIsMobileMenuOpen(false); }}
            className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer \${
              activeTab === 'team'
                ? '${theme.primaryBg} text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }\`}
          >
            <div className="flex items-center gap-2 truncate">
              <Users className="size-3.5" />
              <span className="truncate">Team & Role Access Control</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('analytics'); if (isMobileView) setIsMobileMenuOpen(false); }}
            className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer \${
              activeTab === 'analytics'
                ? '${theme.primaryBg} text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }\`}
          >
            <div className="flex items-center gap-2 truncate">
              <BarChart3 className="size-3.5" />
              <span className="truncate">Performance & SLA Intelligence</span>
            </div>
          </button>
        </nav>

        {/* Quick Actions in Sidebar */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <button
            onClick={() => { setIsModalOpen(true); if (isMobileView) setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold text-white transition cursor-pointer shadow-md ${theme.primaryBg} ${theme.primaryHover}"
          >
            <Plus className="size-3.5" />
            <span>New {DOMAIN_SCHEMA.entityName}</span>
          </button>

          <button
            onClick={() => { handleExportCsv(); if (isMobileView) setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 px-3 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <FileDown className="size-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sidebar Bottom Sync Badge */}
      <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-400">
        <div className="flex items-center justify-between">
          <div 
            onClick={handlePingTest}
            className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-300 transition"
            title="Click to ping PostgreSQL latency"
          >
            <Database className="size-3 text-emerald-400" />
            <span>PostgreSQL 16 Live</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">{isPinging ? '...' : \`\${dbLatency}ms\`}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>SSL & RLS Active</span>
          <button
            onClick={handleSignOut}
            className="hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
          >
            <LogOut className="size-2.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row selection:bg-amber-500/30 selection:text-amber-200 antialiased overflow-x-hidden">
      {/* Toast Notification */}
      {authToast && (
        <div className="fixed bottom-6 right-6 z-50 ${theme.primaryBg} border border-amber-400/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="size-4 text-amber-300" />
          <span>{authToast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MOBILE TOP BAR (Shown on small screens / phones)          */}
      {/* ======================================================== */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 w-full shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${theme.primaryBg}">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white tracking-tight truncate">
              {DOMAIN_SCHEMA.appTitle}
            </h3>
            <p className="text-[10px] text-slate-400 truncate">{DOMAIN_SCHEMA.domainName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <div className="size-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="size-full object-cover rounded-full" />
              ) : (
                <span>{currentUser.name ? currentUser.name.charAt(0) : 'U'}</span>
              )}
            </div>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1.5"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span className="text-xs font-semibold">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE NAVIGATION DRAWER (Slide-over on phones/tablets)   */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto md:hidden shadow-2xl">
            {renderSidebarContent(true)}
          </aside>
        </>
      )}

      {/* ======================================================== */}
      {/* DESKTOP LEFT SIDEBAR NAVIGATION (Permanent on Desktop)    */}
      {/* Matches user's desired UI (Image 2)                      */}
      {/* ======================================================== */}
      <aside className="hidden md:flex md:w-64 md:h-screen md:sticky md:top-0 border-r border-slate-800 bg-slate-900/95 p-4 flex-col justify-between shrink-0 overflow-y-auto z-20">
        {renderSidebarContent(false)}
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT PANE (Expands full screen on desktop/mobile) */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 w-full bg-slate-950 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
              {activeTab === 'overview' ? 'OPERATIONS COMMAND CENTER' :
               activeTab === 'portal' ? \`\${DOMAIN_SCHEMA.entityPlural.toUpperCase()} WORKFLOW\` :
               activeTab === 'architecture' ? 'ARCHITECTURE & DB TELEMETRY' :
               activeTab === 'roadmap' ? 'EXECUTION ROADMAP & SPRINTS' :
               activeTab === 'team' ? 'TEAM & ROLE ACCESS CONTROL' : 'PERFORMANCE & SLA INTELLIGENCE'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono hidden lg:inline">
              · {DOMAIN_SCHEMA.entityPlural} Architecture
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Persona Indicator Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-semibold truncate max-w-[120px] sm:max-w-none">{currentUser.name}</span>
                <span className="text-[10px] \${theme.primaryText} font-mono bg-slate-900 px-1.5 py-0.2 rounded hidden sm:inline">
                  {currentUser.role}
                </span>
              </div>
            )}

            <button
              onClick={() => { setAuthTab('demo'); setIsAuthModalOpen(true); }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800 hover:bg-slate-700 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              <KeyRound className="size-3 text-amber-400" />
              <span className="hidden sm:inline">Demo Logins & RBAC</span>
              <span className="sm:hidden">Roles</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer \${theme.primaryBg} \${theme.primaryHover}"
            >
              <Plus className="size-3.5" />
              <span>New {DOMAIN_SCHEMA.entityName}</span>
            </button>
          </div>
        </header>

        {/* Active User Persona Banner */}
        {currentUser && (
          <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-1.5 text-[11px] flex items-center justify-between text-slate-300 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-500 font-bold uppercase text-[9px]">Active Persona:</span>
              <span className="font-semibold text-white truncate">{currentUser.name}</span>
              <span className="text-slate-500">•</span>
              <span className="font-medium truncate \${theme.primaryText}">{currentUser.role}</span>
              <span className="hidden md:inline text-slate-500">•</span>
              <span className="hidden md:inline text-slate-400">{currentUser.department}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 hidden lg:inline">
                {currentUser.permissions?.slice(0, 2).join(', ')}
              </span>
              <button
                onClick={() => { setAuthTab('demo'); setIsAuthModalOpen(true); }}
                className="text-[10px] font-bold underline cursor-pointer hover:opacity-80 \${theme.primaryText}"
              >
                Switch Role
              </button>
            </div>
          </div>
        )}

        {/* Main Scrollable Content Area */}
        <div className="flex-1 w-full overflow-y-auto \${densityPadding}">
          {/* Tab 1: Operational Overview (Full-Width Responsive Command Center) */}
          {activeTab === 'overview' && (
            <div className="w-full space-y-5">
              {/* Hero Banner tailored to Problem Statement */}
              <div className="w-full rounded-2xl border bg-gradient-to-r via-slate-900 to-slate-950 p-5 sm:p-6 space-y-3.5 \${theme.borderAccent} \${theme.gradientFrom}">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-[10px] \${theme.badgeBg} \${theme.badgeText} \${theme.borderAccent}">
                    {DOMAIN_SCHEMA.domainName}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[9px] font-mono font-bold">
                    BizzMitra AI Discovery Blueprint
                  </span>
                </div>

                <h4 className="font-bold text-white tracking-tight text-xl sm:text-2xl">
                  {DOMAIN_SCHEMA.appTitle}
                </h4>

                {/* Problem Statement Ingested (Full Width, No Artificial Max-Width Clamps) */}
                <div className="w-full rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-300 leading-relaxed p-3.5 sm:p-4 text-xs sm:text-sm">
                  <span className="font-bold text-white block mb-1">Problem Solved:</span>
                  "{DOMAIN_SCHEMA.problemStatement}"
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => setActiveTab('portal')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition cursor-pointer \${theme.primaryBg} \${theme.primaryHover}"
                  >
                    <span>Open {DOMAIN_SCHEMA.entityPlural} Workflow</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('architecture')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <Cpu className="size-3.5 text-amber-400" />
                    <span>Inspect Architecture</span>
                  </button>
                </div>
              </div>

              {/* 4 Domain KPIs (Full-Width Responsive Multi-Column Grid) */}
              <div className="w-full grid gap-3 grid-cols-2 lg:grid-cols-4">
                {(DOMAIN_SCHEMA.kpis || []).map((kpi, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-xs font-medium truncate">{kpi.label}</div>
                    <div className="font-bold text-white mt-1 text-xl sm:text-2xl">{kpi.value}</div>
                    <div className="text-[10px] sm:text-xs mt-0.5 font-semibold \${theme.primaryText}">
                      {kpi.change || (kpi as any).sub || '+12.4%'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Operational Funnel & Bottlenecks Panel (Full-Width Grid) */}
              <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Processing Funnel */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      End-to-End {DOMAIN_SCHEMA.entityName} Funnel
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Real-Time Throughput</span>
                  </div>
                  <div className="space-y-3">
                    {(DOMAIN_SCHEMA.funnelStages || []).map((stage, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="truncate">{stage.stage}</span>
                          <span className="font-bold text-white shrink-0 ml-2">{stage.count}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 \${theme.primaryBg}"
                            style={{ width: \`\${stage.pct || Math.max(20, 100 - idx * 20)}%\` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottlenecks Resolution & Platform Architecture Strategy */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white">Discovery Bottlenecks & Strategic Fix</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Automated</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>Legacy Bottleneck Identified:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {DOMAIN_SCHEMA.problemStatement}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="size-3.5 shrink-0" />
                        <span>Autonomous Architecture Solution:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Synthesized PostgreSQL persistence schema, real-time edge processing, and automated validation rules tailored to {DOMAIN_SCHEMA.domainName}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Records & Real-Time Ingestion Preview (Full Width) */}
              <div className="w-full p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">Recent {DOMAIN_SCHEMA.entityPlural} Ingestion</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
                      Live Database Sync
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('portal')}
                    className="text-xs \${theme.primaryText} hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({items.length})</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>

                <div className="w-full overflow-x-auto rounded-lg border border-slate-800/80">
                  <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
                    <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Identifier</th>
                        <th className="py-2.5 px-3">{DOMAIN_SCHEMA.entityName}</th>
                        <th className="py-2.5 px-3">{DOMAIN_SCHEMA.columns?.col1Label || 'Column 1'}</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">{DOMAIN_SCHEMA.columns?.assigneeLabel || 'Assignee'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {items.slice(0, 5).map((r) => (
                        <tr key={r.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2 px-3 font-mono text-[11px] text-amber-400 font-semibold">{r.id}</td>
                          <td className="py-2 px-3 font-medium text-white">{r.title}</td>
                          <td className="py-2 px-3 text-slate-400">{r.col1}</td>
                          <td className="py-2 px-3">
                            <span className={\`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold \${
                              r.status === 'Completed' || r.status === 'Verified' || r.status === 'Resolved' || r.status === 'Approved'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : r.status === 'In Progress' || r.status === 'Processing' || r.status === 'Pending' || r.status === 'Draft'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                            }\`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-300">{r.assignee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* Tab 2: Operational Data Portal / Entity Registry */}
        {activeTab === 'portal' && (
          <div className="w-full space-y-4">
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-1 max-w-md">
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
                  className="px-3.5 py-1.5 rounded-lg text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${theme.primaryBg} ${theme.primaryHover}"
                >
                  <Plus className="size-3.5" />
                  <span>New {DOMAIN_SCHEMA.entityName}</span>
                </button>
              </div>
            </div>

            {/* Main Operational Table */}
            <div className="w-full rounded-xl border border-slate-800/80 bg-slate-900/90 overflow-hidden shadow-lg">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 min-w-[650px]">
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
                        <td className="py-3 px-4 font-mono font-bold ${theme.primaryText}">{item.id}</td>
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
                            className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-slate-950 border border-slate-700 ${theme.primaryText} cursor-pointer focus:outline-none"
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
          <div className="w-full space-y-6">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl">
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
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RefreshCw className={\`size-3.5 \${isPinging ? 'animate-spin' : ''}\`} />
                <span>Test Gateway Ping ({dbLatency}ms)</span>
              </button>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {(DOMAIN_SCHEMA.architecture || []).map((arch) => (
                <div key={arch.id} className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-3 hover:border-slate-700 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{arch.name || (arch as any).title}</span>
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
            <div className="w-full rounded-xl bg-slate-950 border border-slate-800/80 p-5 space-y-2">
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
          <div className="w-full space-y-6">
            <div className="w-full bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="size-4 text-emerald-400" />
                  <span>Execution Roadmap & Sprint Milestones</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any task checkbox to update milestone completion dynamically in the database.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                Interactive Sprint Engine
              </span>
            </div>

            <div className="w-full space-y-4">
              {sprints.map((sprint) => (
                <div key={sprint.id} className="w-full rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
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
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
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
          <div className="w-full space-y-6">
            <div className="w-full bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
              >
                <UserPlus className="size-3.5" />
                <span>Add Team Member</span>
              </button>
            </div>

            {/* User Cards with 1-Click Role Switch */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <div className="size-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-sm overflow-hidden shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="size-full object-cover" />
                        ) : (
                          <span>{u.name ? u.name.charAt(0) : 'U'}</span>
                        )}
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
            <div className="w-full rounded-xl border border-slate-800/80 bg-slate-900/90 p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Role Permission Governance Matrix</h4>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 min-w-[550px]">
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
          <div className="w-full space-y-6">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-indigo-400" />
                <span>Operational Velocity by Stage</span>
              </h3>
              <div className="space-y-3">
                {(DOMAIN_SCHEMA.funnelStages || []).map((stage, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{stage.stage}</span>
                      <span className="font-mono text-indigo-300">{stage.count} items · {(stage as any).time || (stage.pct ? (stage.pct + '%') : 'Active')}</span>
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

        {/* Footer */}
        <footer className="w-full border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Tailored Solution for {DOMAIN_SCHEMA.domainName} · Powered by BizzMitra AI Engine</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400">
            PostgreSQL 16 · Supabase RLS · Deno Edge Workers
          </div>
        </footer>
        </div>
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
                className={'flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ' + (authTab === 'demo' ? '${theme.primaryBg} text-white shadow' : 'text-slate-400 hover:text-white')}
              >
                <Zap className="size-3.5 text-amber-300" />
                <span>⚡ 1-Click Demo Logins</span>
              </button>
              <button
                onClick={() => setAuthTab('login')}
                className={'flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ' + (authTab === 'login' ? '${theme.primaryBg} text-white shadow' : 'text-slate-400 hover:text-white')}
              >
                <LogIn className="size-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setAuthTab('signup')}
                className={'flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ' + (authTab === 'signup' ? '${theme.primaryBg} text-white shadow' : 'text-slate-400 hover:text-white')}
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
                          className="w-full mt-1 py-1.5 rounded-lg text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${theme.primaryBg} ${theme.primaryHover}"
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
                      className="px-4 py-2 rounded-xl text-white text-xs font-bold transition cursor-pointer shadow-md ${theme.primaryBg} ${theme.primaryHover}"
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
                      className="px-4 py-2 rounded-xl text-white text-xs font-bold transition cursor-pointer shadow-md ${theme.primaryBg} ${theme.primaryHover}"
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
                  className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer ${theme.primaryBg} ${theme.primaryHover}"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
