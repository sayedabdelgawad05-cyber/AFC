import React, { useMemo, useState } from 'react';

type TabType = 'dashboard' | 'risks' | 'safety' | 'vv';

type RiskItem = {
  id: string;
  date: string;
  station: string;
  discipline: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
  targetDate: string;
  status: 'Open' | 'Mitigated' | 'Closed';
};

type SafetyItem = {
  id: string;
  date: string;
  station: string;
  location: string;
  category: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  actionRequired: string;
  owner: string;
  targetDate: string;
  status: 'Open' | 'Closed';
};

type VVItem = {
  id: string;
  date: string;
  station: string;
  requirement: string;
  drawing: string;
  verification: 'Not Started' | 'In Progress' | 'Verified' | 'Failed';
  validation: 'Not Started' | 'In Progress' | 'Validated' | 'Failed';
  evidence: string;
  comments: string;
  status: 'Open' | 'Pending' | 'Closed';
};

const readStorage = <T,>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const writeStorage = <T,>(key: string, value: T[]) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export default function RiskSafetyManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [risks, setRisks] = useState<RiskItem[]>(() =>
    readStorage<RiskItem>('hsr_risk_register')
  );

  const [safetyItems, setSafetyItems] = useState<SafetyItem[]>(() =>
    readStorage<SafetyItem>('hsr_safety_register')
  );

  const [vvItems, setVvItems] = useState<VVItem[]>(() =>
    readStorage<VVItem>('hsr_vv_register')
  );

  const [riskForm, setRiskForm] = useState<RiskItem>({
    id: '',
    date: new Date().toISOString().slice(0, 10),
    station: '',
    discipline: '',
    title: '',
    description: '',
    probability: 1,
    impact: 1,
    mitigation: '',
    owner: '',
    targetDate: '',
    status: 'Open'
  });

  const [safetyForm, setSafetyForm] = useState<SafetyItem>({
    id: '',
    date: new Date().toISOString().slice(0, 10),
    station: '',
    location: '',
    category: 'PPE',
    description: '',
    severity: 'Medium',
    actionRequired: '',
    owner: '',
    targetDate: '',
    status: 'Open'
  });

  const [vvForm, setVvForm] = useState<VVItem>({
    id: '',
    date: new Date().toISOString().slice(0, 10),
    station: '',
    requirement: '',
    drawing: '',
    verification: 'Not Started',
    validation: 'Not Started',
    evidence: '',
    comments: '',
    status: 'Open'
  });

  const riskStats = useMemo(() => {
    const open = risks.filter((r) => r.status === 'Open').length;
    const mitigated = risks.filter((r) => r.status === 'Mitigated').length;
    const closed = risks.filter((r) => r.status === 'Closed').length;
    const high = risks.filter((r) => r.probability * r.impact >= 13).length;
    const critical = risks.filter((r) => r.probability * r.impact >= 20).length;

    return { open, mitigated, closed, high, critical };
  }, [risks]);

  const safetyStats = useMemo(() => {
    const open = safetyItems.filter((s) => s.status === 'Open').length;
    const closed = safetyItems.filter((s) => s.status === 'Closed').length;
    const critical = safetyItems.filter((s) => s.severity === 'Critical').length;
    const high = safetyItems.filter((s) => s.severity === 'High').length;

    return { open, closed, critical, high };
  }, [safetyItems]);

  const vvStats = useMemo(() => {
    const total = vvItems.length;
    const verified = vvItems.filter((v) => v.verification === 'Verified').length;
    const validated = vvItems.filter((v) => v.validation === 'Validated').length;
    const failed = vvItems.filter(
      (v) => v.verification === 'Failed' || v.validation === 'Failed'
    ).length;
    const closed = vvItems.filter((v) => v.status === 'Closed').length;

    return { total, verified, validated, failed, closed };
  }, [vvItems]);

  const riskScore = (item: RiskItem) => item.probability * item.impact;

  const riskLevel = (score: number) => {
    if (score >= 20) return 'Critical';
    if (score >= 13) return 'High';
    if (score >= 6) return 'Medium';
    return 'Low';
  };

  const riskClass = (score: number) => {
    if (score >= 20) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 13) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 6) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const severityClass = (severity: string) => {
    if (severity === 'Critical') return 'bg-red-100 text-red-800 border-red-300';
    if (severity === 'High') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (severity === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const statusClass = (status: string) => {
    if (status === 'Closed') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (status === 'Mitigated' || status === 'Pending') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const addRisk = () => {
    const newItem: RiskItem = {
      ...riskForm,
      id: riskForm.id || `RSK-${String(risks.length + 1).padStart(3, '0')}`
    };

    const updated = [newItem, ...risks];
    setRisks(updated);
    writeStorage('hsr_risk_register', updated);

    setRiskForm({
      id: '',
      date: new Date().toISOString().slice(0, 10),
      station: '',
      discipline: '',
      title: '',
      description: '',
      probability: 1,
      impact: 1,
      mitigation: '',
      owner: '',
      targetDate: '',
      status: 'Open'
    });
  };

  const addSafety = () => {
    const newItem: SafetyItem = {
      ...safetyForm,
      id: safetyForm.id || `SAF-${String(safetyItems.length + 1).padStart(3, '0')}`
    };

    const updated = [newItem, ...safetyItems];
    setSafetyItems(updated);
    writeStorage('hsr_safety_register', updated);

    setSafetyForm({
      id: '',
      date: new Date().toISOString().slice(0, 10),
      station: '',
      location: '',
      category: 'PPE',
      description: '',
      severity: 'Medium',
      actionRequired: '',
      owner: '',
      targetDate: '',
      status: 'Open'
    });
  };

  const addVV = () => {
    const newItem: VVItem = {
      ...vvForm,
      id: vvForm.id || `VV-${String(vvItems.length + 1).padStart(3, '0')}`
    };

    const updated = [newItem, ...vvItems];
    setVvItems(updated);
    writeStorage('hsr_vv_register', updated);

    setVvForm({
      id: '',
      date: new Date().toISOString().slice(0, 10),
      station: '',
      requirement: '',
      drawing: '',
      verification: 'Not Started',
      validation: 'Not Started',
      evidence: '',
      comments: '',
      status: 'Open'
    });
  };

  const deleteRisk = (id: string) => {
    const updated = risks.filter((item) => item.id !== id);
    setRisks(updated);
    writeStorage('hsr_risk_register', updated);
  };

  const deleteSafety = (id: string) => {
    const updated = safetyItems.filter((item) => item.id !== id);
    setSafetyItems(updated);
    writeStorage('hsr_safety_register', updated);
  };

  const deleteVV = (id: string) => {
    const updated = vvItems.filter((item) => item.id !== id);
    setVvItems(updated);
    writeStorage('hsr_vv_register', updated);
  };

  const summaryCards = [
    {
      title: 'Open Risks',
      value: riskStats.open,
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      title: 'High / Critical Risks',
      value: riskStats.high + riskStats.critical,
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    {
      title: 'Open Safety Issues',
      value: safetyStats.open,
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      title: 'Critical Hazards',
      value: safetyStats.critical,
      color: 'text-red-800',
      bg: 'bg-red-50',
      border: 'border-red-300'
    },
    {
      title: 'V&V Items',
      value: vvStats.total,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: 'Failed V&V',
      value: vvStats.failed,
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200'
    }
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Risk, Safety and V&V Management
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Integrated project assurance register for risks, safety observations, hazards, verification and validation.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-xs font-bold">
              Project Assurance Data
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 p-5">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className={`${card.bg} ${card.border} border rounded-xl p-4`}
            >
              <p className="text-xs font-bold text-slate-500 uppercase">
                {card.title}
              </p>
              <p className={`text-3xl font-extrabold mt-2 ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <div className="flex flex-wrap gap-2">
            {[
              ['dashboard', 'Dashboard'],
              ['risks', 'Risk Register'],
              ['safety', 'Safety Observations'],
              ['vv', 'V&V Tracker']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as TabType)}
                className={`px-4 py-2 rounded-lg text-sm font-bold border ${
                  activeTab === key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">Risk Matrix</h3>
              <p className="text-xs text-slate-500 mt-1">
                Probability x Impact overview
              </p>
            </div>

            <div className="p-5 overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-200 p-2 bg-slate-100">
                      Impact / Probability
                    </th>
                    {[1, 2, 3, 4, 5].map((p) => (
                      <th key={p} className="border border-slate-200 p-2 bg-slate-100">
                        P{p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2, 1].map((impact) => (
                    <tr key={impact}>
                      <th className="border border-slate-200 p-2 bg-slate-100">
                        I{impact}
                      </th>
                      {[1, 2, 3, 4, 5].map((probability) => {
                        const score = probability * impact;
                        const count = risks.filter(
                          (r) =>
                            r.probability === probability &&
                            r.impact === impact &&
                            r.status !== 'Closed'
                        ).length;

                        return (
                          <td
                            key={`${impact}-${probability}`}
                            className={`border border-slate-200 p-3 text-center font-extrabold ${riskClass(score)}`}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">Project Assurance Summary</h3>
              <p className="text-xs text-slate-500 mt-1">
                Safety, risk and V&V status
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody>
                  <tr>
                    <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                      Open Risks
                    </th>
                    <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">
                      {riskStats.open}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                      Mitigated Risks
                    </th>
                    <td className="px-4 py-3 border border-slate-200 font-bold text-blue-700">
                      {riskStats.mitigated}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                      Open Safety Issues
                    </th>
                    <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">
                      {safetyStats.open}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                      Closed Safety Issues
                    </th>
                    <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">
                      {safetyStats.closed}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                      Verified Requirements
                    </th>
                    <td className="px-4 py-3 border border-slate-200 font-bold text-blue-700">
                      {vvStats.verified}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                      Validated Requirements
                    </th>
                    <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">
                      {vvStats.validated}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                      Failed V&V Items
                    </th>
                    <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">
                      {vvStats.failed}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">Recommended Assurance Actions</h3>
              <p className="text-xs text-slate-500 mt-1">
                Automatic recommendations based on current safety, risk and V&V data
              </p>
            </div>

            <div className="p-5">
              <ol className="space-y-3">
                {riskStats.critical > 0 && (
                  <li className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                    <span className="w-7 h-7 rounded-lg bg-red-700 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm text-slate-700">
                      Critical risks must be reviewed with project management and mitigation actions should be assigned.
                    </span>
                  </li>
                )}

                {safetyStats.critical > 0 && (
                  <li className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                    <span className="w-7 h-7 rounded-lg bg-red-700 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-sm text-slate-700">
                      Critical safety hazards require immediate action before continuing affected site activities.
                    </span>
                  </li>
                )}

                {vvStats.failed > 0 && (
                  <li className="flex gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <span className="w-7 h-7 rounded-lg bg-orange-700 text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-sm text-slate-700">
                      Failed V&V items should be reviewed and linked with corrective actions before closure.
                    </span>
                  </li>
                )}

                {riskStats.critical === 0 && safetyStats.critical === 0 && vvStats.failed === 0 && (
                  <li className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm text-slate-700">
                      No critical assurance action is currently required.
                    </span>
                  </li>
                )}
              </ol>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">Add Risk Item</h3>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Station" value={riskForm.station} onChange={(e) => setRiskForm({ ...riskForm, station: e.target.value })} />
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Discipline" value={riskForm.discipline} onChange={(e) => setRiskForm({ ...riskForm, discipline: e.target.value })} />
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Risk Title" value={riskForm.title} onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })} />

              <textarea className="md:col-span-3 border border-slate-200 rounded-lg px-3 py-2" placeholder="Risk Description" value={riskForm.description} onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })} />

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={riskForm.probability} onChange={(e) => setRiskForm({ ...riskForm, probability: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>Probability {v}</option>)}
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={riskForm.impact} onChange={(e) => setRiskForm({ ...riskForm, impact: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>Impact {v}</option>)}
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={riskForm.status} onChange={(e) => setRiskForm({ ...riskForm, status: e.target.value as RiskItem['status'] })}>
                <option>Open</option>
                <option>Mitigated</option>
                <option>Closed</option>
              </select>

              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Owner" value={riskForm.owner} onChange={(e) => setRiskForm({ ...riskForm, owner: e.target.value })} />
              <input type="date" className="border border-slate-200 rounded-lg px-3 py-2" value={riskForm.targetDate} onChange={(e) => setRiskForm({ ...riskForm, targetDate: e.target.value })} />
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Mitigation Action" value={riskForm.mitigation} onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })} />

              <button onClick={addRisk} className="md:col-span-3 bg-slate-900 text-white rounded-lg px-4 py-3 font-bold">
                Add Risk
              </button>
            </div>
          </div>

          <RegisterTable
            title="Risk Register"
            headers={['ID', 'Station', 'Discipline', 'Title', 'P', 'I', 'Score', 'Level', 'Owner', 'Target', 'Status', 'Action']}
            rows={risks.map((item) => [
              item.id,
              item.station,
              item.discipline,
              item.title,
              item.probability,
              item.impact,
              riskScore(item),
              <span className={`px-2 py-1 rounded-md border text-xs font-bold ${riskClass(riskScore(item))}`}>{riskLevel(riskScore(item))}</span>,
              item.owner,
              item.targetDate,
              <span className={`px-2 py-1 rounded-md border text-xs font-bold ${statusClass(item.status)}`}>{item.status}</span>,
              <button onClick={() => deleteRisk(item.id)} className="text-red-700 font-bold">Delete</button>
            ])}
          />
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">Add Safety Observation</h3>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Station" value={safetyForm.station} onChange={(e) => setSafetyForm({ ...safetyForm, station: e.target.value })} />
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Location" value={safetyForm.location} onChange={(e) => setSafetyForm({ ...safetyForm, location: e.target.value })} />

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={safetyForm.category} onChange={(e) => setSafetyForm({ ...safetyForm, category: e.target.value })}>
                <option>PPE</option>
                <option>Work at Height</option>
                <option>Electrical Safety</option>
                <option>Fire Safety</option>
                <option>Lifting Operation</option>
                <option>Housekeeping</option>
                <option>Access Control</option>
                <option>Public Safety</option>
                <option>Emergency Response</option>
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={safetyForm.severity} onChange={(e) => setSafetyForm({ ...safetyForm, severity: e.target.value as SafetyItem['severity'] })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={safetyForm.status} onChange={(e) => setSafetyForm({ ...safetyForm, status: e.target.value as SafetyItem['status'] })}>
                <option>Open</option>
                <option>Closed</option>
              </select>

              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Owner" value={safetyForm.owner} onChange={(e) => setSafetyForm({ ...safetyForm, owner: e.target.value })} />

              <textarea className="md:col-span-3 border border-slate-200 rounded-lg px-3 py-2" placeholder="Safety Description" value={safetyForm.description} onChange={(e) => setSafetyForm({ ...safetyForm, description: e.target.value })} />
              <input className="md:col-span-2 border border-slate-200 rounded-lg px-3 py-2" placeholder="Action Required" value={safetyForm.actionRequired} onChange={(e) => setSafetyForm({ ...safetyForm, actionRequired: e.target.value })} />
              <input type="date" className="border border-slate-200 rounded-lg px-3 py-2" value={safetyForm.targetDate} onChange={(e) => setSafetyForm({ ...safetyForm, targetDate: e.target.value })} />

              <button onClick={addSafety} className="md:col-span-3 bg-slate-900 text-white rounded-lg px-4 py-3 font-bold">
                Add Safety Observation
              </button>
            </div>
          </div>

          <RegisterTable
            title="Safety Observations Register"
            headers={['ID', 'Station', 'Location', 'Category', 'Severity', 'Owner', 'Target', 'Status', 'Action']}
            rows={safetyItems.map((item) => [
              item.id,
              item.station,
              item.location,
              item.category,
              <span className={`px-2 py-1 rounded-md border text-xs font-bold ${severityClass(item.severity)}`}>{item.severity}</span>,
              item.owner,
              item.targetDate,
              <span className={`px-2 py-1 rounded-md border text-xs font-bold ${statusClass(item.status)}`}>{item.status}</span>,
              <button onClick={() => deleteSafety(item.id)} className="text-red-700 font-bold">Delete</button>
            ])}
          />
        </div>
      )}

      {activeTab === 'vv' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">Add V&V Item</h3>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Station" value={vvForm.station} onChange={(e) => setVvForm({ ...vvForm, station: e.target.value })} />
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Requirement" value={vvForm.requirement} onChange={(e) => setVvForm({ ...vvForm, requirement: e.target.value })} />
              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Drawing / Document" value={vvForm.drawing} onChange={(e) => setVvForm({ ...vvForm, drawing: e.target.value })} />

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={vvForm.verification} onChange={(e) => setVvForm({ ...vvForm, verification: e.target.value as VVItem['verification'] })}>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Verified</option>
                <option>Failed</option>
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={vvForm.validation} onChange={(e) => setVvForm({ ...vvForm, validation: e.target.value as VVItem['validation'] })}>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Validated</option>
                <option>Failed</option>
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2" value={vvForm.status} onChange={(e) => setVvForm({ ...vvForm, status: e.target.value as VVItem['status'] })}>
                <option>Open</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>

              <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Evidence Reference" value={vvForm.evidence} onChange={(e) => setVvForm({ ...vvForm, evidence: e.target.value })} />
              <textarea className="md:col-span-2 border border-slate-200 rounded-lg px-3 py-2" placeholder="Comments" value={vvForm.comments} onChange={(e) => setVvForm({ ...vvForm, comments: e.target.value })} />

              <button onClick={addVV} className="md:col-span-3 bg-slate-900 text-white rounded-lg px-4 py-3 font-bold">
                Add V&V Item
              </button>
            </div>
          </div>

          <RegisterTable
            title="Verification and Validation Tracker"
            headers={['ID', 'Station', 'Requirement', 'Drawing', 'Verification', 'Validation', 'Evidence', 'Status', 'Action']}
            rows={vvItems.map((item) => [
              item.id,
              item.station,
              item.requirement,
              item.drawing,
              item.verification,
              item.validation,
              item.evidence,
              <span className={`px-2 py-1 rounded-md border text-xs font-bold ${statusClass(item.status)}`}>{item.status}</span>,
              <button onClick={() => deleteVV(item.id)} className="text-red-700 font-bold">Delete</button>
            ])}
          />
        </div>
      )}
    </div>
  );
}

function RegisterTable({
  title,
  headers,
  rows
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Excel-style register for project control and reporting
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="text-left px-4 py-3 border border-slate-200"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 border border-slate-200 font-medium"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-slate-500 border border-slate-200"
                >
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}