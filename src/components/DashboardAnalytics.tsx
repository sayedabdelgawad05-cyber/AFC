import React, { useEffect, useState } from 'react';

export default function DashboardAnalytics() {
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

  const openObservations = observations.filter(
    item => item.status === 'Open'
  ).length;

  const closedObservations = observations.filter(
    item => item.status === 'Closed'
  ).length;

  const closureRate =
    observations.length > 0
      ? Math.round(
          (closedObservations / observations.length) * 100
        )
      : 0;

  const openRfis = rfis.filter(
    item => item.status === 'Open'
  ).length;

  const openNcrs = ncrs.filter(
    item => item.status === 'Open'
  ).length;

  const openPunches = punches.filter(
    item => item.status === 'Open'
  ).length;

  const underReviewDrawings = drawings.filter(
    item => item.status === 'Under Review'
  ).length;

  const supersededDrawings = drawings.filter(
    item => item.status === 'Superseded'
  ).length;

  const drawingRiskIndex =
    drawings.length > 0
      ? Math.round(
          ((underReviewDrawings + supersededDrawings) /
            drawings.length) *
            100
        )
      : 0;

  const totalProjectRecords =
    observations.length +
    drawings.length +
    documents.length +
    rfis.length +
    ncrs.length +
    punches.length;

  const projectHealthScore = Math.max(
    0,
    100 -
      openObservations * 2 -
      openRfis * 3 -
      openNcrs * 5 -
      openPunches * 2 -
      Math.round(drawingRiskIndex / 2)
  );

  const stationCounts: Record<string, number> = {};

  observations.forEach(item => {
    const station = item.station || 'Unknown';

    stationCounts[station] =
      (stationCounts[station] || 0) + 1;
  });

  const topStations = Object.entries(stationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">

      <div className="bg-white border border-slate-200 rounded-3xl p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Project Health Analytics
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Live engineering health summary.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-bold">
            Dashboard Analytics
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase">
              Total Records
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {totalProjectRecords}
            </h3>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-xs text-emerald-600 font-bold uppercase">
              Project Health
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
              {projectHealthScore}%
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

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs text-indigo-600 font-bold uppercase">
              Closure Rate
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-indigo-600">
              {closureRate}%
            </h3>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <p className="text-xs text-orange-600 font-bold uppercase">
              Open RFIs
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-orange-600">
              {openRfis}
            </h3>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <p className="text-xs text-purple-600 font-bold uppercase">
              Open NCRs
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-purple-600">
              {openNcrs}
            </h3>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-700 font-bold uppercase">
              Open Punch
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-slate-700">
              {openPunches}
            </h3>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-amber-600 font-bold uppercase">
              Drawing Risk
            </p>

            <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
              {drawingRiskIndex}%
            </h3>
          </div>

        </div>

      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">

        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Top Problematic Stations
        </h3>

        <div className="space-y-3">

          {topStations.length === 0 ? (
            <p className="text-sm text-slate-500">
              No station analytics available.
            </p>
          ) : (
            topStations.map(([station, count]) => (
              <div
                key={station}
                className="flex items-center justify-between border border-slate-200 rounded-xl p-3"
              >
                <span className="font-semibold">
                  {station}
                </span>

                <span className="font-bold text-red-600">
                  {count}
                </span>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}