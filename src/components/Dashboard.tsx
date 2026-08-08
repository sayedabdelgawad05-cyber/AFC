import React from 'react';
import { Station, RFI, NCR, PunchItem } from '../types';

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
  const safeParse = (key: string): any[] => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  const observations = safeParse('hsr_observations');
  const drawings = safeParse('hsr_drawings');

const riskRegister = safeParse('hsr_risk_register');
const safetyRegister = safeParse('hsr_safety_register');
const vvRegister = safeParse('hsr_vv_register');

const openRisks = riskRegister.filter((item: any) => item.status === 'Open').length;
const mitigatedRisks = riskRegister.filter((item: any) => item.status === 'Mitigated').length;
const closedRisks = riskRegister.filter((item: any) => item.status === 'Closed').length;

const highRisks = riskRegister.filter(
  (item: any) => Number(item.probability || 0) * Number(item.impact || 0) >= 13
).length;

const criticalRisks = riskRegister.filter(
  (item: any) => Number(item.probability || 0) * Number(item.impact || 0) >= 20
).length;

const openSafetyIssues = safetyRegister.filter((item: any) => item.status === 'Open').length;
const closedSafetyIssues = safetyRegister.filter((item: any) => item.status === 'Closed').length;
const criticalSafetyIssues = safetyRegister.filter((item: any) => item.severity === 'Critical').length;

const totalVVItems = vvRegister.length;
const verifiedVVItems = vvRegister.filter((item: any) => item.verification === 'Verified').length;
const validatedVVItems = vvRegister.filter((item: any) => item.validation === 'Validated').length;
const failedVVItems = vvRegister.filter(
  (item: any) => item.verification === 'Failed' || item.validation === 'Failed'
).length;

  const totalStations = stations.length;

  const avgProgress =
    totalStations > 0
      ? Math.round(
          stations.reduce((acc, st: any) => acc + (st.progress || 0), 0) /
            totalStations
        )
      : 0;

  const openRfisCount = rfis.filter((r: any) => r.status === 'Open').length;
  const closedRfisCount = rfis.filter((r: any) => r.status === 'Closed').length;

  const openNcrsCount = ncrs.filter((n: any) => n.status === 'Open').length;
  const closedNcrsCount = ncrs.filter((n: any) => n.status === 'Closed').length;

  const openPunchesCount = punches.filter((p: any) => p.status === 'Open').length;
  const closedPunchesCount = punches.filter((p: any) => p.status === 'Closed').length;

  const openObservations = observations.filter(
    (item: any) => item.status === 'Open'
  ).length;

  const closedObservations = observations.filter(
    (item: any) => item.status === 'Closed'
  ).length;

  const delayedTasksTotal = stations.reduce(
    (acc, st: any) => acc + (st.delayedTasksCount || 0),
    0
  );

  const totalDocuments = documents.length;

  const afcDocuments = documents.filter((doc: any) =>
    String(doc.discipline || '').toUpperCase().includes('AFC')
  ).length;

  const revisedDocuments = documents.filter(
    (doc: any) => doc.revision && doc.revision !== 'A'
  ).length;

  const totalDrawingRecords = drawings.length;

  const ifcDrawingRecords = drawings.filter(
    (item: any) => item.status === 'IFC'
  ).length;

  const underReviewDrawingRecords = drawings.filter(
    (item: any) => item.status === 'Under Review'
  ).length;

  const supersededDrawingRecords = drawings.filter(
    (item: any) => item.status === 'Superseded'
  ).length;

const totalDataRecords =
  totalDocuments +
  observations.length +
  rfis.length +
  ncrs.length +
  punches.length +
  drawings.length +
  riskRegister.length +
  safetyRegister.length +
  vvRegister.length;


  const totalOpenActionItems =
    openObservations + openRfisCount + openNcrsCount + openPunchesCount;

  const totalClosedActionItems =
    closedObservations + closedRfisCount + closedNcrsCount + closedPunchesCount;

  const projectClosureRate =
    totalOpenActionItems + totalClosedActionItems > 0
      ? Math.round(
          (totalClosedActionItems /
            (totalOpenActionItems + totalClosedActionItems)) *
            100
        )
      : 0;

  const stationRiskScores = stations.map((st: any) => {
    const openNCRs = st.openNCRs || 0;
    const openRFIs = st.openRFIs || 0;
    const openPunches = st.openPunches || 0;

    const riskScore = openNCRs * 5 + openRFIs * 2 + openPunches;
    const readiness = Math.max(0, Math.min(100, (st.progress || 0) - riskScore));

    return {
      ...st,
      riskScore,
      readiness
    };
  });

  const topRiskStations = [...stationRiskScores]
    .sort((a: any, b: any) => b.riskScore - a.riskScore)
    .slice(0, 10);

  const stationObservationCounts: Record<string, number> = {};

  observations.forEach((item: any) => {
    if (item.status !== 'Open') return;

    const stationName = item.station || 'Unknown Station';
    stationObservationCounts[stationName] =
      (stationObservationCounts[stationName] || 0) + 1;
  });

  const topObservationStation = Object.entries(stationObservationCounts).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  )[0];

  const observationDisciplineCounts: Record<string, number> = {};

  observations.forEach((item: any) => {
    const discipline = item.discipline || 'Unknown';
    observationDisciplineCounts[discipline] =
      (observationDisciplineCounts[discipline] || 0) + 1;
  });

  const topObservationDiscipline = Object.entries(observationDisciplineCounts).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  )[0];

  const documentDisciplineCounts: Record<string, number> = {};

  documents.forEach((doc: any) => {
    const discipline = doc.discipline || doc.type || 'Unknown';
    documentDisciplineCounts[discipline] =
      (documentDisciplineCounts[discipline] || 0) + 1;
  });

  const topDocumentDiscipline = Object.entries(documentDisciplineCounts).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  )[0];

  const observationPatternMap: Record<string, number> = {};

  observations.forEach((item: any) => {
    const key = item.observation
      ?.toLowerCase()
      ?.replace(/[^\w\s]/g, '')
      ?.split(' ')
      ?.slice(0, 8)
      ?.join(' ');

    if (!key) return;

    observationPatternMap[key] = (observationPatternMap[key] || 0) + 1;
  });

  const mostRepeatedObservation = Object.entries(observationPatternMap).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  )[0];

  const lessonsLearnedCount = Object.entries(observationPatternMap).filter(
    ([, count]) => Number(count) > 1
  ).length;

  const engineeringHealthScore =
    stationRiskScores.length > 0
      ? Math.round(
          stationRiskScores.reduce(
            (acc: number, st: any) => acc + st.readiness,
            0
          ) / stationRiskScores.length
        )
      : 0;

  const engineeringRiskIndex = Math.min(
    100,
    Math.round(
      openNcrsCount * 5 +
        openRfisCount * 2 +
        openObservations +
        openPunchesCount +
        delayedTasksTotal
    )
  );

  const recommendedActions: string[] = [];

  if (openNcrsCount > 0) {
    recommendedActions.push('Prioritize closure of open NCRs before increasing installation progress.');
  }

  if (openRfisCount > 0) {
    recommendedActions.push('Review open RFIs with design and engineering teams.');
  }

  if (openObservations > 0) {
    recommendedActions.push('Focus on closing open site observations by station priority.');
  }

  if (delayedTasksTotal > 0) {
    recommendedActions.push('Review delayed tasks and update target dates.');
  }

if (criticalRisks > 0) {
  recommendedActions.push('Review critical project risks and assign mitigation owners.');
}

if (openSafetyIssues > 0) {
  recommendedActions.push('Close open safety observations before continuing affected site activities.');
}

if (failedVVItems > 0) {
  recommendedActions.push('Review failed V&V items and define corrective actions.');
}

  if (mostRepeatedObservation) {
    recommendedActions.push(`Resolve repeated issue pattern: ${mostRepeatedObservation[0]}.`);
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('No critical engineering action is currently required.');
  }

  const getStationName = (station: any) => {
    return station.nameEn || station.name || 'Unknown Station';
  };

  const getStatusClass = (value: number) => {
    if (value >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (value >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusText = (value: number) => {
    if (value >= 80) return 'Good';
    if (value >= 60) return 'Watch';
    return 'Critical';
  };

  return (
    <div id="dashboard_panel" className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Egypt HSR AFC Project Dashboard
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Executive summary in Excel-style format for quick project review
              </p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-3 py-2 rounded-lg text-xs font-bold">
              Live Project Data
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <tbody>
              <tr className="bg-slate-100">
                <th className="text-left px-4 py-3 border border-slate-200">Total Stations</th>
                <td className="px-4 py-3 border border-slate-200 font-bold">{totalStations}</td>

                <th className="text-left px-4 py-3 border border-slate-200">Overall Progress</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-teal-700">{avgProgress}%</td>

                <th className="text-left px-4 py-3 border border-slate-200">Engineering Health</th>
                <td className="px-4 py-3 border border-slate-200 font-bold">
                  <span className={`px-2 py-1 rounded-md border ${getStatusClass(engineeringHealthScore)}`}>
                    {engineeringHealthScore}% {getStatusText(engineeringHealthScore)}
                  </span>
                </td>
              </tr>

              <tr>
                <th className="text-left px-4 py-3 border border-slate-200">Total Records</th>
                <td className="px-4 py-3 border border-slate-200 font-bold">{totalDataRecords}</td>

                <th className="text-left px-4 py-3 border border-slate-200">Open Action Items</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-red-600">{totalOpenActionItems}</td>

                <th className="text-left px-4 py-3 border border-slate-200">Closure Rate</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">{projectClosureRate}%</td>
              </tr>

              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 border border-slate-200">Open Observations</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-red-600">{openObservations}</td>

                <th className="text-left px-4 py-3 border border-slate-200">Open RFIs</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-blue-600">{openRfisCount}</td>

                <th className="text-left px-4 py-3 border border-slate-200">Open NCRs</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-orange-600">{openNcrsCount}</td>
              </tr>

              <tr>
                <th className="text-left px-4 py-3 border border-slate-200">Open Punch Items</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-purple-600">{openPunchesCount}</td>

                <th className="text-left px-4 py-3 border border-slate-200">Delayed Tasks</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-amber-600">{delayedTasksTotal}</td>

                <th className="text-left px-4 py-3 border border-slate-200">Risk Index</th>
                <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">{engineeringRiskIndex}/100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

<div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
  <div className="bg-red-950 px-5 py-4">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h3 className="text-lg font-extrabold text-white">
          Risk, Safety and V&V Summary
        </h3>
        <p className="text-sm text-red-100 mt-1">
          Project assurance overview for safety management, risk control, verification and validation
        </p>
      </div>

      <div className="bg-red-500/10 border border-red-300/30 text-red-200 px-3 py-2 rounded-lg text-xs font-bold">
        Assurance Register
      </div>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full text-sm border-collapse">
      <tbody>
        <tr className="bg-slate-100">
          <th className="text-left px-4 py-3 border border-slate-200">
            Open Risks
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">
            {openRisks}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            High Risks
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-orange-700">
            {highRisks}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            Critical Risks
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-red-800">
            {criticalRisks}
          </td>
        </tr>

        <tr>
          <th className="text-left px-4 py-3 border border-slate-200">
            Open Safety Issues
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">
            {openSafetyIssues}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            Critical Safety Issues
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-red-800">
            {criticalSafetyIssues}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            Closed Safety Issues
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">
            {closedSafetyIssues}
          </td>
        </tr>

        <tr className="bg-slate-50">
          <th className="text-left px-4 py-3 border border-slate-200">
            V&V Items
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-blue-700">
            {totalVVItems}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            Verified
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-blue-700">
            {verifiedVVItems}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            Validated
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">
            {validatedVVItems}
          </td>
        </tr>

        <tr>
          <th className="text-left px-4 py-3 border border-slate-200">
            Failed V&V
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">
            {failedVVItems}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            Mitigated Risks
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-blue-700">
            {mitigatedRisks}
          </td>

          <th className="text-left px-4 py-3 border border-slate-200">
            Closed Risks
          </th>
          <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">
            {closedRisks}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Action Items Summary</h3>
            <p className="text-xs text-slate-500 mt-1">Open and closed items by category</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200">Type</th>
                  <th className="text-center px-4 py-3 border border-slate-200">Open</th>
                  <th className="text-center px-4 py-3 border border-slate-200">Closed</th>
                  <th className="text-center px-4 py-3 border border-slate-200">Total</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="px-4 py-3 border border-slate-200 font-medium">Observations</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-red-600 font-bold">{openObservations}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-emerald-600 font-bold">{closedObservations}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center font-bold">{observations.length}</td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="px-4 py-3 border border-slate-200 font-medium">RFIs</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-blue-600 font-bold">{openRfisCount}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-emerald-600 font-bold">{closedRfisCount}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center font-bold">{rfis.length}</td>
                </tr>

                <tr>
                  <td className="px-4 py-3 border border-slate-200 font-medium">NCRs</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-orange-600 font-bold">{openNcrsCount}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-emerald-600 font-bold">{closedNcrsCount}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center font-bold">{ncrs.length}</td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="px-4 py-3 border border-slate-200 font-medium">Punch Items</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-purple-600 font-bold">{openPunchesCount}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center text-emerald-600 font-bold">{closedPunchesCount}</td>
                  <td className="px-4 py-3 border border-slate-200 text-center font-bold">{punches.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Documents and Drawings</h3>
            <p className="text-xs text-slate-500 mt-1">Register summary for project control</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <tbody>
                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">Total Documents</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">{totalDocuments}</td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">AFC Documents</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">{afcDocuments}</td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">Revised Documents</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">{revisedDocuments}</td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">Total Drawings</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">{totalDrawingRecords}</td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">IFC Drawings</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">{ifcDrawingRecords}</td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">Under Review Drawings</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold text-amber-700">{underReviewDrawingRecords}</td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">Superseded Drawings</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold text-red-700">{supersededDrawingRecords}</td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">Top Document Discipline</th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">
                    {topDocumentDiscipline
                      ? `${topDocumentDiscipline[0]} (${topDocumentDiscipline[1]})`
                      : 'No Data'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">Station Progress Matrix</h3>
              <p className="text-xs text-slate-500 mt-1">
                Excel-style station overview with progress, readiness, and risk
              </p>
            </div>

            <span className="text-xs font-bold text-slate-600">
              Showing {stations.length} stations
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-4 py-3 border border-slate-200">Station</th>
                <th className="text-center px-4 py-3 border border-slate-200">Type</th>
                <th className="text-center px-4 py-3 border border-slate-200">Progress</th>
                <th className="text-center px-4 py-3 border border-slate-200">Readiness</th>
                <th className="text-center px-4 py-3 border border-slate-200">Open NCRs</th>
                <th className="text-center px-4 py-3 border border-slate-200">Open RFIs</th>
                <th className="text-center px-4 py-3 border border-slate-200">Punch</th>
                <th className="text-center px-4 py-3 border border-slate-200">Risk Score</th>
                <th className="text-center px-4 py-3 border border-slate-200">Status</th>
              </tr>
            </thead>

            <tbody>
              {[...stationRiskScores]
                .sort((a: any, b: any) => b.riskScore - a.riskScore)
                .map((st: any, index) => (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStation(st.id)}
                    className={`cursor-pointer hover:bg-teal-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 border border-slate-200 font-bold text-slate-900">
                      {getStationName(st)}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center">
                      {st.type || 'N/A'}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center font-bold">
                      {st.progress || 0}%
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center font-bold">
                      {st.readiness}%
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center text-orange-700 font-bold">
                      {st.openNCRs || 0}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center text-blue-700 font-bold">
                      {st.openRFIs || 0}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center text-purple-700 font-bold">
                      {st.openPunches || 0}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center font-bold text-red-700">
                      {st.riskScore}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-center">
                      <span className={`px-2 py-1 rounded-md border text-xs font-bold ${getStatusClass(st.readiness)}`}>
                        {getStatusText(st.readiness)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Top Risk Stations</h3>
            <p className="text-xs text-slate-500 mt-1">
              Highest stations by NCR, RFI, and Punch impact
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200">Station</th>
                  <th className="text-center px-4 py-3 border border-slate-200">NCR</th>
                  <th className="text-center px-4 py-3 border border-slate-200">RFI</th>
                  <th className="text-center px-4 py-3 border border-slate-200">Punch</th>
                  <th className="text-center px-4 py-3 border border-slate-200">Risk</th>
                </tr>
              </thead>

              <tbody>
                {topRiskStations.map((st: any, index) => (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStation(st.id)}
                    className={`cursor-pointer hover:bg-red-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 border border-slate-200 font-bold">
                      {getStationName(st)}
                    </td>
                    <td className="px-4 py-3 border border-slate-200 text-center font-bold">
                      {st.openNCRs || 0}
                    </td>
                    <td className="px-4 py-3 border border-slate-200 text-center font-bold">
                      {st.openRFIs || 0}
                    </td>
                    <td className="px-4 py-3 border border-slate-200 text-center font-bold">
                      {st.openPunches || 0}
                    </td>
                    <td className="px-4 py-3 border border-slate-200 text-center font-bold text-red-700">
                      {st.riskScore}
                    </td>
                  </tr>
                ))}

                {topRiskStations.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-500 border border-slate-200"
                    >
                      No station risk data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Observation Insights</h3>
            <p className="text-xs text-slate-500 mt-1">
              Key patterns from site observations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <tbody>
                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                    Top Problematic Station
                  </th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">
                    {topObservationStation
                      ? `${topObservationStation[0]} (${topObservationStation[1]})`
                      : 'No Data'}
                  </td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                    Top Observation Discipline
                  </th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">
                    {topObservationDiscipline
                      ? `${topObservationDiscipline[0]} (${topObservationDiscipline[1]})`
                      : 'No Data'}
                  </td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                    Most Repeated Observation
                  </th>
                  <td className="px-4 py-3 border border-slate-200 font-bold">
                    {mostRepeatedObservation
                      ? `${mostRepeatedObservation[0]} (${mostRepeatedObservation[1]} times)`
                      : 'No Data'}
                  </td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                    Lessons Learned
                  </th>
                  <td className="px-4 py-3 border border-slate-200 font-bold text-indigo-700">
                    {lessonsLearnedCount}
                  </td>
                </tr>

                <tr>
                  <th className="text-left px-4 py-3 border border-slate-200 bg-slate-100">
                    Closed Observations
                  </th>
                  <td className="px-4 py-3 border border-slate-200 font-bold text-emerald-700">
                    {closedObservations}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">
            Recommended Engineering Actions
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Automatic action list based on current project data
          </p>
        </div>

        <div className="p-5">
          <ol className="space-y-3">
            {recommendedActions.map((action, index) => (
              <li
                key={index}
                className="flex gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">
                  {action}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}