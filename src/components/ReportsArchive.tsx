import React, { useState, useEffect } from 'react';
import { InspectionReport, Station } from '../types';
import { api, isOnline } from '../lib/api';
import { 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye, 
  Edit3, 
  Wifi, 
  WifiOff, 
  AlertCircle 
} from 'lucide-react';

interface ReportsArchiveProps {
  reports: InspectionReport[];
  stations: Station[];
  onEditReport: (report: InspectionReport) => void;
  onDeleteReport: (id: string) => void;
  onRefresh: () => void;
}

export default function ReportsArchive({
  reports,
  stations,
  onEditReport,
  onDeleteReport,
  onRefresh
}: ReportsArchiveProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');
  const [onlineStatus, setOnlineStatus] = useState(isOnline());

  // Track online status changes
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Force sync offline drafts/submissions
  const handleSync = async () => {
    if (!onlineStatus) {
      setSyncResult('Cannot sync. Connection is currently offline.');
      return;
    }

    setSyncing(true);
    setSyncResult('');
    
    try {
      const res = await api.syncOfflineData();
      if (res.success) {
        if (res.syncedCount > 0) {
          setSyncResult(`Successfully synced ${res.syncedCount} offline reports to Siemens server!`);
          onRefresh();
        } else {
          setSyncResult('All site reports are already fully synchronized.');
        }
      }
    } catch (err) {
      setSyncResult('Sync operation failed. Please check backend status.');
    } finally {
      setSyncing(false);
    }
  };

  const pendingCount = reports.filter(r => r.syncStatus === 'pending').length;

  return (
    <div id="reports_archive_panel" className="space-y-6 font-sans animate-fadeIn">
      
      {/* Sync Status Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${onlineStatus ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {onlineStatus ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Connection & Sync Engine</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {onlineStatus 
                ? 'Device is online. Reports will automatically synchronize upon saving.' 
                : 'Device is offline or network is weak. Reports will save securely in Local Storage cache.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              {pendingCount} Pending Sync
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-teal-600 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing...' : 'Sync Offline Cache'}</span>
          </button>
        </div>
      </div>

      {syncResult && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
          syncResult.includes('failed') || syncResult.includes('Cannot')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {syncResult.includes('failed') || syncResult.includes('Cannot') ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          <span>{syncResult}</span>
        </div>
      )}

      {/* Reports Listing */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-150 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Reports Registry</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Track and retrieve archived site walks and inspections</p>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-700">No reports recorded</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">Raise a new Site Inspection or Installation Progress report to populate the registry.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...reports].reverse().map((report) => {
              const stationName = stations.find(s => s.id === report.stationId)?.nameEn || 'Egypt HSR';
              return (
                <div 
                  key={report.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 shrink-0 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{report.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-sans font-medium">
                        Station: <strong>{stationName}</strong> • Lead: {report.engineerName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500 uppercase font-bold">
                          {report.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{report.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Sync status */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                        report.status === 'Draft' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {report.status}
                      </span>

                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase flex items-center gap-1 ${
                        report.syncStatus === 'synced'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                      }`}>
                        {report.syncStatus === 'synced' ? 'Synced' : 'Pending Sync'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'Draft' ? (
                        <button
                          onClick={() => onEditReport(report)}
                          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-teal-600 hover:text-teal-700 rounded-lg transition-all shadow-sm"
                          title="Edit draft report"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onEditReport(report)}
                          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-all shadow-sm"
                          title="View submitted report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteReport(report.id)}
                        className="p-2 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-400 rounded-lg transition-all shadow-sm"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
