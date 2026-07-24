import React, { useEffect, useState } from 'react';

export default function ReportsCenter() {
  const [observations, setObservations] = useState<any[]>([]);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [rfis, setRfis] = useState<any[]>([]);
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [punches, setPunches] = useState<any[]>([]);

  useEffect(() => {
    setObservations(JSON.parse(localStorage.getItem('hsr_observations') || '[]'));
    setDrawings(JSON.parse(localStorage.getItem('hsr_drawings') || '[]'));
    setDocuments(JSON.parse(localStorage.getItem('hsr_documents') || '[]'));
    setRfis(JSON.parse(localStorage.getItem('hsr_rfis') || '[]'));
    setNcrs(JSON.parse(localStorage.getItem('hsr_ncrs') || '[]'));
    setPunches(JSON.parse(localStorage.getItem('hsr_punches') || '[]'));
  }, []);

  const escapeCsv = (value: any) => {
    if (value === null || value === undefined) return '';

    const stringValue = String(value).replace(/"/g, '""');

    return `"${stringValue}"`;
  };

  const downloadCsv = (fileName: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportObservations = () => {
    const headers = [
      'Station',
      'Level',
      'Discipline',
      'Impact',
      'Status',
      'Observation',
      'Reply',
      'Date',
      'Sheet Number',
      'Revision',
      'Aconex Reference',
      'Source File'
    ];

    const rows = observations.map(item => [
      item.station,
      item.level,
      item.discipline,
      item.impact,
      item.status,
      item.observation,
      item.reply,
      item.date,
      item.sheetNumber,
      item.revision,
      item.aconexReference,
      item.sourceFileName
    ]);

    downloadCsv('observation_register.csv', headers, rows);
  };

  const exportDrawings = () => {
    const headers = [
      'Drawing Number',
      'File Name',
      'Station',
      'Level',
      'Discipline',
      'Revision',
      'Status',
      'Upload Date'
    ];

    const rows = drawings.map(item => [
      item.drawingNumber,
      item.fileName,
      item.station,
      item.level,
      item.discipline,
      item.revision,
      item.status,
      item.uploadDate
    ]);

    downloadCsv('drawing_register.csv', headers, rows);
  };

  const exportDocuments = () => {
    const headers = [
      'Document Number',
      'File Name',
      'Type',
      'Revision',
      'Station',
      'Discipline',
      'Size',
      'Upload Date'
    ];

    const rows = documents.map(item => [
      item.documentNumber,
      item.name,
      item.type,
      item.revision,
      item.station,
      item.discipline,
      item.size,
      item.uploadDate
    ]);

    downloadCsv('document_register.csv', headers, rows);
  };

  const openObservations = observations.filter(item => item.status === 'Open').length;
  const closedObservations = observations.filter(item => item.status === 'Closed').length;
const closureRate =
  observations.length > 0
    ? Math.round(
        (closedObservations / observations.length) * 100
      )
    : 0;


  const openRfis = rfis.filter(item => item.status === 'Open').length;
  const openNcrs = ncrs.filter(item => item.status === 'Open').length;
  const openPunches = punches.filter(item => item.status === 'Open').length;

  const ifcDrawings = drawings.filter(item => item.status === 'IFC').length;
  const underReviewDrawings = drawings.filter(item => item.status === 'Under Review').length;
  const supersededDrawings = drawings.filter(item => item.status === 'Superseded').length;

  const totalRecords =
    observations.length +
    drawings.length +
    documents.length +
    rfis.length +
    ncrs.length +
    punches.length;

const stationCounts: Record<string, number> = {};

observations.forEach(item => {
  const station = item.station || 'Unknown';

  stationCounts[station] =
    (stationCounts[station] || 0) + 1;
});

const topStations = Object.entries(stationCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
const levelCounts = {
  LG: 0,
  GR: 0,
  MZ: 0,
  FR: 0,
  ROOF: 0,
};

observations.forEach(item => {
  const level = (item.level || '').toUpperCase();

  if (levelCounts.hasOwnProperty(level)) {
    levelCounts[level as keyof typeof levelCounts]++;
  }
});

  const exportProjectSummary = () => {
    const headers = [
      'Metric',
      'Value'
    ];

    const rows = [
      ['Total Project Records', totalRecords],
      ['Total Documents', documents.length],
      ['Total Drawings', drawings.length],
      ['IFC Drawings', ifcDrawings],
      ['Under Review Drawings', underReviewDrawings],
      ['Superseded Drawings', supersededDrawings],
      ['Total Observations', observations.length],
      ['Open Observations', openObservations],
      ['Closed Observations', closedObservations],
      ['Open RFIs', openRfis],
      ['Open NCRs', openNcrs],
      ['Open Punch Items', openPunches]
    ];

    downloadCsv('project_summary_report.csv', headers, rows);
  };

  return (
    <div className="space-y-6">

<div className="bg-white border border-slate-200 rounded-3xl p-6">

  <h3 className="text-lg font-bold text-slate-900 mb-4">
    Top Problematic Stations
  </h3>

  <div className="space-y-3">

    {topStations.map(([station, count], index) => (

      <div
        key={station}
        className="flex items-center justify-between border border-slate-200 rounded-xl p-3"
      >
        <div className="flex items-center gap-3">

          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
            {index + 1}
          </div>

          <span className="font-semibold">
            {station}
          </span>

        </div>

        <span className="font-bold text-red-600">
          {count}
        </span>

      </div>

    ))}

  </div>

</div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Reports Center
        </h2>

        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-4">
          Reports & Export Phase 1
        </div>

        <p className="text-slate-500 mb-6">
          Export project registers and analytics from documents, observations, drawings, RFIs, NCRs, and punch items.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase">
              Total Records
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {totalRecords}
            </h3>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-xs text-red-600 font-bold uppercase">
              Open Observations
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-red-600">
              {openObservations}
            </h3>
          </div>

          <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4">
            <p className="text-xs text-cyan-600 font-bold uppercase">
              Total Drawings
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-cyan-600">
              {drawings.length}
            </h3>
          </div>

<div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
  <p className="text-xs text-emerald-600 font-bold uppercase">
    Closure Rate
  </p>

  <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
    {closureRate}%
  </h3>
</div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <button
            onClick={exportObservations}
            className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl"
          >
            Export Observation Register
          </button>

          <button
            onClick={exportDrawings}
            className="px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl"
          >
            Export Drawing Register
          </button>

          <button
            onClick={exportDocuments}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
          >
            Export Document Register
          </button>

          <button
            onClick={exportProjectSummary}
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl"
          >
            Export Project Summary
          </button>

        </div>
      </div>

<div className="bg-white border border-slate-200 rounded-3xl p-6">

  <h3 className="text-lg font-bold text-slate-900 mb-4">
    Observations By Level
  </h3>

  <div className="space-y-3">

    {Object.entries(levelCounts).map(([level, count]) => (

      <div
        key={level}
        className="flex items-center justify-between border border-slate-200 rounded-xl p-3"
      >
        <span className="font-semibold">
          {level}
        </span>

        <span className="font-bold text-indigo-600">
          {count}
        </span>

      </div>

    ))}

  </div>

</div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Export Notes
        </h3>

        <ul className="space-y-2 text-sm text-slate-600">
          <li>
            CSV files can be opened directly in Excel.
          </li>

          <li>
            Exported data is based on the current browser local storage.
          </li>

          <li>
            PDF export can be added later in Reports Center Phase 2.
          </li>

          <li>
            Mobile app storage and cloud sync will be handled in the mobile phase.
          </li>
        </ul>
      </div>

    </div>
  );
}