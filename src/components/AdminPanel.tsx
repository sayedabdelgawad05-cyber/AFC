import React, { useState } from 'react';
import { User, Station, RFI, NCR, PunchItem } from '../types';
import { api } from '../lib/api';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Database, 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  X, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  stations: Station[];
  onAddUser: (user: User) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onBulkImport: (type: 'rfi' | 'ncr' | 'punch', items: any[]) => void;
  onRefresh: () => void;
}

export default function AdminPanel({
  users,
  stations,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onBulkImport,
  onRefresh
}: AdminPanelProps) {
  // User Form states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [password, setPassword] = useState('');
const [role, setRole] = useState<'admin' | 'engineer'>('engineer');

  const [uiError, setUiError] = useState('');
  const [uiSuccess, setUiSuccess] = useState('');

  // Bulk Import States
  const [importType, setImportType] = useState<'rfi' | 'ncr' | 'punch'>('rfi');
  const [rawCsvInput, setRawCsvInput] = useState('');
  const [importSuccess, setImportSuccess] = useState('');


const resetUserForm = () => {
  setUsername('');
  setName('');
  setEmail('');
  setPhone('');
  setPassword('');
  setRole('engineer');
  setEditingUser(null);
  setUiError('');
  setUiSuccess('');
  setShowAddUserModal(false);
};


  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
if (
  !username.trim() ||
  !name.trim() ||
  !email.trim() ||
  (!editingUser && !password.trim())
) {
  setUiError('Username, password, name, and email are required.');
  return;
}


    if (editingUser) {
      onUpdateUser(editingUser.id, {
        username,
        name,
        email,
        phone,
        role
      });
      setUiSuccess('User updated successfully.');
      setTimeout(() => resetUserForm(), 1000);
    } else {
      // Check duplicate
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        setUiError('Username already exists.');
        return;
      }

      
onAddUser({
  id: 'usr-' + Date.now(),
  username,
  password,
  name,
  email,
  phone,
  role
});
      setUiSuccess('New user added successfully.');
      setTimeout(() => resetUserForm(), 1000);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setShowAddUserModal(true);
  };

  // Pre-load templates helper
  const handleLoadTemplate = () => {
    if (importType === 'rfi') {
      setRawCsvInput(
        `stationId,subject,priority,assignee\n` +
        `st-bea,Ticket Vending Machine base anchoring safety clearance approval,High,Sayed Abdelgawad\n` +
        `st-eal,AFC Gate power source switchboard inspection request,Medium,Ahmed Kamel\n` +
        `st-asx,MDF Fiber optic splitter certification report approval,High,Moustafa El-Shenawy`
      );
    } else if (importType === 'ncr') {
      setRawCsvInput(
        `stationId,description,priority\n` +
        `st-alx,MDF rack is missing vertical earthing link wire to main ground bar,Major\n` +
        `st-oct,Outdoor TVM-02 canopy has loose steel screws causing rattle,Minor\n` +
        `st-bea,Cabling trays installed along corridor A are missing steel covers,Major`
      );
    } else {
      setRawCsvInput(
        `stationId,description,category,assignee\n` +
        `st-eal,Ticket Vending Machine display has cosmetic water streak,C,Ahmed Kamel\n` +
        `st-bea,MDF main door requires clean keys and visual lock,B,Sayed Abdelgawad\n` +
        `st-oct,Backup UPS battery lacks initial charge test stamp,A,Ahmed Kamel`
      );
    }
  };

  const handleImport = () => {
    if (!rawCsvInput.trim()) {
      setImportSuccess('Error: Please load or paste CSV sheet data first.');
      return;
    }

    try {
      const lines = rawCsvInput.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) throw new Error('Data sheet must contain a header and at least one record.');

      const headers = lines[0].split(',').map(h => h.trim());
      const items: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const item: any = {};
        
        headers.forEach((h, idx) => {
          item[h] = values[idx] || '';
        });

        // Add standard fields
        item.status = 'Open';
        item.dateRaised = new Date().toISOString().split('T')[0];

        // Assign numeric standard identifiers
        const uniqueId = Math.floor(Math.random() * 1000);
        if (importType === 'rfi') {
          item.number = `HSR-AFC-RFI-IMP-${uniqueId}`;
        } else if (importType === 'ncr') {
          item.number = `HSR-AFC-NCR-IMP-${uniqueId}`;
        } else {
          item.number = `HSR-AFC-PNC-IMP-${uniqueId}`;
        }

        items.push(item);
      }

      onBulkImport(importType, items);
      setImportSuccess(`Successfully imported ${items.length} records! Station KPIs and Project charts updated.`);
      setRawCsvInput('');
      onRefresh();
    } catch (err: any) {
      setImportSuccess(`Import failed: ${err.message}`);
    }
  };

  return (
    <div id="admin_panel" className="space-y-6 font-sans animate-fadeIn">
      
      {/* Split views: User management & Excel import simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Accounts list */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">User Access Control</h3>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setShowAddUserModal(true);
                }}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            {/* List users */}
            <div className="space-y-3">
              {users.map((u) => (
                <div 
                  key={u.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-between gap-3 transition-colors shadow-sm animate-fadeIn"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden shadow-sm">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Users className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        {u.name}
                        {u.role === 'admin' && (
                          <span className="p-1 bg-teal-50 text-teal-700 border border-teal-100 rounded text-[9px] font-extrabold uppercase flex items-center gap-0.5 shrink-0 shadow-sm">
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5 font-medium">
                        Username: {u.username} • {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-950 border border-slate-200 rounded-lg shadow-sm transition-colors"
                      title="Edit Account"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>


<button
  onClick={() => {
    if (window.confirm(`Reset password for ${u.name}?`)) {
      onUpdateUser(u.id, {
        password: '123456'
      });
    }
  }}
  className="p-1.5 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-lg shadow-sm transition-colors"
  title="Reset Password"
>
  Reset
</button>

                    <button
                      onClick={() => onDeleteUser(u.id)}
                      disabled={u.id === 'usr-1' || u.id === 'usr-3'} // Guard primary admins
                      className="p-1.5 bg-white hover:bg-slate-50 hover:text-red-600 border border-slate-200 text-slate-400 rounded-lg disabled:opacity-30 shadow-sm transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150 mt-6 text-[11px] text-slate-500 font-medium leading-relaxed font-sans">
            Note: Administrators have full clearance to formulate, delete, or resolve NCR/RFI records across all HSR stations, as well as managing inspector authorization credentials.
          </div>
        </div>

        {/* Database Excel / Sheets CSV Simulator */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Data Sheet Import Simulator</h3>
              </div>
              <span className="text-[10px] text-slate-500 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold shadow-sm">
                Excel / Google Sheets Integration
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mb-4">
              Simulate bulk uploading active sheets directly from contractors. Choose the document layout, load a structured Siemens template, and click Import to instantly merge records.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <select
                  value={importType}
                  onChange={(e) => {
                    setImportType(e.target.value as any);
                    setRawCsvInput('');
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500 font-bold shadow-sm"
                >
                  <option value="rfi">RFIs CSV Sheet</option>
                  <option value="ncr">NCRs CSV Sheet</option>
                  <option value="punch">Punch List Sheet</option>
                </select>

                <button
                  type="button"
                  onClick={handleLoadTemplate}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-teal-600 hover:text-teal-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-all shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Load Siemens Sheet Template</span>
                </button>
              </div>

              {/* Paste Text Area */}
              <textarea
                rows={6}
                value={rawCsvInput}
                onChange={(e) => setRawCsvInput(e.target.value)}
                placeholder="Paste CSV rows here or click 'Load Siemens Sheet Template' above to load a mock sheet..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-teal-500 font-mono leading-relaxed placeholder:text-slate-400 shadow-sm"
              />

              {importSuccess && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                  importSuccess.includes('failed') || importSuccess.includes('Error')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {importSuccess.includes('failed') || importSuccess.includes('Error') ? <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150 mt-6 flex justify-end">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import & Sync Data</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: Add / Edit User Form */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                {editingUser ? 'Edit User Credentials' : 'Create New User Account'}
              </h3>
              <button 
                onClick={resetUserForm}
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateUser} className="p-5 space-y-4">
              
              {uiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{uiError}</span>
                </div>
              )}

              {uiSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{uiSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Username / اسم المستخدم</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. moustafa"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 disabled:opacity-40 font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name / الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Moustafa El-Shenawy"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email / البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. m.elshenawy@siemens.com"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>

<div>
  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
    Password
  </label>

  <input
    type="password"
    required={!editingUser}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter password"
    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
  />
</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100..."
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Authorization Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-700 font-bold"
                  >
                    <option value="engineer">Site Inspector / Engineer</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-150 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={resetUserForm}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs shadow-sm"
                >
                  {editingUser ? 'Apply Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
