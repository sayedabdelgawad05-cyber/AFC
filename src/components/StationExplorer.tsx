import React, { useState } from 'react';
import { Station, RFI, NCR, PunchItem, User } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  X,
  PlusCircle,
  FileCheck
} from 'lucide-react';

interface StationExplorerProps {
  station: Station;
  rfis: RFI[];
  ncrs: NCR[];
  punches: PunchItem[];
  currentUser: User | null;
  onBack: () => void;
  onAddRFI: (rfi: Omit<RFI, 'id'>) => void;
  onAddNCR: (ncr: Omit<NCR, 'id'>) => void;
  onAddPunch: (punch: Omit<PunchItem, 'id'>) => void;
  onResolveRFI: (id: string) => void;
  onResolveNCR: (id: string, correctiveAction?: string) => void;
  onResolvePunch: (id: string) => void;
}

type TabType = 'rfis' | 'ncrs' | 'punches';

export default function StationExplorer({
  station,
  rfis,
  ncrs,
  punches,
  currentUser,
  onBack,
  onAddRFI,
  onAddNCR,
  onAddPunch,
  onResolveRFI,
  onResolveNCR,
  onResolvePunch
}: StationExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rfis');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<string | null>(null);
  const [correctiveActionInput, setCorrectiveActionInput] = useState('');

  // Form states for raising new items
  const [newRfiSubject, setNewRfiSubject] = useState('');
  const [newRfiPriority, setNewRfiPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newRfiAssignee, setNewRfiAssignee] = useState('');

  const [newNcrDesc, setNewNcrDesc] = useState('');
  const [newNcrPriority, setNewNcrPriority] = useState<'Minor' | 'Major' | 'Critical'>('Minor');

  const [newPunchDesc, setNewPunchDesc] = useState('');
  const [newPunchCategory, setNewPunchCategory] = useState<'A' | 'B' | 'C'>('C');
  const [newPunchAssignee, setNewPunchAssignee] = useState('');

  // Reset forms helper
  const resetForms = () => {
    setNewRfiSubject('');
    setNewRfiPriority('Medium');
    setNewRfiAssignee('');
    setNewNcrDesc('');
    setNewNcrPriority('Minor');
    setNewPunchDesc('');
    setNewPunchCategory('C');
    setNewPunchAssignee('');
    setShowAddModal(false);
  };

  // Submit handers
  const handleCreateRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfiSubject.trim()) return;
    
    // Generate Siemens standard number format
    const count = rfis.length + 1;
    const rfiNum = `HSR-AFC-RFI-${station.id.replace('st-', '').toUpperCase()}-${String(count).padStart(3, '0')}`;
    
    onAddRFI({
      stationId: station.id,
      number: rfiNum,
      subject: newRfiSubject,
      status: 'Open',
      dateRaised: new Date().toISOString().split('T')[0],
      priority: newRfiPriority,
      assignee: newRfiAssignee || currentUser?.name || 'Ahmed Kamel'
    });
    resetForms();
  };

  const handleCreateNcr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNcrDesc.trim()) return;

    const count = ncrs.length + 1;
    const ncrNum = `HSR-AFC-NCR-${station.id.replace('st-', '').toUpperCase()}-${String(count).padStart(3, '0')}`;

    onAddNCR({
      stationId: station.id,
      number: ncrNum,
      description: newNcrDesc,
      status: 'Open',
      dateRaised: new Date().toISOString().split('T')[0],
      priority: newRfiPriority as any, // Simple casting
    });
    resetForms();
  };

  const handleCreatePunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPunchDesc.trim()) return;

    const count = punches.length + 1;
    const pncNum = `HSR-AFC-PNC-${station.id.replace('st-', '').toUpperCase()}-${String(count).padStart(3, '0')}`;

    onAddPunch({
      stationId: station.id,
      number: pncNum,
      description: newPunchDesc,
      status: 'Open',
      category: newPunchCategory,
      dateRaised: new Date().toISOString().split('T')[0],
      assignee: newPunchAssignee || currentUser?.name || 'Ahmed Kamel'
    });
    resetForms();
  };

  // Filter lists based on state
  const getFilteredItems = () => {
    const q = searchQuery.toLowerCase();
    
    if (activeTab === 'rfis') {
      return rfis.filter(r => {
        const matchesQuery = r.number.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.assignee.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' ? true : r.priority === priorityFilter;
        return matchesQuery && matchesStatus && matchesPriority;
      });
    } else if (activeTab === 'ncrs') {
      return ncrs.filter(n => {
        const matchesQuery = n.number.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' ? true : n.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' ? true : n.priority === priorityFilter;
        return matchesQuery && matchesStatus && matchesPriority;
      });
    } else {
      return punches.filter(p => {
        const matchesQuery = p.number.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.assignee.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' ? true : p.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' ? true : p.category === priorityFilter;
        return matchesQuery && matchesStatus && matchesPriority;
      });
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div id="station_explorer_panel" className="space-y-6 animate-fadeIn">
      {/* Navigation & Station Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg border border-teal-100">
                <MapPin className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{station.nameEn}</h2>
              <span className="text-sm font-semibold text-slate-500 font-sans">({station.nameAr})</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span>{station.type} Installation Base</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span>Overall Progress: <strong className="text-teal-600 font-bold">{station.progress}%</strong></span>
            </p>
          </div>
        </div>

        {/* Progress bar in header */}
        <div className="w-full md:w-64 bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500">Completion</span>
              <span className="text-teal-600 font-bold">{station.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${station.progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('rfis'); setSearchQuery(''); }}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rfis' 
              ? 'border-teal-500 text-teal-600 bg-teal-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>RFIs ({rfis.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('ncrs'); setSearchQuery(''); }}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ncrs' 
              ? 'border-teal-500 text-teal-600 bg-teal-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>NCRs ({ncrs.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('punches'); setSearchQuery(''); }}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'punches' 
              ? 'border-teal-500 text-teal-600 bg-teal-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Punch List ({punches.length})</span>
        </button>
      </div>

      {/* Action Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toUpperCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 text-sm font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
          >
            <option value="All">All {activeTab === 'punches' ? 'Categories' : 'Priorities'}</option>
            {activeTab === 'punches' ? (
              <>
                <option value="A">Category A</option>
                <option value="B">Category B</option>
                <option value="C">Category C</option>
              </>
            ) : (
              <>
                <option value="Low">Low / Minor</option>
                <option value="Medium">Medium / Major</option>
                <option value="High">High / Critical</option>
              </>
            )}
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto md:ml-0 px-4 py-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Raise {activeTab.slice(0, -1).toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Grid or List of items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-slate-500 shadow-sm">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800">No records found</h4>
            <p className="text-xs text-slate-500 mt-1">Try modifying your search or priority filter settings.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition-all shadow-sm space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-teal-600 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                    {item.number}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                    item.status === 'Open' ? 'bg-amber-50 border border-amber-250 text-amber-700' : 'bg-emerald-50 border border-emerald-250 text-emerald-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    activeTab === 'punches' 
                      ? 'bg-slate-50 text-slate-700 border border-slate-200' 
                      : (item as any).priority === 'High' || (item as any).priority === 'Critical'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : (item as any).priority === 'Medium' || (item as any).priority === 'Major'
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {activeTab === 'punches' ? `Cat ${(item as any).category}` : (item as any).priority}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {activeTab === 'rfis' ? (item as any).subject : (item as any).description}
                </h4>
                <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 font-sans">
                  <span>Raised: <strong className="text-slate-750">{(item as any).dateRaised}</strong></span>
                  {item.status === 'Closed' && (item as any).dateClosed && (
                    <span>Closed: <strong className="text-slate-750">{(item as any).dateClosed}</strong></span>
                  )}
                  {activeTab !== 'ncrs' && (
                    <span>Assignee: <strong className="text-slate-750">{(item as any).assignee}</strong></span>
                  )}
                </div>
              </div>

              {/* Actions/Resolution info */}
              {activeTab === 'ncrs' && (item as any).correctiveAction && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Corrective Action / الإجراء التصحيحي</span>
                  <p className="text-xs text-slate-700 italic">{(item as any).correctiveAction}</p>
                </div>
              )}

              {item.status === 'Open' && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  {activeTab === 'ncrs' ? (
                    <button
                      onClick={() => {
                        setShowResolveModal(item.id);
                        setCorrectiveActionInput('');
                      }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Implement Correction & Close</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (activeTab === 'rfis') onResolveRFI(item.id);
                        else onResolvePunch(item.id);
                      }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve & Close</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: Raise / Create New Item */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                Raise New {activeTab.slice(0, -1).toUpperCase()}
              </h3>
              <button 
                onClick={resetForms}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={
                activeTab === 'rfis' ? handleCreateRfi : 
                activeTab === 'ncrs' ? handleCreateNcr : 
                handleCreatePunch
              } 
              className="p-5 space-y-4"
            >
              {activeTab === 'rfis' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subject / الموضوع</label>
                    <input
                      type="text"
                      required
                      value={newRfiSubject}
                      onChange={(e) => setNewRfiSubject(e.target.value)}
                      placeholder="e.g. UPS back-up signal timing specification"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Priority</label>
                      <select
                        value={newRfiPriority}
                        onChange={(e) => setNewRfiPriority(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-700 font-bold"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Assignee</label>
                      <input
                        type="text"
                        value={newRfiAssignee}
                        onChange={(e) => setNewRfiAssignee(e.target.value)}
                        placeholder="Sayed Abdelgawad"
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'ncrs' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Non-Conformance Description / وصف المشكلة</label>
                    <textarea
                      required
                      rows={4}
                      value={newNcrDesc}
                      onChange={(e) => setNewNcrDesc(e.target.value)}
                      placeholder="e.g. Outdoor ticketing gate base is not level with concrete structure, causing minor tilt of gate frame #04..."
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Severity Level</label>
                    <select
                      value={newNcrPriority}
                      onChange={(e) => setNewNcrPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-700 font-bold"
                    >
                      <option value="Minor">Minor Deviation</option>
                      <option value="Major">Major Deficiency</option>
                      <option value="Critical">Critical Failure</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'punches' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Punch Item Description</label>
                    <textarea
                      required
                      rows={3}
                      value={newPunchDesc}
                      onChange={(e) => setNewPunchDesc(e.target.value)}
                      placeholder="e.g. Cosmetic scratch on TVM-03 side plate."
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                      <select
                        value={newPunchCategory}
                        onChange={(e) => setNewPunchCategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-700 font-bold"
                      >
                        <option value="A">Cat A (Prevent commissioning)</option>
                        <option value="B">Cat B (Resolved before handoff)</option>
                        <option value="C">Cat C (Minor aesthetic/cosmetic)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Assignee</label>
                      <input
                        type="text"
                        value={newPunchAssignee}
                        onChange={(e) => setNewPunchAssignee(e.target.value)}
                        placeholder="e.g. Ahmed Kamel"
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-250 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={resetForms}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold rounded-xl text-xs transition-colors"
                >
                  Submit / تسجيل البند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Resolve/Close NCR with corrective action details */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                Implement Corrective Action
              </h3>
              <button 
                onClick={() => setShowResolveModal(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Action Taken to Resolve NCR / الإجراء التصحيحي المنفذ
                </label>
                <textarea
                  required
                  rows={4}
                  value={correctiveActionInput}
                  onChange={(e) => setCorrectiveActionInput(e.target.value)}
                  placeholder="Describe how the problem was resolved (e.g. Replaced cable glands with approved IP67 glands and verified earthing ground loop resistance measures 0.4 Ohms)..."
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (correctiveActionInput.trim()) {
                      onResolveNCR(showResolveModal, correctiveActionInput);
                      setShowResolveModal(null);
                    }
                  }}
                  disabled={!correctiveActionInput.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 font-extrabold rounded-xl text-xs"
                >
                  Verify Correction & Close NCR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
