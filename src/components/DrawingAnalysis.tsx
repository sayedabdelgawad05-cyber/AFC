import React, { useEffect, useState } from 'react';

interface DrawingItem {
  id: number;
  drawingNumber: string;
  fileName: string;
  station: string;
  level: string;
  discipline: string;
  revision: string;
  status: 'IFC' | 'Under Review' | 'Superseded' | 'Draft';
  uploadDate: string;
}

export default function DrawingAnalysis() {
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [drawingNumber, setDrawingNumber] = useState('');
  const [station, setStation] = useState('');
  const [level, setLevel] = useState('');
  const [discipline, setDiscipline] = useState('AFC');
  const [revision, setRevision] = useState('');
  const [status, setStatus] = useState<'IFC' | 'Under Review' | 'Superseded' | 'Draft'>('Under Review');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'IFC' | 'Under Review' | 'Superseded' | 'Draft'>('All');

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem('hsr_drawings') || '[]'
    );

    setDrawings(saved);
  }, []);

  const saveDrawings = (items: DrawingItem[]) => {
    setDrawings(items);
    localStorage.setItem('hsr_drawings', JSON.stringify(items));
  };

const getDrawingBaseKey = (drawingNumberValue: string) => {
  return drawingNumberValue
    .replace(/\[[^\]]+\]/g, '')
    .replace(/rev[\s\-_]*[a-z0-9]+/gi, '')
    .replace(/\s+/g, '')
    .toUpperCase();
};

const getRevisionRank = (revisionValue: string) => {
  const cleanRevision = revisionValue
    .replace('REV', '')
    .replace('.', '')
    .replace('-', '')
    .trim()
    .toUpperCase();

  if (!cleanRevision || cleanRevision === 'NO REVISION') return 0;

  if (/^[A-Z]$/.test(cleanRevision)) {
    return cleanRevision.charCodeAt(0) - 64;
  }

  const numericValue = Number(cleanRevision);

  return Number.isNaN(numericValue) ? 0 : numericValue;
};

  const detectStationFromText = (text: string) => {
    const value = text.toLowerCase();

    if (value.includes('gla01') || value.includes('ain sokhna') || value.includes('sokhna')) return 'Ain Sokhna';
    if (value.includes('glb02') || value.includes('new capital')) return 'New Capital';
    if (value.includes('glb03') || value.includes('mohamed naguib') || value.includes('ahmed omar hashem')) return 'Mohamed Naguib';
    if (value.includes('glb04') || value.includes('cairo')) return 'Cairo';
    if (value.includes('glb05') || value.includes('giza')) return 'Giza';
    if (value.includes('glc06') || value.includes('october gardens')) return 'October Gardens';
    if (value.includes('gld07') || value.includes('6 october') || value.includes('6th october')) return '6 October';
    if (value.includes('gle08') || value.includes('sphinx')) return 'Sphinx';
    if (value.includes('gle09') || value.includes('sadat')) return 'Sadat';
    if (value.includes('gle10') || value.includes('wadi')) return 'Wadi El Natroun';
    if (value.includes('glf11') || value.includes('noubarya') || value.includes('noubaria')) return 'Noubarya';
    if (value.includes('gle12') || value.includes('army stadium') || value.includes('alexandria')) return 'Army Stadium';
    if (value.includes('glg13') || value.includes('borg') || value.includes('borj')) return 'Borg El Arab';
    if (value.includes('glg14') || value.includes('hammam') || value.includes('hamam')) return 'Hammam';
    if (value.includes('glh15') || value.includes('alamein') || value.includes('alameen')) return 'Alamein';
    if (value.includes('gli16') || value.includes('sidi')) return 'Sidi Abdelrahman';
    if (value.includes('gli17') || value.includes('dabaa') || value.includes('daaba')) return 'Dabaa';
    if (value.includes('glm19') || value.includes('ras el hekma') || value.includes('ras hekma')) return 'Ras El Hekma';
    if (value.includes('glm21') || value.includes('matrouh') || value.includes('matruh')) return 'Matrouh';

    return '';
  };

  const detectLevelFromText = (text: string) => {
    const value = text.toLowerCase();

    if (value.includes('lower ground') || value.includes('lg') || value.includes('l.g')) return 'Lower Ground';
    if (value.includes('ground floor') || value.includes('gr') || value.includes('g.f') || value.includes('gf')) return 'Ground';
    if (value.includes('mezzanine') || value.includes('mz') || value.includes('m.z') || value.includes('mezz')) return 'Mezzanine';
    if (value.includes('first floor') || value.includes('fr') || value.includes('1st') || value.includes('f.f')) return 'First';
    if (value.includes('roof') || value.includes('rf') || value.includes('r.f')) return 'Roof';

    return '';
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    setSelectedFile(file);

    const fileName = file.name;

    if (!drawingNumber) {
      setDrawingNumber(fileName.replace(/\.[^/.]+$/, ''));
    }

    const detectedStation = detectStationFromText(fileName);
    const detectedLevel = detectLevelFromText(fileName);

    if (detectedStation) setStation(detectedStation);
    if (detectedLevel) setLevel(detectedLevel);

    const revisionMatch = fileName.match(/\[([A-Z0-9]+)\]/i);

    if (revisionMatch) {
      setRevision(revisionMatch[1].toUpperCase());
    }
  };

  const handleAddDrawing = () => {
    if (!selectedFile) {
      alert('Please select a drawing file.');
      return;
    }

    if (!drawingNumber.trim()) {
      alert('Please enter drawing number.');
      return;
    }

    const alreadyImported = drawings.some(
      item => item.fileName === selectedFile.name
    );

    if (alreadyImported) {
      const confirmed = window.confirm(
        'This drawing file was already imported before. Do you want to continue?'
      );

      if (!confirmed) return;
    }

    const newDrawing: DrawingItem = {
      id: Date.now(),
      drawingNumber,
      fileName: selectedFile.name,
      station: station || 'Unknown Station',
      level: level || 'Not specified',
      discipline,
      revision: revision || 'No Revision',
      status,
      uploadDate: new Date().toLocaleDateString()
    };

const newDrawingBaseKey = getDrawingBaseKey(drawingNumber);
const newRevisionRank = getRevisionRank(revision || 'No Revision');

const relatedDrawings = drawings.filter(
  item => getDrawingBaseKey(item.drawingNumber) === newDrawingBaseKey
);

const sameRevisionExists = relatedDrawings.some(
  item => getRevisionRank(item.revision) === newRevisionRank
);

if (sameRevisionExists) {
  const confirmed = window.confirm(
    'This drawing revision already exists. Do you want to continue?'
  );

  if (!confirmed) return;
}

const latestExistingRevision = relatedDrawings
  .sort((a, b) => getRevisionRank(b.revision) - getRevisionRank(a.revision))[0];

if (
  latestExistingRevision &&
  newRevisionRank < getRevisionRank(latestExistingRevision.revision)
) {
  const confirmed = window.confirm(
    'You are adding an older revision than the latest registered revision. Do you want to continue?'
  );

  if (!confirmed) return;
}

const shouldSupersedePrevious =
  relatedDrawings.length > 0 &&
  newRevisionRank > getRevisionRank(latestExistingRevision?.revision || 'No Revision');

const preparedDrawings = shouldSupersedePrevious
  ? drawings.map(item =>
      getDrawingBaseKey(item.drawingNumber) === newDrawingBaseKey
        ? {
            ...item,
            status: 'Superseded' as const
          }
        : item
    )
  : drawings;

const updated = [...preparedDrawings, newDrawing];

saveDrawings(updated);


    setSelectedFile(null);
    setDrawingNumber('');
    setStation('');
    setLevel('');
    setDiscipline('AFC');
    setRevision('');
    setStatus('Under Review');
  };

  const handleDeleteDrawing = (id: number) => {
    const updated = drawings.filter(item => item.id !== id);
    saveDrawings(updated);
  };

  const handleClearAllDrawings = () => {
    const confirmed = window.confirm('Delete all drawing records?');

    if (!confirmed) return;

    localStorage.removeItem('hsr_drawings');
    setDrawings([]);
  };

  const filteredDrawings = drawings.filter((item) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      item.drawingNumber.toLowerCase().includes(search) ||
      item.fileName.toLowerCase().includes(search) ||
      item.station.toLowerCase().includes(search) ||
      item.level.toLowerCase().includes(search) ||
      item.discipline.toLowerCase().includes(search) ||
      item.revision.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalDrawings = drawings.length;

  const ifcDrawings = drawings.filter(
    item => item.status === 'IFC'
  ).length;

  const underReviewDrawings = drawings.filter(
    item => item.status === 'Under Review'
  ).length;

  const supersededDrawings = drawings.filter(
    item => item.status === 'Superseded'
  ).length;

  const stationMap: Record<string, number> = {};

  drawings.forEach((item) => {
    stationMap[item.station] = (stationMap[item.station] || 0) + 1;
  });

  const topDrawingStation = Object.entries(stationMap)
    .sort((a, b) => b[1] - a[1])[0];

  const disciplineMap: Record<string, number> = {};

  drawings.forEach((item) => {
    disciplineMap[item.discipline] = (disciplineMap[item.discipline] || 0) + 1;
  });

  const topDrawingDiscipline = Object.entries(disciplineMap)
    .sort((a, b) => b[1] - a[1])[0];

  const revisionMap: Record<string, number> = {};

  drawings.forEach((item) => {
    revisionMap[item.revision] = (revisionMap[item.revision] || 0) + 1;
  });

  const topDrawingRevision = Object.entries(revisionMap)
    .sort((a, b) => b[1] - a[1])[0];

const drawingRevisionGroups: Record<string, DrawingItem[]> = {};

drawings.forEach((item) => {
  const key = getDrawingBaseKey(item.drawingNumber);

  if (!drawingRevisionGroups[key]) {
    drawingRevisionGroups[key] = [];
  }

  drawingRevisionGroups[key].push(item);
});

const drawingsWithMultipleRevisions = Object.values(drawingRevisionGroups)
  .filter(group => group.length > 1).length;

const latestRevisionDrawings = Object.values(drawingRevisionGroups)
  .map(group =>
    [...group].sort(
      (a, b) => getRevisionRank(b.revision) - getRevisionRank(a.revision)
    )[0]
  );

const latestRevisionCount = latestRevisionDrawings.length;
const latestRevisionIds = new Set(
  latestRevisionDrawings.map(item => item.id)
);

const revisionTrackingSummary = `
Drawing groups detected: ${Object.keys(drawingRevisionGroups).length}

Drawings with multiple revisions: ${drawingsWithMultipleRevisions}

Latest revision records: ${latestRevisionCount}

Superseded drawings: ${supersededDrawings}
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
${recommendedDrawingActions
  .map((action, index) => `${index + 1}. ${action}`)
  .join('\n')}
`;

const drawingSummary = `
Total drawings registered: ${totalDrawings}

IFC drawings: ${ifcDrawings}

Under review drawings: ${underReviewDrawings}

Superseded drawings: ${supersededDrawings}

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

${
  topDrawingRevision
    ? `Most common revision: ${topDrawingRevision[0]} with ${topDrawingRevision[1]} drawings.`
    : 'No revision data available.'
}
`;

const latestRevisionOnly = drawings.filter(
  item => latestRevisionIds.has(item.id)
);

const latestIfcDrawings = latestRevisionOnly.filter(
  item => item.status === 'IFC'
).length;

const latestUnderReviewDrawings = latestRevisionOnly.filter(
  item => item.status === 'Under Review'
).length;

const latestSupersededDrawings = latestRevisionOnly.filter(
  item => item.status === 'Superseded'
).length;

const drawingExecutiveSummary = `
Latest Revision Records: ${latestRevisionOnly.length}

Latest IFC Drawings: ${latestIfcDrawings}

Latest Under Review Drawings: ${latestUnderReviewDrawings}

Latest Superseded Drawings: ${latestSupersededDrawings}

Drawing Risk Index: ${drawingRiskIndex}/100

Coordination Load: ${drawingCoordinationLoad}

Most Revised Drawing Group:
${
  mostRevisedDrawingGroup
    ? mostRevisedDrawingGroup[0]
    : 'Not identified'
}
`;

return (

    <div className="space-y-6">

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Drawing Analysis
        </h2>

        <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold mb-4">
          DWG / Drawing Analysis Phase 1
        </div>

        <p className="text-slate-500 mb-6">
          Register, track, and analyze project drawings, revisions, stations, levels, and disciplines.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase">
              Total Drawings
            </p>
            <h3 className="text-3xl font-extrabold mt-2">
              {totalDrawings}
            </h3>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-xs text-emerald-600 font-bold uppercase">
              IFC Drawings
            </p>
            <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
              {ifcDrawings}
            </h3>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-amber-600 font-bold uppercase">
              Under Review
            </p>
            <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
              {underReviewDrawings}
            </h3>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-xs text-red-600 font-bold uppercase">
              Superseded
            </p>
            <h3 className="text-3xl font-extrabold mt-2 text-red-600">
              {supersededDrawings}
            </h3>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Top Station
            </h3>

            {topDrawingStation ? (
              <>
                <p className="text-xl font-extrabold">
                  {topDrawingStation[0]}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {topDrawingStation[1]} drawings
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
              Top Discipline
            </h3>

            {topDrawingDiscipline ? (
              <>
                <p className="text-xl font-extrabold">
                  {topDrawingDiscipline[0]}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {topDrawingDiscipline[1]} drawings
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
              Top Revision
            </h3>

            {topDrawingRevision ? (
              <>
                <p className="text-xl font-extrabold">
                  {topDrawingRevision[0]}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {topDrawingRevision[1]} drawings
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No revision data available.
              </p>
            )}
          </div>

        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            Drawing Analysis Summary
          </h3>

          <pre className="whitespace-pre-wrap text-sm text-slate-700">
            {drawingSummary}
          </pre>
        </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Drawing Groups
    </p>

    <h3 className="text-3xl font-extrabold mt-2">
      {Object.keys(drawingRevisionGroups).length}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Unique drawing numbers tracked
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Multiple Revisions
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
      {drawingsWithMultipleRevisions}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Drawings having more than one revision
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Latest Records
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-cyan-600">
      {latestRevisionCount}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Latest revision records by drawing group
    </p>
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Revision Tracking Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Foundation for comparing drawing revisions and identifying superseded records
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {revisionTrackingSummary}
    </pre>
  </div>

</div>
<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Revision History Groups
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Grouped drawings by drawing number with their registered revisions.
  </p>

  {Object.entries(drawingRevisionGroups).length === 0 ? (
    <p className="text-sm text-slate-500">
      No revision groups available.
    </p>
  ) : (
    <div className="space-y-3">
      {Object.entries(drawingRevisionGroups).map(([drawingKey, group]) => {
        const sortedGroup = [...group].sort(
          (a, b) => getRevisionRank(b.revision) - getRevisionRank(a.revision)
        );

        const latestItem = sortedGroup[0];

        return (
          <div
            key={drawingKey}
            className="border border-slate-200 rounded-xl p-3 bg-slate-50"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {drawingKey}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Total revisions: {group.length}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">
                  Latest Revision
                </p>

                <p className="text-xl font-extrabold text-cyan-600">
                  {latestItem.revision}
                </p>
              </div>
            </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Drawing Risk Index
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-red-600">
      {drawingRiskIndex}/100
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Calculated from under review, superseded, and multi-revision drawings.
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Coordination Load
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
      {drawingCoordinationLoad}
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Combined drawing review and revision load.
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Superseded Ratio
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-indigo-600">
      {supersededRatio}%
    </h3>

    <p className="text-xs text-slate-500 mt-2">
      Superseded drawings from total registered drawings.
    </p>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Most Revised Drawing Group
    </h3>

    {mostRevisedDrawingGroup ? (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-900">
            {mostRevisedDrawingGroup[0]}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Drawing group with the highest number of revisions
          </p>
        </div>

        <p className="text-3xl font-extrabold text-red-600">
          {mostRevisedDrawingGroup[1].length}
        </p>
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        No multi-revision drawing group detected.
      </p>
    )}
  </div>

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <h3 className="text-lg font-bold text-slate-900 mb-3">
      Drawing Coordination Focus
    </h3>

    {topDrawingDiscipline ? (
      <div>
        <p className="text-xl font-extrabold text-slate-900">
          {topDrawingDiscipline[0]}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Highest discipline by drawing count
        </p>
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        No drawing discipline data available.
      </p>
    )}
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Recommended Drawing Actions
  </h3>

  <div className="space-y-3">
    {recommendedDrawingActions.map((action, index) => (
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
    Drawing Engineering Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Automatically generated drawing engineering interpretation.
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {drawingEngineeringSummary}
    </pre>
  </div>

</div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

  <div className="bg-white border border-slate-200 rounded-2xl p-4">
    <p className="text-xs text-slate-500 font-bold uppercase">
      Latest Revisions
    </p>

    <h3 className="text-3xl font-extrabold mt-2">
      {latestRevisionOnly.length}
    </h3>
  </div>

  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
    <p className="text-xs text-emerald-600 font-bold uppercase">
      Latest IFC
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
      {latestIfcDrawings}
    </h3>
  </div>

  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
    <p className="text-xs text-amber-600 font-bold uppercase">
      Latest Review
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-amber-600">
      {latestUnderReviewDrawings}
    </h3>
  </div>

  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
    <p className="text-xs text-red-600 font-bold uppercase">
      Latest Superseded
    </p>

    <h3 className="text-3xl font-extrabold mt-2 text-red-600">
      {latestSupersededDrawings}
    </h3>
  </div>

</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

  <h3 className="text-lg font-bold text-slate-900">
    Drawing Executive Summary
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-4">
    Executive drawing overview based on latest revisions only
  </p>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {drawingExecutiveSummary}
    </pre>
  </div>

</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {sortedGroup.map(item => (
                <span
                  key={item.id}
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    latestRevisionIds.has(item.id)
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Rev {item.revision} - {item.status}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  )}

</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-semibold mb-2">
              Select Drawing File
            </label>

            <input
              type="file"
              accept=".dwg,.dxf,.pdf,.doc,.docx"
              onChange={(e) =>
                handleFileSelect(e.target.files ? e.target.files[0] : null)
              }
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Drawing Number
            </label>

            <input
              type="text"
              value={drawingNumber}
              onChange={(e) => setDrawingNumber(e.target.value)}
              placeholder="HSR-SOA-AFC-GRB05-000001"
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Station
            </label>

            <input
              type="text"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              placeholder="Giza"
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Level
            </label>

            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="GR / LG / MZ / FR / ROOF"
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Discipline
            </label>

            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            >
              <option>AFC</option>
              <option>SOAC</option>
              <option>Civil</option>
              <option>Architecture</option>
              <option>Structure</option>
              <option>MEP</option>
              <option>Telecom</option>
              <option>Signaling</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Revision
            </label>

            <input
              type="text"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              placeholder="A / B / C"
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'IFC' | 'Under Review' | 'Superseded' | 'Draft')
              }
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            >
              <option>Under Review</option>
              <option>IFC</option>
              <option>Superseded</option>
              <option>Draft</option>
            </select>
          </div>

        </div>

        <button
          onClick={handleAddDrawing}
          className="mt-5 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl"
        >
          Add Drawing
        </button>

        <button
          onClick={handleClearAllDrawings}
          className="mt-5 ml-3 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
        >
          Clear All Drawings
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-4">
          Drawing Register
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

          <input
            type="text"
            placeholder="Search drawings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2 w-full border border-slate-300 rounded-xl px-3 py-2"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'All' | 'IFC' | 'Under Review' | 'Superseded' | 'Draft')
            }
            className="w-full border border-slate-300 rounded-xl px-3 py-2"
          >
            <option value="All">All Statuses</option>
            <option value="IFC">IFC Only</option>
            <option value="Under Review">Under Review Only</option>
            <option value="Superseded">Superseded Only</option>
            <option value="Draft">Draft Only</option>
          </select>

        </div>

        {filteredDrawings.length === 0 ? (
          <p className="text-slate-500">
            No drawings found.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredDrawings.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h4 className="font-bold text-slate-900">
                      {item.drawingNumber}
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      {item.station} | {item.level} | {item.discipline} | Rev {item.revision}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Source File: {item.fileName}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Uploaded: {item.uploadDate}
                    </p>
                  </div>

                  <div className="text-right">
                    {latestRevisionIds.has(item.id) && (
  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
    Latest Revision
  </span>
)}

<span className="ml-2 text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-700">
  {item.status}
</span>


                    <button
                      onClick={() => handleDeleteDrawing(item.id)}
                      className="ml-2 text-xs font-bold px-3 py-1 rounded-full bg-slate-700 text-white hover:bg-slate-900"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}