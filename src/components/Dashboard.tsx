import React from 'react';
import { Station, RFI, NCR, PunchItem } from '../types';
import { 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  MapPin, 
  ArrowRight,
  ShieldAlert,
  Activity
} from 'lucide-react';

interface DashboardProps {
  stations: Station[];
  rfis: RFI[];
  ncrs: NCR[];
  punches: PunchItem[];
  documents?: any[];
  onSelectStation: (stationId: string) => void;
}
export default function Dashboard({
  stations,
  rfis,
  ncrs,
  punches,
  documents = [],
  onSelectStation
}: DashboardProps) {
  // Calculated stats
  const totalStations = stations.length;
  const avgProgress = totalStations > 0 
    ? Math.round(stations.reduce((acc, st) => acc + st.progress, 0) / totalStations) 
    : 0;

  const openRfisCount = rfis.filter(r => r.status === 'Open').length;
  const openNcrsCount = ncrs.filter(n => n.status === 'Open').length;
  const openPunchesCount = punches.filter(p => p.status === 'Open').length;
  
  // Total delayed tasks from stations
  const delayedTasksTotal = stations.reduce((acc, st) => acc + (st.delayedTasksCount || 0), 0);
const totalDocuments = documents.length;

const revisedDocuments = documents.filter(
  doc =>
    doc.revision &&
    doc.revision !== 'A'
).length;

const afcDocuments = documents.filter(
  doc =>
    doc.discipline &&
    doc.discipline.toUpperCase().includes('AFC')
).length;

  // Critical items
  const criticalNcrs = ncrs.filter(n => n.status === 'Open' && n.priority === 'Critical');
  const majorNcrs = ncrs.filter(n => n.status === 'Open' && n.priority === 'Major');

  return (
    <div id="dashboard_panel" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-teal-400" />
              <span>Egypt High Speed Rail Project (Green Line)</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Siemens Mobility Egypt • Integrated AFC Installation & Site Inspection Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl shrink-0 self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-medium text-slate-300">Live Project Sync Active</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{avgProgress}%</span>
            <span className="text-xs text-emerald-600 font-bold">+2.4% this week</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-teal-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${avgProgress}%` }}
            ></div>
          </div>
        </div>

        {/* NCR Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open NCRs</span>
            <div className="p-2 bg-red-50 text-red-500 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{openNcrsCount}</span>
            {criticalNcrs.length > 0 && (
              <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-[10px] text-red-600 rounded-md font-bold animate-pulse">
                {criticalNcrs.length} Critical
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Requires engineering action</span>
          </p>
        </div>

        {/* RFI Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open RFIs</span>
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{openRfisCount}</span>
            <span className="text-xs text-slate-500 font-medium">Pending PM Approval</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Avg. resolution time: 3.5 days</span>
          </p>
        </div>

        {/* Punch List Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Punch Items</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{openPunchesCount}</span>
            <span className="text-xs text-slate-500 font-medium">Active on site</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Delayed Tasks: {delayedTasksTotal}</span>
          </p>
        </div>
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Station Progress List (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Active Stations Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary of installation KPIs per station</p>
            </div>
            <span className="text-xs font-bold font-mono text-slate-500 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              {totalStations} Stations
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {stations.map((st) => (
              <div 
                key={st.id}
                onClick={() => onSelectStation(st.id)}
                className="group p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-teal-500/40 flex items-center justify-center text-slate-500 group-hover:text-teal-600 transition-colors shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-855 group-hover:text-teal-600 transition-colors">
                      {st.nameEn}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">
                       • <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200/60 border border-slate-300/40 rounded text-slate-700">{st.type}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Stats summary */}
                  <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-500">
                    <div className="text-center">
                      <div className="text-teal-600 font-bold">{st.openRFIs}</div>
                      <div className="text-[10px] text-slate-400 uppercase">RFI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-500 font-bold">{st.openNCRs}</div>
                      <div className="text-[10px] text-slate-400 uppercase">NCR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-500 font-bold">{st.openPunches}</div>
                      <div className="text-[10px] text-slate-400 uppercase">PNC</div>
                    </div>
                  </div>

                  {/* Meter circle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative w-11 h-11 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="22" cy="22" r="18" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                        <circle 
                          cx="22" 
                          cy="22" 
                          r="18" 
                          fill="transparent" 
                          stroke="#0d9488" 
                          strokeWidth="3" 
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - st.progress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-slate-800 font-mono">{st.progress}%</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Alerts / Action Center (1 col on desktop) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Attention Required</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Critical & unresolved QA non-conformities</p>

            {/* NCRs timeline */}
            <div className="mt-5 space-y-4">
              {criticalNcrs.length === 0 && majorNcrs.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-sm text-slate-500">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  No critical or major open NCRs at this time. Good job!
                </div>
              ) : (
                [...criticalNcrs, ...majorNcrs].slice(0, 3).map((ncr) => {
                  const sName = stations.find(s => s.id === ncr.stationId)?.nameEn || 'Station';
                  return (
                    <div 
                      key={ncr.id}
                      className="p-3.5 bg-slate-50 border-l-4 border-l-red-500 border-y border-r border-slate-200/80 rounded-r-2xl space-y-2 hover:bg-slate-100/50 transition-all cursor-pointer"
                      onClick={() => onSelectStation(ncr.stationId)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-red-500">{ncr.number}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          ncr.priority === 'Critical' ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-orange-50 text-orange-600 border border-orange-200'
                        }`}>
                          {ncr.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {sName} Installation Deviation
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {ncr.description}
                      </p>
                      {ncr.correctiveAction && (
                        <div className="text-[10px] bg-white border border-slate-200 p-2 rounded text-slate-500 italic">
                          <span className="font-semibold text-slate-700">CA:</span> {ncr.correctiveAction}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-teal-800">Engineering Quick Tip</h4>
              <p className="text-[11px] text-teal-900 leading-relaxed font-medium">
                Before hand-over to civil works or telecommunication inspectors, ensure TVM structures are fully grounded and earthing conductor resistance measures under 1.0 Ohm. Record details under Site Inspection Report.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
