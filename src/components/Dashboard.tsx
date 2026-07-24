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
const delayedTasksTotal = stations.reduce(
  (acc, st) => acc + (st.delayedTasksCount || 0),
  0
);
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

const stationReadiness = stations.map(st => {
  const score =
    st.progress -
    (st.openNCRs * 5) -
    (st.openRFIs * 2) -
    (st.openPunches * 1);

  return {
    ...st,
    readiness: Math.max(0, Math.min(100, score))
  };
});

const stationRiskScores = stations.map(st => {
  const riskScore =
    (st.openNCRs * 5) +
    (st.openRFIs * 2) +
    (st.openPunches * 1);

  return {
    ...st,
    riskScore
  };
});

const topRiskStations = [...stationRiskScores]
  .sort((a, b) => b.riskScore - a.riskScore)
  .slice(0, 5);
const highestRiskStation = topRiskStations[0];
const mostNcrStation = [...stations].sort(
  (a, b) => b.openNCRs - a.openNCRs
)[0];

const mostRfiStation = [...stations].sort(
  (a, b) => b.openRFIs - a.openRFIs
)[0];

const mostPunchStation = [...stations].sort(
  (a, b) => b.openPunches - a.openPunches
)[0];

const engineeringHealthScore =
  stationReadiness.length > 0
    ? Math.round(
        stationReadiness.reduce(
          (acc, st) => acc + st.readiness,
          0
        ) / stationReadiness.length
      )
    : 0;

  // Critical items
const criticalNcrs = ncrs.filter(n => n.status === 'Open' && n.priority === 'Critical');
const majorNcrs = ncrs.filter(n => n.status === 'Open' && n.priority === 'Major');

const observations = JSON.parse(
  localStorage.getItem('hsr_observations') || '[]'
);

const openObservations = observations.filter(
  (item: any) => item.status === 'Open'
).length;

const closedObservations = observations.filter(
  (item: any) => item.status === 'Closed'
).length;

const stationObservationCounts: Record<string, number> = {};

observations.forEach((item: any) => {
  if (item.status !== 'Open') return;

  stationObservationCounts[item.station] =
    (stationObservationCounts[item.station] || 0) + 1;
});

const topObservationStation = Object.entries(stationObservationCounts)
  .sort((a, b) => Number(b[1]) - Number(a[1]))[0];
const observationPatternMap: Record<string, number> = {};

observations.forEach((item: any) => {
  const key = item.observation
    ?.toLowerCase()
    ?.replace(/[^\w\s]/g, '')
    ?.split(' ')
    ?.slice(0, 8)
    ?.join(' ');

  if (!key) return;

  observationPatternMap[key] =
    (observationPatternMap[key] || 0) + 1;
});

const mostRepeatedObservation = Object.entries(
  observationPatternMap
)
  .sort((a, b) => Number(b[1]) - Number(a[1]))[0];
const lessonsLearnedCount = Object.entries(
  observationPatternMap
).filter(([_, count]) => Number(count) > 1).length;

const engineeringSummary = `
${openObservations} observations remain open.

${closedObservations} observations have been closed.

${
  topObservationStation
    ? `${topObservationStation[0]} currently has the highest number of open observations.`
    : 'No problematic station identified.'
}

${
  mostRepeatedObservation
    ? `Most repeated issue: ${mostRepeatedObservation[0]}.`
    : 'No repeated issue detected.'
}

${lessonsLearnedCount} lessons learned have been identified.
`;

const closedRfisCount = rfis.filter(
  r => r.status === 'Closed'
).length;

const closedNcrsCount = ncrs.filter(
  n => n.status === 'Closed'
).length;

const closedPunchesCount = punches.filter(
  p => p.status === 'Closed'
).length;

const totalDataRecords =
  totalDocuments +
  observations.length +
  rfis.length +
  ncrs.length +
  punches.length;

const totalOpenActionItems =
  openObservations +
  openRfisCount +
  openNcrsCount +
  openPunchesCount;

const totalClosedActionItems =
  closedObservations +
  closedRfisCount +
  closedNcrsCount +
  closedPunchesCount;

const observationDisciplineCounts: Record<string, number> = {};

observations.forEach((item: any) => {
  const discipline = item.discipline || 'Unknown';

  observationDisciplineCounts[discipline] =
    (observationDisciplineCounts[discipline] || 0) + 1;
});

const topObservationDiscipline = Object.entries(
  observationDisciplineCounts
).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

const documentDisciplineCounts: Record<string, number> = {};

documents.forEach((doc: any) => {
  const discipline = doc.discipline || doc.type || 'Unknown';

  documentDisciplineCounts[discipline] =
    (documentDisciplineCounts[discipline] || 0) + 1;
});

const topDocumentDiscipline = Object.entries(
  documentDisciplineCounts
).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

const revisionCounts: Record<string, number> = {};

documents.forEach((doc: any) => {
  const revisionName = doc.revision || 'No Revision';

  revisionCounts[revisionName] =
    (revisionCounts[revisionName] || 0) + 1;
});

const topRevision = Object.entries(revisionCounts)
  .sort((a, b) => Number(b[1]) - Number(a[1]))[0];

const afcDocumentPercentage =
  totalDocuments > 0
    ? Math.round((afcDocuments / totalDocuments) * 100)
    : 0;

const projectClosureRate =
  totalOpenActionItems + totalClosedActionItems > 0
    ? Math.round(
        (totalClosedActionItems /
          (totalOpenActionItems + totalClosedActionItems)) *
          100
      )
    : 0;

const executiveDashboardSummary = `
Project Data Records: ${totalDataRecords}

Open Action Items: ${totalOpenActionItems}

Closed Action Items: ${totalClosedActionItems}

Project Closure Rate: ${projectClosureRate}%

Engineering Health Score: ${engineeringHealthScore}%

${
  topObservationStation
    ? `Top observation station: ${topObservationStation[0]} with ${topObservationStation[1]} open observations.`
    : 'No top observation station identified.'
}

${
  topObservationDiscipline
    ? `Top observation discipline: ${topObservationDiscipline[0]} with ${topObservationDiscipline[1]} observations.`
    : 'No top observation discipline identified.'
}

${
  mostRepeatedObservation
    ? `Most repeated observation pattern: ${mostRepeatedObservation[0]}.`
    : 'No repeated observation pattern detected.'
}

${
  topDocumentDiscipline
    ? `Top document discipline: ${topDocumentDiscipline[0]} with ${topDocumentDiscipline[1]} documents.`
    : 'No top document discipline identified.'
}
`;

const repeatedIssueCount = mostRepeatedObservation
  ? Number(mostRepeatedObservation[1])
  : 0;

const topRiskScore = highestRiskStation
  ? highestRiskStation.riskScore
  : 0;

const coordinationLoadScore =
  openObservations +
  openRfisCount +
  openNcrsCount +
  openPunchesCount;

const engineeringRiskIndex = Math.min(
  100,
  Math.round(
    topRiskScore +
    openNcrsCount * 5 +
    openRfisCount * 2 +
    openObservations +
    openPunchesCount
  )
);

const mostCriticalEngineeringDiscipline = topObservationDiscipline
  ? topObservationDiscipline[0]
  : 'Not identified';

const highestRiskStationName = highestRiskStation
  ? ((highestRiskStation as any).nameEn || (highestRiskStation as any).name || 'Unknown Station')
  : 'Not identified';

const recommendedEngineeringActions: string[] = [];

if (openNcrsCount > 0) {
  recommendedEngineeringActions.push(
    'Prioritize closure of open NCRs (Non-Conformance Reports) before increasing installation progress.'
  );
}

if (openRfisCount > 0) {
  recommendedEngineeringActions.push(
    'Review open RFIs (Requests for Information) with design and engineering teams to reduce clarification delays.'
  );
}

if (openObservations > 0) {
  recommendedEngineeringActions.push(
    'Focus on closing open observations linked to repeated technical issues and problematic stations.'
  );
}

if (mostRepeatedObservation) {
  recommendedEngineeringActions.push(
    `Address the repeated observation pattern: ${mostRepeatedObservation[0]}.`
  );
}

if (topObservationDiscipline) {
  recommendedEngineeringActions.push(
    `Assign dedicated engineering review for ${topObservationDiscipline[0]} as the most affected observation discipline.`
  );
}

if (recommendedEngineeringActions.length === 0) {
  recommendedEngineeringActions.push(
    'No critical engineering action is currently required based on available data.'
  );
}

const engineeringAnalysisSummary = `
Engineering Risk Index: ${engineeringRiskIndex}/100

Coordination Load Score: ${coordinationLoadScore}

Highest Risk Station: ${highestRiskStationName}

Most Critical Engineering Discipline: ${mostCriticalEngineeringDiscipline}

Repeated Issue Count: ${repeatedIssueCount}

${
  mostRepeatedObservation
    ? `Most repeated technical issue: ${mostRepeatedObservation[0]}.`
    : 'No repeated technical issue detected.'
}

Recommended engineering focus:
${recommendedEngineeringActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}
`;

const dashboardDrawings = JSON.parse(
  localStorage.getItem('hsr_drawings') || '[]'
);

const totalDrawingRecords = dashboardDrawings.length;

const ifcDrawingRecords = dashboardDrawings.filter(
  (item: any) => item.status === 'IFC'
).length;

const underReviewDrawingRecords = dashboardDrawings.filter(
  (item: any) => item.status === 'Under Review'
).length;

const supersededDrawingRecords = dashboardDrawings.filter(
  (item: any) => item.status === 'Superseded'
).length;

const drawingStationCounts: Record<string, number> = {};

dashboardDrawings.forEach((item: any) => {
  const stationName = item.station || 'Unknown Station';

  drawingStationCounts[stationName] =
    (drawingStationCounts[stationName] || 0) + 1;
});

const dashboardTopDrawingStation = Object.entries(
  drawingStationCounts
).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

const drawingDisciplineCounts: Record<string, number> = {};

dashboardDrawings.forEach((item: any) => {
  const disciplineName = item.discipline || 'Unknown';

  drawingDisciplineCounts[disciplineName] =
    (drawingDisciplineCounts[disciplineName] || 0) + 1;
});

const dashboardTopDrawingDiscipline = Object.entries(
  drawingDisciplineCounts
).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

const drawingRevisionCounts: Record<string, number> = {};

dashboardDrawings.forEach((item: any) => {
  const revisionName = item.revision || 'No Revision';

  drawingRevisionCounts[revisionName] =
    (drawingRevisionCounts[revisionName] || 0) + 1;
});

const dashboardTopDrawingRevision = Object.entries(
  drawingRevisionCounts
).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

const drawingDashboardSummary = `
Total registered drawings: ${totalDrawingRecords}

IFC drawings: ${ifcDrawingRecords}

Under review drawings: ${underReviewDrawingRecords}

Superseded drawings: ${supersededDrawingRecords}

${
  dashboardTopDrawingStation
    ? `Top drawing station: ${dashboardTopDrawingStation[0]} with ${dashboardTopDrawingStation[1]} drawings.`
    : 'No top drawing station identified.'
}

${
  dashboardTopDrawingDiscipline
    ? `Top drawing discipline: ${dashboardTopDrawingDiscipline[0]} with ${dashboardTopDrawingDiscipline[1]} drawings.`
    : 'No top drawing discipline identified.'
}

${
  dashboardTopDrawingRevision
    ? `Most common drawing revision: ${dashboardTopDrawingRevision[0]} with ${dashboardTopDrawingRevision[1]} drawings.`
    : 'No drawing revision data available.'
}
`;
const highRevisionGroups = Object.entries(drawingRevisionGroups)
  .filter(([_, group]) => group.length >= 2)
  .sort((a, b) => b[1].length - a[1].length);

const mostRevisedDrawingGroup = highRevisionGroups[0];

const supersededRatio =
  totalDrawings > 0
    ? Math.round((supersededDrawings / totalDrawings) * 100)
    : 0;

const drawingCoordinationLoad =
  underReviewDrawings +
  supersededDrawings +
  drawingsWithMultipleRevisions;

const drawingRiskIndex = Math.min(
  100,
  Math.round(
    underReviewDrawings * 5 +
    supersededDrawings * 3 +
    drawingsWithMultipleRevisions * 4
  )
);

const recommendedDrawingActions: string[] = [];

if (underReviewDrawings > 0) {
  recommendedDrawingActions.push(
    'Review all drawings under review and prioritize closure of pending engineering comments.'
  );
}

if (supersededDrawings > 0) {
  recommendedDrawingActions.push(
    'Verify that all superseded drawings are clearly marked and not used for site installation.'
  );
}

if (drawingsWithMultipleRevisions > 0) {
  recommendedDrawingActions.push(
    'Track drawings with multiple revisions to identify unstable design areas and coordination risks.'
  );
}

if (mostRevisedDrawingGroup) {
  recommendedDrawingActions.push(
    `Review drawing group ${mostRevisedDrawingGroup[0]} because it has ${mostRevisedDrawingGroup[1].length} registered revisions.`
  );
}

if (topDrawingDiscipline) {
  recommendedDrawingActions.push(
    `Focus drawing coordination review on ${topDrawingDiscipline[0]} as the highest drawing discipline by count.`
  );
}

if (recommendedDrawingActions.length === 0) {
  recommendedDrawingActions.push(
    'No critical drawing action is currently required based on available drawing data.'
  );
}

const drawingEngineeringSummary = `
Drawing Risk Index: ${drawingRiskIndex}/100

Drawing Coordination Load: ${drawingCoordinationLoad}

Superseded Drawing Ratio: ${supersededRatio}%

Drawings with multiple revisions: ${drawingsWithMultipleRevisions}

${
  mostRevisedDrawingGroup
    ? `Most revised drawing group: ${mostRevisedDrawingGroup[0]} with ${mostRevisedDrawingGroup[1].length} revisions.`
    : 'No multi-revision drawing group detected.'
}

${
  topDrawingStation
    ? `Top drawing station: ${topDrawingStation[0]} with ${topDrawingStation[1]} drawings.`
    : 'No top drawing station identified.'
}

${
  topDrawingDiscipline
    ? `Top drawing discipline: ${topDrawingDiscipline[0]} with ${topDrawingDiscipline[1]} drawings.`
    : 'No top drawing discipline identified.'
}

Recommended drawing actions:
${recommendedDrawingActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}
`;

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

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
    <p className="text-xs uppercase text-slate-500 font-bold">
      Documents
    </p>

    <h3 className="text-3xl font-extrabold mt-2">
      {totalDocuments}
    </h3>
  </div>

  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
    <p className="text-xs uppercase text-slate-500 font-bold">
      AFC Documents
    </p>

    <h3 className="text-3xl font-extrabold mt-2">
      {afcDocuments}
    </h3>
  </div>

  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
    <p className="text-xs uppercase text-slate-500 font-bold">
      Revised Drawings
    </p>

    <h3 className="text-3xl font-extrabold mt-2">
      {revisedDocuments}
    </h3>
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

  <h3 className="text-lg font-bold mb-4">
    Station Readiness Matrix
  </h3>

  <div className="space-y-3">

    {stationReadiness
      .sort((a, b) => b.readiness - a.readiness)
      .slice(0, 10)
      .map(st => (

      <div
        key={st.id}
        className="flex items-center justify-between border border-slate-100 rounded-xl p-3"
      >
        <div>
          <h4 className="font-semibold">
            {st.nameEn}
          </h4>

          <p className="text-xs text-slate-500">
            NCR: {st.openNCRs} |
            RFI: {st.openRFIs} |
            Punch: {st.openPunches}
          </p>
        </div>

        <div
          className={`font-bold text-lg ${
            st.readiness >= 80
              ? 'text-green-600'
              : st.readiness >= 60
              ? 'text-amber-500'
              : 'text-red-500'
          }`}
        >
          {st.readiness}%
        </div>
      </div>

    ))}
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

  <h3 className="text-lg font-bold">
    Engineering Health Score
  </h3>

  <p className="text-xs text-slate-500 mt-1">
    Overall project engineering status
  </p>

  <div className="mt-4">

    <span
      className={`text-4xl font-extrabold ${
        engineeringHealthScore >= 80
          ? 'text-green-600'
          : engineeringHealthScore >= 60
          ? 'text-amber-500'
          : 'text-red-600'
      }`}
    >
      {engineeringHealthScore}%
    </span>

  </div>

</div>

{mostNcrStation && (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

    <h3 className="text-lg font-bold text-slate-900">
      Most NCR Station
    </h3>

    <p className="text-xs text-slate-500 mt-1">
      NCR means Non-Conformance Report
    </p>

    <div className="mt-4 flex items-center justify-between">

      <div>
        <h4 className="text-xl font-extrabold text-slate-900">
          {mostNcrStation.nameEn}
        </h4>

        <p className="text-sm text-slate-500 mt-1">
          Station with the highest number of open Non-Conformance Reports
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-slate-500 font-bold uppercase">
          Open NCRs
        </p>

        <p className="text-3xl font-extrabold text-red-600">
          {mostNcrStation.openNCRs}
        </p>
      </div>

    </div>

  </div>
)}

{mostRfiStation && (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

    <h3 className="text-lg font-bold text-slate-900">
      Most RFI Station
    </h3>

    <p className="text-xs text-slate-500 mt-1">
      RFI means Request for Information
    </p>

    <div className="mt-4 flex items-center justify-between">

      <div>
        <h4 className="text-xl font-extrabold text-slate-900">
          {mostRfiStation.nameEn}
        </h4>

        <p className="text-sm text-slate-500 mt-1">
          Station with the highest number of open Requests for Information
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-slate-500 font-bold uppercase">
          Open RFIs
        </p>

        <p className="text-3xl font-extrabold text-cyan-600">
          {mostRfiStation.openRFIs}
        </p>
      </div>

    </div>

  </div>
)}

{mostPunchStation && (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

    <h3 className="text-lg font-bold text-slate-900">
      Most Punch Station
    </h3>

    <p className="text-xs text-slate-500 mt-1">
      Station with the highest number of open Punch Items
    </p>

    <div className="mt-4 flex items-center justify-between">

      <div>
        <h4 className="text-xl font-extrabold text-slate-900">
          {mostPunchStation.nameEn}
        </h4>

        <p className="text-sm text-slate-500 mt-1">
          Highest open Punch Items count
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-slate-500 font-bold uppercase">
          Open Punch Items
        </p>

        <p className="text-3xl font-extrabold text-amber-600">
          {mostPunchStation.openPunches}
        </p>
      </div>

    </div>

  </div>
)}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Open Observations
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-red-600">
      {openObservations}
    </h3>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Closed Observations
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
      {closedObservations}
    </h3>
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

  <h3 className="text-lg font-bold text-slate-900">
    Top Risk Stations
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Stations ranked by open NCRs (Non-Conformance Reports), RFIs (Requests for Information), and Punch Items.
  </p>

  <div className="space-y-3">
    {topRiskStations.map((st) => (
      <div
        key={st.id}
        className="border border-slate-100 rounded-xl p-3 flex items-center justify-between"
      >
        <div>
          <h4 className="font-semibold text-slate-900">
            {st.nameEn}
          </h4>

          <p className="text-xs text-slate-500">
            NCRs (Non-Conformance Reports): {st.openNCRs} | RFIs (Requests for Information): {st.openRFIs} | Punch Items: {st.openPunches}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            Risk Score
          </p>

          <p
            className={`text-xl font-bold ${
              st.riskScore >= 20
                ? 'text-red-600'
                : st.riskScore >= 10
                ? 'text-amber-500'
                : 'text-green-600'
            }`}
          >
            {st.riskScore}
          </p>
        </div>
      </div>
    ))}
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Top 5 Risk Stations
  </h3>

  <div className="space-y-3">

    {topRiskStations.map((station) => (
      <div
        key={station.name}
        className="border border-slate-200 rounded-xl p-3 bg-slate-50"
      >
        <div className="flex items-center justify-between">

          <div>
            <p className="font-bold text-slate-900">
              {station.name}
            </p>

            <p className="text-xs text-slate-500">
              NCRs: {station.openNCRs} | RFIs: {station.openRFIs} | Punches: {station.openPunches}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">
              Risk Score
            </p>

            <p className="text-xl font-extrabold text-red-600">
              {station.riskScore}
            </p>
          </div>

        </div>
      </div>
    ))}

  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Project Closure Rate
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
      {projectClosureRate}%
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Closed action items vs total action items
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      AFC Documents Ratio
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-cyan-600">
      {afcDocumentPercentage}%
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      AFC documents from total document register
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Lessons Learned
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-indigo-600">
      {lessonsLearnedCount}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Repeated engineering patterns identified
    </p>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Top Observation Discipline
    </h3>

    {topObservationDiscipline ? (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-900">
            {topObservationDiscipline[0]}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Discipline with the highest number of observations
          </p>
        </div>

        <p className="text-3xl font-extrabold text-red-600">
          {topObservationDiscipline[1]}
        </p>
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        No observation discipline data available.
      </p>
    )}
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Top Document Discipline
    </h3>

    {topDocumentDiscipline ? (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-900">
            {topDocumentDiscipline[0]}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Discipline with the highest document count
          </p>
        </div>

        <p className="text-3xl font-extrabold text-cyan-600">
          {topDocumentDiscipline[1]}
        </p>
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        No document discipline data available.
      </p>
    )}
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Top Document Revision
    </h3>

    {topRevision ? (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-900">
            {topRevision[0]}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Most common document revision in the register
          </p>
        </div>

        <p className="text-3xl font-extrabold text-amber-600">
          {topRevision[1]}
        </p>
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        No revision data available.
      </p>
    )}
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Most Repeated Observation Pattern
    </h3>

    {mostRepeatedObservation ? (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {mostRepeatedObservation[0]}
        </p>

        <p className="text-2xl font-extrabold text-red-600 mt-2">
          {mostRepeatedObservation[1]} Times
        </p>
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        No repeated observation pattern detected.
      </p>
    )}
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Executive Data Analysis Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Consolidated project data analysis from documents, observations, RFIs, NCRs, punch list, and stations
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {executiveDashboardSummary}
    </pre>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Engineering Risk Index
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-red-600">
      {engineeringRiskIndex}/100
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Calculated from NCRs, RFIs, observations, punch items, and station risk.
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Coordination Load Score
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
      {coordinationLoadScore}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Total open observations, RFIs, NCRs, and punch items.
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Repeated Issue Count
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-indigo-600">
      {repeatedIssueCount}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Frequency of the most repeated technical issue.
    </p>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Most Critical Engineering Discipline
    </h3>

    <p className="text-2xl font-extrabold text-slate-900">
      {mostCriticalEngineeringDiscipline}
    </p>

    <p className="text-xs text-slate-500 mt-2">
      Based on observation discipline concentration.
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Highest Risk Station
    </h3>

    <p className="text-2xl font-extrabold text-slate-900">
      {highestRiskStationName}
    </p>

    <p className="text-xs text-slate-500 mt-2">
      Based on station NCRs, RFIs, punch items, and calculated risk score.
    </p>
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Recommended Engineering Actions
  </h3>

  <div className="space-y-3">
    {recommendedEngineeringActions.map((action, index) => (
      <div
        key={index}
        className="border border-slate-200 rounded-xl p-3 bg-slate-50"
      >
        <p className="text-sm text-slate-700">
          <strong>{index + 1}.</strong> {action}
        </p>
      </div>
    ))}
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Engineering Analysis Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Automatically generated engineering interpretation from project data.
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {engineeringAnalysisSummary}
    </pre>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Total Drawings
    </p>

    <h3 className="text-3xl font-extrabold mt-2">
      {totalDrawingRecords}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Registered drawing records
    </p>
  </div>

  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
    <p className="text-xs text-emerald-600 font-bold uppercase">
      IFC Drawings
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
      {ifcDrawingRecords}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Issued for construction drawings
    </p>
  </div>

  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
    <p className="text-xs text-amber-600 font-bold uppercase">
      Under Review
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
      {underReviewDrawingRecords}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Drawings pending review
    </p>
  </div>

  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
    <p className="text-xs text-red-600 font-bold uppercase">
      Superseded Drawings
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-red-600">
      {supersededDrawingRecords}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Drawings replaced by newer revisions
    </p>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Top Drawing Station
    </h3>

    {dashboardTopDrawingStation ? (
      <>
        <p className="text-xl font-extrabold text-slate-900">
          {dashboardTopDrawingStation[0]}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {dashboardTopDrawingStation[1]} drawings
        </p>
      </>
    ) : (
      <p className="text-sm text-slate-500">
        No drawing station data available.
      </p>
    )}
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Top Drawing Discipline
    </h3>

    {dashboardTopDrawingDiscipline ? (
      <>
        <p className="text-xl font-extrabold text-slate-900">
          {dashboardTopDrawingDiscipline[0]}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {dashboardTopDrawingDiscipline[1]} drawings
        </p>
      </>
    ) : (
      <p className="text-sm text-slate-500">
        No drawing discipline data available.
      </p>
    )}
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Top Drawing Revision
    </h3>

    {dashboardTopDrawingRevision ? (
      <>
        <p className="text-xl font-extrabold text-slate-900">
          {dashboardTopDrawingRevision[0]}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {dashboardTopDrawingRevision[1]} drawings
        </p>
      </>
    ) : (
      <p className="text-sm text-slate-500">
        No drawing revision data available.
      </p>
    )}
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Drawing Dashboard Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Drawing register analytics integrated into the main project dashboard
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {drawingDashboardSummary}
    </pre>
  </div>

</div>

{topObservationStation && (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

    <h3 className="text-lg font-bold text-slate-900">
      Top Problematic Station
    </h3>

    <p className="text-xs text-slate-500 mt-1 mb-4">
      Station with the highest number of open observations
    </p>

    <div className="flex items-center justify-between">

      <div>
        <p className="text-xl font-extrabold text-slate-900">
          {topObservationStation[0]}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-slate-500">
          Open Observations
        </p>

        <p className="text-3xl font-extrabold text-red-600">
          {topObservationStation[1]}
        </p>
      </div>

    </div>

  </div>
)}
{mostRepeatedObservation && (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

    <h3 className="text-lg font-bold text-slate-900">
      Most Repeated Observation
    </h3>

    <p className="text-xs text-slate-500 mt-1 mb-4">
      Most common observation pattern across imported files
    </p>

    <div>

      <p className="text-sm font-semibold text-slate-900">
        {mostRepeatedObservation[0]}
      </p>

      <p className="text-xl font-extrabold text-amber-600 mt-2">
        {mostRepeatedObservation[1]} Times
      </p>

    </div>

  </div>
)}
<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Lessons Learned
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Generated from repeated observation patterns
  </p>

  <div>

    <p className="text-3xl font-extrabold text-indigo-600">
      {lessonsLearnedCount}
    </p>

    <p className="text-sm text-slate-500 mt-2">
      Recurrent engineering lessons identified
    </p>

  </div>

</div>
<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Engineering Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Automatically generated from observation analytics
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {engineeringSummary}
    </pre>
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Executive Project Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Real-time project analytics overview
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

    <ul className="space-y-2 text-sm text-slate-700">

      <li>
        Total Project Records: <strong>{totalDataRecords}</strong>
      </li>

      <li>
        Open Action Items: <strong>{totalOpenActionItems}</strong>
      </li>

      <li>
        Closed Action Items: <strong>{totalClosedActionItems}</strong>
      </li>

      <li>
        Engineering Health Score: <strong>{engineeringHealthScore}%</strong>
      </li>

      <li>
        Delayed Tasks: <strong>{delayedTasksTotal}</strong>
      </li>

      <li>
        Open RFIs: <strong>{openRfisCount}</strong>
      </li>

      <li>
        Open NCRs: <strong>{openNcrsCount}</strong>
      </li>

      <li>
        Open Punches: <strong>{openPunchesCount}</strong>
      </li>

    </ul>

  </div>

</div>

{highestRiskStation && (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

    <h3 className="text-lg font-bold text-slate-900">
      Top Risk Station
    </h3>

    <p className="text-xs text-slate-500 mt-1 mb-4">
      Station with the highest calculated risk score
    </p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <div>
        <p className="text-xs text-slate-500">
          Station
        </p>

        <p className="font-bold text-slate-900">
          {highestRiskStation.name}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500">
          Risk Score
        </p>

        <p className="font-bold text-red-600">
          {highestRiskStation.riskScore}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500">
          Open NCRs
        </p>

        <p className="font-bold">
          {highestRiskStation.openNCRs}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500">
          Open RFIs
        </p>

        <p className="font-bold">
          {highestRiskStation.openRFIs}
        </p>
      </div>

    </div>

  </div>
)}

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Total Data Records
    </p>

    <h3 className="text-3xl font-extrabold mt-2">
      {totalDataRecords}
    </h3>
  </div>

  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
    <p className="text-xs text-red-600 font-bold uppercase">
      Open Action Items
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-red-600">
      {totalOpenActionItems}
    </h3>
  </div>

  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
    <p className="text-xs text-emerald-600 font-bold uppercase">
      Closed Action Items
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
      {totalClosedActionItems}
    </h3>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
    <p className="text-xs text-blue-600 font-bold uppercase">
      Open RFIs
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-blue-600">
      {openRfisCount}
    </h3>
  </div>

  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
    <p className="text-xs text-orange-600 font-bold uppercase">
      Open NCRs
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-orange-600">
      {openNcrsCount}
    </h3>
  </div>

  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
    <p className="text-xs text-purple-600 font-bold uppercase">
      Open Punches
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-purple-600">
      {openPunchesCount}
    </h3>
  </div>

  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
    <p className="text-xs text-amber-600 font-bold uppercase">
      Delayed Tasks
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
      {delayedTasksTotal}
    </h3>
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
