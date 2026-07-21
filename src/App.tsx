import React, { useState, useEffect } from 'react';
import { User, Station, RFI, NCR, PunchItem, InspectionReport } from './types';
import { api, isOnline } from './lib/api';

// Subcomponents
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import StationExplorer from './components/StationExplorer';
import ReportCreator from './components/ReportCreator';
import ReportsArchive from './components/ReportsArchive';
import AdminPanel from './components/AdminPanel';
import AIAssistant from './components/AIAssistant';
import DocumentControl from './components/DocumentControl';

// Icons
import { 
  Activity, 
  MapPin, 
  FileText, 
  History, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Wifi, 
  WifiOff, 
  ShieldAlert,
  HardHat,
  RefreshCw
} from 'lucide-react';


type NavTab =
  | 'dashboard'
  | 'station'
  | 'creator'
  | 'archive'
  | 'assistant'
  | 'documents'
  | 'admin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  
  // Project Live Data
  const [stations, setStations] = useState<Station[]>([]);
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [punches, setPunches] = useState<PunchItem[]>([]);
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [activeStationId, setActiveStationId] = useState<string>('');
  const [activeReportToEdit, setActiveReportToEdit] = useState<InspectionReport | null>(null);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [loading, setLoading] = useState(true);

  // Load all initial project data
  const loadProjectData = async () => {
    setLoading(true);
    try {
      const allStations = await api.getStations();
      setStations(allStations);
      if (allStations.length > 0 && !activeStationId) {
        setActiveStationId(allStations[0].id);
      }

      const allRfis = await api.getRFIs();
      setRfis(allRfis);

      const allNcrs = await api.getNCRs();
      setNcrs(allNcrs);

      const allPunches = await api.getPunches();
      setPunches(allPunches);

      const allReports = await api.getReports();
      setReports(allReports);

      const allUsers = await api.getUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load project database state:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check login and sync on mount
  useEffect(() => {
    const cachedUser = api.getCurrentUser();
    if (cachedUser) {
      setCurrentUser(cachedUser);
    }

    // Monitor connectivity
    const handleOnline = async () => {
      setOnline(true);
      // Attempt background sync when network returns
      await api.syncOfflineData();
      await loadProjectData();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadProjectData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser?.id]);

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // ----------------------------------------
  // CRUD Action Handlers
  // ----------------------------------------

  // RFIs
  const handleAddRFI = async (newRfi: Omit<RFI, 'id'>) => {
    await api.addRFI(newRfi);
    await loadProjectData();
  };

  const handleResolveRFI = async (id: string) => {
    await api.updateRFI(id, { status: 'Closed', dateClosed: new Date().toISOString().split('T')[0] });
    await loadProjectData();
  };

  // NCRs
  const handleAddNCR = async (newNcr: Omit<NCR, 'id'>) => {
    await api.addNCR(newNcr);
    await loadProjectData();
  };

  const handleResolveNCR = async (id: string, correctiveAction?: string) => {
    await api.updateNCR(id, { 
      status: 'Closed', 
      dateClosed: new Date().toISOString().split('T')[0],
      correctiveAction 
    });
    await loadProjectData();
  };

  // Punches
  const handleAddPunch = async (newPunch: Omit<PunchItem, 'id'>) => {
    await api.addPunch(newPunch);
    await loadProjectData();
  };

  const handleResolvePunch = async (id: string) => {
    await api.updatePunch(id, { status: 'Closed', dateResolved: new Date().toISOString().split('T')[0] });
    await loadProjectData();
  };

  // Users CRUD
  const handleAddUser = async (u: User) => {
    await api.addUser(u);
    const updatedUsers = await api.getUsers();
    setUsers(updatedUsers);
  };

  const handleUpdateUser = async (id: string, data: Partial<User>) => {
    await api.updateUser(id, data);
    const updatedUsers = await api.getUsers();
    setUsers(updatedUsers);
  };

  const handleDeleteUser = async (id: string) => {
    await api.deleteUser(id);
    const updatedUsers = await api.getUsers();
    setUsers(updatedUsers);
  };

  // Bulk spreadsheets import handler
  const handleBulkImport = async (type: 'rfi' | 'ncr' | 'punch', items: any[]) => {
    try {
      const res = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, items })
      });
      if (res.ok) {
        await loadProjectData();
      }
    } catch (e) {
      console.warn('Importing locally...', e);
      // Fallback local merge
      if (type === 'rfi') {
        for (const it of items) await api.addRFI(it);
      } else if (type === 'ncr') {
        for (const it of items) await api.addNCR(it);
      } else {
        for (const it of items) await api.addPunch(it);
      }
      await loadProjectData();
    }
  };

  // Reports
  const handleSaveReport = async (report: InspectionReport) => {
    await api.saveReport(report);
    await loadProjectData();
  };

  const handleDeleteReport = async (id: string) => {
    await api.deleteReport(id);
    await loadProjectData();
  };

  // ----------------------------------------
  // Navigation & Render Router
  // ----------------------------------------
  const navigateToStation = (stationId: string) => {
    setActiveStationId(stationId);
    setActiveTab('station');
  };

  const handleEditReport = (report: InspectionReport) => {
    setActiveReportToEdit(report);
    setActiveTab('creator');
  };

  const handleCreateNewReport = () => {
    setActiveReportToEdit(null);
    setActiveTab('creator');
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const activeStation = stations.find(s => s.id === activeStationId) || stations[0];

  

const sidebarItems = [
  { id: 'dashboard', label: 'Project Dashboard', icon: Activity },
  { id: 'station', label: 'Station Explorer', icon: MapPin },
  { id: 'locations', label: 'Station Locations', icon: MapPin },
  { id: 'creator', label: 'Report Creator', icon: FileText, action: handleCreateNewReport },
  { id: 'archive', label: 'Reports Archive', icon: History },
  { id: 'documents', label: 'Document Control', icon: FileText },
  { id: 'assistant', label: 'Engineering AI', icon: MessageSquare },
];


  // Admin section restriction
  if (currentUser.role === 'admin') {
    sidebarItems.push({ id: 'admin', label: 'Admin Controls', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-slate-950">
      
      {/* Mobile Top Navbar Header */}
      <header className="md:hidden shrink-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
            <HardHat className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wide uppercase leading-tight">Egypt HSR</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Siemens Mobility</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${online ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Responsive Sidebar (Persistent Desktop / Overlay Mobile Drawer) */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800/80 z-50 transform md:transform-none transition-transform duration-300 flex flex-col justify-between shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shadow-inner">
                <HardHat className="w-6 h-6" id="hsr_logo" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-wider uppercase leading-tight">Egypt HSR</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Siemens Mobility</p>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id as NavTab);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-3 transition-all ${
                    isActive 
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User info & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4">
          <div className="flex items-center gap-3 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
              <img src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5 capitalize">{currentUser.role} Account</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-sans font-medium">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              <span>{online ? 'Online Mode' : 'Local Cache'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1 hover:text-red-400 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full z-10">
        
        {loading ? (
          <div className="h-[400px] flex flex-col justify-center items-center gap-3">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Loading Project Vault...</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {activeTab === 'dashboard' && (
              <Dashboard 
                stations={stations}
                rfis={rfis}
                ncrs={ncrs}
                punches={punches}
                onSelectStation={navigateToStation}
              />
            )}

            {activeTab === 'station' && activeStation && (
              <StationExplorer 
                station={activeStation}
                rfis={rfis.filter(r => r.stationId === activeStation.id)}
                ncrs={ncrs.filter(n => n.stationId === activeStation.id)}
                punches={punches.filter(p => p.stationId === activeStation.id)}
                currentUser={currentUser}
                onBack={() => setActiveTab('dashboard')}
                onAddRFI={handleAddRFI}
                onAddNCR={handleAddNCR}
                onAddPunch={handleAddPunch}
                onResolveRFI={handleResolveRFI}
                onResolveNCR={handleResolveNCR}
                onResolvePunch={handleResolvePunch}
              />
            )}

            {activeTab === 'creator' && (
              <ReportCreator 
                stations={stations}
                currentUser={currentUser}
                onSaveReport={handleSaveReport}
                activeReport={activeReportToEdit}
                onCloseCreator={() => {
                  setActiveReportToEdit(null);
                  setActiveTab('archive');
                }}
              />
            )}

            
{activeTab === 'archive' && (
  <ReportsArchive 
    reports={reports}
    stations={stations}
    onEditReport={handleEditReport}
    onDeleteReport={handleDeleteReport}
    onRefresh={loadProjectData}
  />
)}

{activeTab === 'locations' && (
  <div className="bg-white border border-slate-200 rounded-3xl p-6">
    <h2 className="text-2xl font-bold mb-6">
      📍 Station Locations
    </h2>

<div className="space-y-4">

  <button
    className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
    onClick={() => window.open('https://maps.app.goo.gl/pKeLbcrqr1sGr5NbA', '_blank')}
  >
    <h3 className="font-bold">Ain Sokhna</h3>
  </button>

  <button
    className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
    onClick={() => window.open('https://maps.app.goo.gl/B81cUjfEw4PA1HfN6', '_blank')}
  >
    <h3 className="font-bold">New Capital</h3>
  </button>

  <button
    className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
    onClick={() => window.open('https://maps.app.goo.gl/wuzbFeQhih8yo8dWA', '_blank')}
  >
    <h3 className="font-bold">
      Mohamed Naguib (Ahmed Omar Hashem)
    </h3>
  </button>

  <button
    className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
    onClick={() => window.open('https://maps.app.goo.gl/JP1BYpHZkMgUZoNC9', '_blank')}
  >
    <h3 className="font-bold">Cairo</h3>
  </button>

  <button
    className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
    onClick={() => window.open('https://maps.app.goo.gl/Fqk9bPv8SvQi2pZi6', '_blank')}
  >
    <h3 className="font-bold">Giza</h3>
  </button>

<button
  className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
  onClick={() => window.open('https://maps.app.goo.gl/ye7uvFqVvqF6axS4A', '_blank')}
>
  <h3 className="font-bold">October Gardens</h3>
</button>

<button
  className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
  onClick={() => window.open('https://maps.app.goo.gl/PJLazQ8mnJHFkFQJ9', '_blank')}
>
  <h3 className="font-bold">6 October</h3>
</button>

<button
  className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
  onClick={() => window.open('https://maps.app.goo.gl/EVmw7YY4trEv1vxH8', '_blank')}
>
  <h3 className="font-bold">Sphinx</h3>
</button>

<button
  className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
  onClick={() => window.open('https://maps.app.goo.gl/PeH584Qnj5rAVeaJ8', '_blank')}
>
  <h3 className="font-bold">Sadat</h3>
</button>

<button
  className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:bg-slate-50"
  onClick={() => window.open('https://maps.app.goo.gl/JaKTeUhavubNzyP46', '_blank')}
>
  <h3 className="font-bold">Wadi El Natrun</h3>
</button>

</div>
  </div>
)}

{activeTab === 'documents' && (
  <DocumentControl />
)}
            {activeTab === 'assistant' && (
              <AIAssistant 
                stations={stations}
                activeStationId={activeStationId}
              />
            )}

            {activeTab === 'admin' && currentUser.role === 'admin' && (
              <AdminPanel 
                users={users}
                stations={stations}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onBulkImport={handleBulkImport}
                onRefresh={loadProjectData}
              />
            )}
          </div>
        )}
      </main>

    </div>
  );
}
