import React, { useEffect, useState } from 'react';
import mammoth from 'mammoth';

interface ObservationItem {
  id: number;
  station: string;
  level: string;
  discipline: string;
  observation: string;
  reply: string;
  status: 'Open' | 'Closed';
  impact: 'Major' | 'Minor';
  date: string;

  sheetNumber?: string;
  sheetTitle?: string;
  revision?: string;
  aconexReference?: string;
  sourceFileName?: string;
  importBatchId?: string;
}

export default function Observations() {
  const [observations, setObservations] = useState<ObservationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');
   const [selectedWordFile, setSelectedWordFile] = useState<File | null>(null);
   const [importedText, setImportedText] = useState('');


  const [station, setStation] = useState('');
  const [level, setLevel] = useState('');
  const [discipline, setDiscipline] = useState('AFC');
  const [observation, setObservation] = useState('');
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<'Open' | 'Closed'>('Open');
  const [impact, setImpact] = useState<'Major' | 'Minor'>('Major');

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem('hsr_observations') || '[]'
    );

    setObservations(saved);
  }, []);

  const saveObservations = (items: ObservationItem[]) => {
    setObservations(items);
    localStorage.setItem('hsr_observations', JSON.stringify(items));
  };

const handleImportWordFile = async () => {
  if (!selectedWordFile) {
    alert('Please select a Word file first.');
    return;
  }

  try {
    const arrayBuffer = await selectedWordFile.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer
    });

    setImportedText(result.value);

    alert('Word file imported successfully.');
  } catch (error) {
    console.error('Word import error:', error);
    alert('Failed to import Word file.');
  }
};

const handleCreateObservationsFromText = () => {
  if (!importedText.trim()) {
    alert('Please import a Word file first.');
    return;
  }

  const lines = importedText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);


let detectedStation = station || 'Unknown Station';
let detectedLevel = level || 'Not specified';

const detectionText = [
  selectedWordFile ? selectedWordFile.name : '',
  lines.slice(0, 150).join(' ')
].join(' ').toLowerCase();

const containsAny = (keywords: string[]) => {
  return keywords.some(keyword => detectionText.includes(keyword));
};

// Station Detection
if (containsAny([
  'ain sokhna',
  'ain shokhna',
  'ain al sokhna',
  'ain al shokhna',
  'sokhna',
  'shokhna',
  'gla01'
])) {
  detectedStation = 'Ain Sokhna';
} else if (containsAny([
  'new capital',
  'new administrative capital',
  'capital station',
  'glb02'
])) {
  detectedStation = 'New Capital';
} else if (containsAny([
  'mohamed naguib',
  'mohamed nageeb',
  'ahmed omar hashem',
  'ahmed omar hashim',
  'glb03'
])) {
  detectedStation = 'Mohamed Naguib';
} else if (containsAny([
  'cairo station',
  'cairo',
  'glb04'
])) {
  detectedStation = 'Cairo';
} else if (containsAny([
  'giza station',
  'giza',
  'glb05'
])) {
  detectedStation = 'Giza';
} else if (containsAny([
  'october gardens',
  'october garden',
  'gardens october',
  'glc06'
])) {
  detectedStation = 'October Gardens';
} else if (containsAny([
  '6th october',
  '6 october',
  'sixth october',
  '6th of october',
  'gld07'
])) {
  detectedStation = '6 October';
} else if (containsAny([
  'sphinx',
  'gle08'
])) {
  detectedStation = 'Sphinx';
} else if (containsAny([
  'el sadat',
  'al sadat',
  'sadat',
  'gle09'
])) {
  detectedStation = 'Sadat';
} else if (containsAny([
  'wadi el natroun',
  'wadi el natrun',
  'wadi al natroun',
  'wadi al natrun',
  'wadi el-natroun',
  'gle10'
])) {
  detectedStation = 'Wadi El Natroun';
} else if (containsAny([
  'noubarya',
  'noubaria',
  'el noubarya',
  'al noubarya',
  'noubariya',
  'glf11'
])) {
  detectedStation = 'Noubarya';
} else if (containsAny([
  'alexandria army stadium',
  'alexandria (army stadium)',
  'army stadium',
  'alexandria',
  'gle12'
])) {
  detectedStation = 'Army Stadium';
} else if (containsAny([
  'borg el arab',
  'borj el arab',
  'borg al arab',
  'borj al arab',
  'glg13'
])) {
  detectedStation = 'Borg El Arab';
} else if (containsAny([
  'hammam',
  'hamam',
  'el hamam',
  'al hamam',
  'el hammam',
  'al hammam',
  'glg14'
])) {
  detectedStation = 'Hammam';
} else if (containsAny([
  'alamein',
  'alameen',
  'el alamein',
  'el alameen',
  'al alameen',
  'glh15'
])) {
  detectedStation = 'Alamein';
} else if (containsAny([
  'sidi abdelrahman',
  'sidi abdel rahman',
  'sidi abdul rahman',
  'sidi',
  'gli16'
])) {
  detectedStation = 'Sidi Abdelrahman';
} else if (containsAny([
  'dabaa',
  'daaba',
  'el dabaa',
  'al daaba',
  'el daaba',
  'gli17'
])) {
  detectedStation = 'Dabaa';
} else if (containsAny([
  'ras el hekma',
  'ras al hakma',
  'ras el heikma',
  'ras el hikma',
  'ras hekma',
  'glm19'
])) {
  detectedStation = 'Ras El Hekma';
} else if (containsAny([
  'marsa matrouh',
  'marsa matruh',
  'matrouh',
  'matruh',
  'glm21'
])) {
  detectedStation = 'Matrouh';
}

const extractBetween = (text: string, start: string, end: string) => {
  const regex = new RegExp(`${start}([\\s\\S]*?)${end}`, 'i');
  const match = text.match(regex);

  return match
    ? match[1].trim().split('\n').filter(Boolean).pop()?.trim() || ''
    : '';
};

const sheetNumber = extractBetween(
  importedText,
  'Observation Sheet Number:',
  'Observation Sheet Title:'
);

const sheetTitle = extractBetween(
  importedText,
  'Observation Sheet Title:',
  'Document Supplier:'
);

const revision = extractBetween(
  importedText,
  'Observation Sheet Revision:',
  'Aconex Reference Number'
);

const aconexReference = extractBetween(
  importedText,
  'Aconex Reference Number:',
  'Receiving Date:'
);

const importBatchId = `batch-${Date.now()}`;

const sourceFileName = selectedWordFile
  ? selectedWordFile.name
  : 'Unknown File';

  const isItemNumberLine = (line: string) => {
    return /^\d+\.?$/.test(line.trim());
  };

// Level Detection
if (containsAny([
  'lower ground',
  'lower ground floor',
  'lg',
  'lg ',
  'lg-',
  'l.g',
  'l.g.',
  'lg floor',
  'l.ground',
  'l ground',
  'lower g',
  'lower-ground',
  'lowerground'
])) {
  detectedLevel = 'Lower Ground';
} else if (containsAny([
  'ground floor',
  'gr',
  'gr ',
  'gr-',
  'g.floor',
  'g floor',
  'gf',
  'g.f',
  'g.f.',
  'ground'
])) {
  detectedLevel = 'Ground';
} else if (containsAny([
  'mezzanine',
  'mezzanine floor',
  'mz',
  'mz ',
  'mz-',
  'm.z',
  'm.z.',
  'mezz',
  'mez'
])) {
  detectedLevel = 'Mezzanine';
} else if (containsAny([
  'first floor',
  'fr',
  'fr ',
  'fr-',
  '1st floor',
  'first',
  'f.floor',
  'f floor',
  'ff',
  'f.f',
  'f.f.'
])) {
  detectedLevel = 'First';
} else if (containsAny([
  'roof',
  'roof floor',
  'roof level',
  'rf',
  'r.f',
  'r.f.'
])) {
  detectedLevel = 'Roof';
}


  const createdItems: ObservationItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!isItemNumberLine(lines[i])) continue;

    let nextItemIndex = lines.findIndex((line, index) => {
      return index > i && isItemNumberLine(line);
    });

    if (nextItemIndex === -1) {
      nextItemIndex = lines.length;
    }

    const block = lines.slice(i, nextItemIndex);

    const pageSection = block[1] || detectedLevel;

    const impactIndex = block.findIndex((line) => {
      const value = line.trim();
      return value === 'M' || value === 'm';
    });

    const statusIndex = block.findIndex((line) => {
      const value = line.trim().toLowerCase();
      return value === 'open' || value === 'closed';
    });

    const impactValue: 'Major' | 'Minor' =
      impactIndex !== -1 && block[impactIndex].trim() === 'm'
        ? 'Minor'
        : 'Major';

    const statusValue: 'Open' | 'Closed' =
      statusIndex !== -1 &&
      block[statusIndex].trim().toLowerCase() === 'closed'
        ? 'Closed'
        : 'Open';

    const observationStart = 2;

    const observationEnd =
      impactIndex !== -1
        ? impactIndex
        : statusIndex !== -1
        ? statusIndex
        : Math.min(block.length, 12);

    const replyStart =
      impactIndex !== -1
        ? impactIndex + 1
        : observationEnd;

    const replyEnd =
      statusIndex !== -1
        ? statusIndex
        : block.length;

    const observationText = block
      .slice(observationStart, observationEnd)
      .filter(line => {
        const value = line.trim().toLowerCase();

        return (
          value !== 'soa' &&
          value !== 'contractor' &&
          value !== 'comments' &&
          value !== 'response' &&
          value !== 'status' &&
          value !== 'system / name' &&
          value !== 'impact'
        );
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const replyText = block
      .slice(replyStart, replyEnd)
      .filter(line => {
        const value = line.trim().toLowerCase();

        return (
          value !== 'soa' &&
          value !== 'contractor' &&
          value !== 'comments' &&
          value !== 'response' &&
          value !== 'status' &&
          value !== 'system / name' &&
          value !== 'impact' &&
          value !== 'm' &&
          value !== 'major' &&
          value !== 'minor'
        );
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!observationText) continue;

    const newItem: ObservationItem = {
  id: Date.now() + i,
  station: detectedStation,
  level: pageSection || detectedLevel,
  discipline: 'SOAC',
  observation: observationText,
  reply: replyText,
  status: statusValue,
  impact: impactValue,
  date: new Date().toLocaleDateString(),

  sheetNumber,
  sheetTitle,
  revision,
  aconexReference,
  sourceFileName,
  importBatchId
};


    createdItems.push(newItem);
  }
if (createdItems.length === 0) {
  const dateLineRegex = /^\d{1,2}\/\d{1,2}\/\d{4}/;

  const dateLineIndexes = lines
    .map((line, index) => ({ line, index }))
    .filter(item => dateLineRegex.test(item.line));

  if (dateLineIndexes.length > 0) {
    const fallbackItems: ObservationItem[] = [];

    for (let i = 0; i < dateLineIndexes.length; i++) {
      const startIndex = dateLineIndexes[i].index;
      const endIndex =
        i + 1 < dateLineIndexes.length
          ? dateLineIndexes[i + 1].index
          : lines.length;

      const block = lines.slice(startIndex, endIndex);

      const headerLine = block[0] || '';
      const blockText = block
        .slice(1)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!blockText) continue;

      const fallbackStatus: 'Open' | 'Closed' =
        importedText.toLowerCase().includes('closed') ? 'Closed' : 'Open';

      const fallbackItem: ObservationItem = {
        id: Date.now() + i,
        station: detectedStation,
        level: detectedLevel,
        discipline: 'SOAC',
        observation: `${headerLine} - ${blockText}`,
        reply: '',
        status: fallbackStatus,
        impact: 'Major',
        date: new Date().toLocaleDateString(),

        sheetNumber,
        sheetTitle,
        revision,
        aconexReference,
        sourceFileName,
        importBatchId
      };

      fallbackItems.push(fallbackItem);
    }

    if (fallbackItems.length > 0) {
      const updated = [...observations, ...fallbackItems];

      saveObservations(updated);

      alert(`Imported ${fallbackItems.length} observations using date-based parser.`);

      return;
    }
  }

  const fallbackStatus: 'Open' | 'Closed' =
    importedText.toLowerCase().includes('closed') ? 'Closed' : 'Open';

  const fallbackObservation = lines
    .filter(line => {
      const value = line.toLowerCase();

      return (
        value !== 'soa' &&
        value !== 'contractor' &&
        value !== 'comments' &&
        value !== 'response' &&
        value !== 'status' &&
        value !== 'impact'
      );
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const fallbackItem: ObservationItem = {
    id: Date.now(),
    station: detectedStation,
    level: detectedLevel,
    discipline: 'SOAC',
    observation: fallbackObservation || 'Observation extracted from Word file.',
    reply: '',
    status: fallbackStatus,
    impact: 'Major',
    date: new Date().toLocaleDateString(),

    sheetNumber,
    sheetTitle,
    revision,
    aconexReference,
    sourceFileName,
    importBatchId
  };

  const updated = [...observations, fallbackItem];

  saveObservations(updated);

  alert('Imported 1 observation using fallback parser.');

  return;
}

  const updated = [...observations, ...createdItems];

  saveObservations(updated);

  alert(`Imported ${createdItems.length} observations successfully.`);
};

const handleAddObservation = () => {
  if (!station.trim() || !observation.trim()) {
    alert('Please enter station and observation.');
    return;
  }

  const newItem: ObservationItem = {
    id: Date.now(),
    station,
    level,
    discipline,
    observation,
    reply,
    status,
    impact,
    date: new Date().toLocaleDateString()
  };

  const updated = [...observations, newItem];

  saveObservations(updated);

  setStation('');
  setLevel('');
  setDiscipline('AFC');
  setObservation('');
  setReply('');
  setStatus('Open');
  setImpact('Major');
};

const handleToggleObservationStatus = (id: number) => {
  const updated = observations.map(item =>
    item.id === id
      ? {
          ...item,
          status: item.status === 'Open' ? 'Closed' : 'Open'
        }
      : item
  );

  saveObservations(updated);
};

const handleDeleteObservation = (id: number) => {
  const updated = observations.filter(
    item => item.id !== id
  );

  saveObservations(updated);
};
const handleClearAllObservations = () => {
  const confirmed = window.confirm(
    'Delete all observations?'
  );

  if (!confirmed) return;

  localStorage.removeItem('hsr_observations');

  setObservations([]);
};

const filteredObservations = observations.filter((item) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    item.station.toLowerCase().includes(search) ||
    item.level.toLowerCase().includes(search) ||
    item.discipline.toLowerCase().includes(search) ||
    item.observation.toLowerCase().includes(search) ||
    item.reply.toLowerCase().includes(search) ||
    item.status.toLowerCase().includes(search) ||
    item.impact.toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === 'All' || item.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  const openObservations = observations.filter(
    item => item.status === 'Open'
  ).length;

  const closedObservations = observations.filter(
    item => item.status === 'Closed'
  ).length;

const stationOpenObservationMap: Record<string, number> = {};

observations.forEach((item) => {
  if (item.status !== 'Open') return;

  const stationName = item.station || 'Unknown Station';

  stationOpenObservationMap[stationName] =
    (stationOpenObservationMap[stationName] || 0) + 1;
});

const topProblematicStations = Object.entries(stationOpenObservationMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

const stationObservationSummaryMap: Record<
  string,
  { total: number; open: number; closed: number }
> = {};

observations.forEach((item) => {
  const stationName = item.station || 'Unknown Station';

  if (!stationObservationSummaryMap[stationName]) {
    stationObservationSummaryMap[stationName] = {
      total: 0,
      open: 0,
      closed: 0
    };
  }

  stationObservationSummaryMap[stationName].total += 1;

  if (item.status === 'Open') {
    stationObservationSummaryMap[stationName].open += 1;
  }

  if (item.status === 'Closed') {
    stationObservationSummaryMap[stationName].closed += 1;
  }
});

const stationObservationSummary = Object.entries(
  stationObservationSummaryMap
).sort((a, b) => b[1].total - a[1].total);

const disciplineObservationMap: Record<string, number> = {};

observations.forEach((item) => {
  const disciplineName = item.discipline || 'Unknown';

  disciplineObservationMap[disciplineName] =
    (disciplineObservationMap[disciplineName] || 0) + 1;
});

const topDisciplines = Object.entries(disciplineObservationMap)
  .sort((a, b) => b[1] - a[1]);

const getObservationPattern = (text: string) => {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    normalized.includes('missing connection') ||
    (normalized.includes('cable tray') && normalized.includes('conduit'))
  ) {
    return 'Missing connection between cable tray and conduit';
  }

  if (
    normalized.includes('sharp') ||
    normalized.includes('bend') ||
    normalized.includes('radius') ||
    normalized.includes('fitting')
  ) {
    return 'Sharp bends / cable tray fitting radius issue';
  }

  if (
    normalized.includes('systra to guarantee') ||
    normalized.includes('connection between the conduits and cable trays')
  ) {
    return 'SYSTRA to guarantee cable tray and conduit connection';
  }

  if (
    normalized.includes('embedded conduits') ||
    normalized.includes('not presented')
  ) {
    return 'Embedded conduits missing or not presented';
  }

  if (
    normalized.includes('door opening') ||
    normalized.includes('technical rooms')
  ) {
    return 'Technical room door opening direction issue';
  }

  return normalized
    .split(' ')
    .slice(0, 10)
    .join(' ');
};

const repeatedObservationMap: Record<string, number> = {};

observations.forEach((item) => {
  const key = getObservationPattern(item.observation);

  if (key.trim()) {
    repeatedObservationMap[key] = (repeatedObservationMap[key] || 0) + 1;
  }
});

const repeatedObservations = Object.entries(repeatedObservationMap)
  .filter(([_, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

const lessonsLearned = repeatedObservations.map(([pattern, count]) => {
  let lesson = '';

  if (pattern.toLowerCase().includes('missing connection')) {
    lesson =
      'Ensure cable tray and conduit interface details are coordinated and clearly shown before issuing shop drawings.';
  } else if (pattern.toLowerCase().includes('sharp bends')) {
    lesson =
      'Verify cable tray bend radius and use standard fittings to avoid cable installation and maintenance issues.';
  } else if (pattern.toLowerCase().includes('embedded conduits')) {
    lesson =
      'Embedded conduit locations must be included and coordinated with SOAC cable tray routes at early design stages.';
  } else if (pattern.toLowerCase().includes('door opening')) {
    lesson =
      'Technical room door opening direction must be checked against access, maintenance, and equipment installation requirements.';
  } else {
    lesson =
      'Repeated observation pattern should be reviewed and addressed during coordination before next revision submission.';
  }

  return {
    pattern,
    count,
    lesson
  };
});

const getReplyPattern = (text: string) => {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    normalized.includes('pending the details') ||
    normalized.includes('p2 for the connection')
  ) {
    return 'Pending details from P2 for cable tray/conduit connection';
  }

  if (
    normalized.includes('standard fitting') ||
    normalized.includes('fittings shall be standard')
  ) {
    return 'Standard fittings will be used';
  }

  if (
    normalized.includes('has been considered') ||
    normalized.includes('considered in site')
  ) {
    return 'Comment has been considered';
  }

  if (
    normalized.includes('not valid') ||
    normalized.includes('comment is not valid')
  ) {
    return 'Contractor response: Comment not valid';
  }

  if (
    normalized.includes('as built') ||
    normalized.includes('as-built')
  ) {
    return 'To be considered in as-built drawings';
  }

  return normalized
    .split(' ')
    .slice(0, 10)
    .join(' ');
};

const repeatedReplyMap: Record<string, number> = {};

observations.forEach((item) => {
  if (!item.reply.trim()) return;

  const key = getReplyPattern(item.reply);

  if (key.trim()) {
    repeatedReplyMap[key] = (repeatedReplyMap[key] || 0) + 1;
  }
});

const repeatedReplies = Object.entries(repeatedReplyMap)
  .filter(([_, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);


  return (
    <div className="space-y-6">

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Observation Register
        </h2>

        <p className="text-slate-500 mb-6">
          Register and track station observations, contractor replies, status, and impact.
        </p>

<div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
  <h3 className="text-md font-bold text-slate-900 mb-3">
    Import Observation Sheet
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Upload a Word observation sheet to extract its text content.
  </p>

  <input
    type="file"
    accept=".doc,.docx"
    onChange={(e) =>
      setSelectedWordFile(
        e.target.files ? e.target.files[0] : null
      )
    }
    className="w-full border border-slate-300 rounded-xl px-3 py-2 mb-3"
  />

  <button
    onClick={handleImportWordFile}
    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl"
  >
    Import Word File
  </button>

<button
  onClick={handleCreateObservationsFromText}
  className="ml-3 px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl"
>
  Create Observations
</button>

  {importedText && (
    <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto">
      <h4 className="font-bold mb-2">
        Extracted Text Preview
      </h4>

      <pre className="text-xs whitespace-pre-wrap text-slate-700">
        {importedText}
      </pre>
    </div>
  )}
</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase">
              Total Observations
            </p>
            <h3 className="text-3xl font-extrabold mt-2">
              {observations.length}
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

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-xs text-emerald-600 font-bold uppercase">
              Closed Observations
            </p>
            <h3 className="text-3xl font-extrabold mt-2 text-emerald-600">
              {closedObservations}
            </h3>
          </div>

        </div>
<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Most Repeated Observations
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Similar observation patterns detected from imported and manual observations.
  </p>

  {repeatedObservations.length === 0 ? (
    <p className="text-sm text-slate-500">
      No repeated observation patterns detected yet.
    </p>
  ) : (
    <div className="space-y-3">
      {repeatedObservations.map(([text, count]) => (
        <div
          key={text}
          className="border border-slate-200 rounded-xl p-3 bg-slate-50"
        >
          <p className="text-sm font-semibold text-slate-800">
            {text}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Repeated {count} times
          </p>
        </div>
      ))}
    </div>
  )}
</div>
<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Most Repeated Contractor Replies
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Similar contractor reply patterns detected from imported and manual observations.
  </p>

  {repeatedReplies.length === 0 ? (
    <p className="text-sm text-slate-500">
      No repeated contractor reply patterns detected yet.
    </p>
  ) : (
    <div className="space-y-3">
      {repeatedReplies.map(([text, count]) => (
        <div
          key={text}
          className="border border-slate-200 rounded-xl p-3 bg-slate-50"
        >
          <p className="text-sm font-semibold text-slate-800">
            {text}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Repeated {count} times
          </p>
        </div>
      ))}
    </div>
  )}
</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Top Problematic Stations
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Stations ranked by number of open observations.
  </p>

  {topProblematicStations.length === 0 ? (
    <p className="text-sm text-slate-500">
      No open observations found.
    </p>
  ) : (
    <div className="space-y-3">
      {topProblematicStations.map(([stationName, count]) => (
        <div
          key={stationName}
          className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {stationName}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Open observations
            </p>
          </div>

          <p className="text-xl font-extrabold text-red-600">
            {count}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Observation Summary by Station
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Summary of total, open, and closed observations grouped by station.
  </p>

  {stationObservationSummary.length === 0 ? (
    <p className="text-sm text-slate-500">
      No station observation summary available.
    </p>
  ) : (
    <div className="space-y-3">
      {stationObservationSummary.map(([stationName, summary]) => (
        <div
          key={stationName}
          className="border border-slate-200 rounded-xl p-3 bg-slate-50"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {stationName}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Total: {summary.total} | Open: {summary.open} | Closed: {summary.closed}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">
                Open
              </p>

              <p className="text-xl font-extrabold text-red-600">
                {summary.open}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Top Observation Disciplines
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Disciplines ranked by total observations.
  </p>

  {topDisciplines.length === 0 ? (
    <p className="text-sm text-slate-500">
      No discipline statistics available.
    </p>
  ) : (
    <div className="space-y-3">
      {topDisciplines.map(([discipline, count]) => (
        <div
          key={discipline}
          className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between"
        >
          <span className="font-semibold">
            {discipline}
          </span>

          <span className="text-xl font-bold text-indigo-600">
            {count}
          </span>
        </div>
      ))}
    </div>
  )}
</div>

<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
  <h3 className="text-lg font-bold text-slate-900 mb-3">
    Lessons Learned
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Engineering lessons generated from repeated observation patterns.
  </p>

  {lessonsLearned.length === 0 ? (
    <p className="text-sm text-slate-500">
      No lessons learned generated yet.
    </p>
  ) : (
    <div className="space-y-3">
      {lessonsLearned.map((item) => (
        <div
          key={item.pattern}
          className="border border-slate-200 rounded-xl p-3 bg-slate-50"
        >
          <p className="text-sm font-bold text-slate-900">
            {item.pattern}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Repeated {item.count} times
          </p>

          <p className="text-sm text-slate-700 mt-2">
            <strong>Lesson:</strong> {item.lesson}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-semibold mb-2">
              Station
            </label>
            <input
              type="text"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              placeholder="Wadi El Natroun"
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
              placeholder="Ground Floor"
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
              Impact
            </label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as 'Major' | 'Minor')}
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            >
              <option>Major</option>
              <option>Minor</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">
              Observation
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Write the observation here..."
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">
              Contractor Reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write contractor reply here..."
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Open' | 'Closed')}
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            >
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>

        </div>

        <button
          onClick={handleAddObservation}
          className="mt-5 px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl"
        >
          Add Observation
        </button>
<button
  onClick={handleClearAllObservations}
  className="mt-5 ml-3 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
>
  Clear All Observations
</button>

      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-4">
          Observations List
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

  <input
    type="text"
    placeholder="Search observations..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="md:col-span-2 w-full border border-slate-300 rounded-xl px-3 py-2"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Open' | 'Closed')}
    className="w-full border border-slate-300 rounded-xl px-3 py-2"
  >
    <option value="All">All Statuses</option>
    <option value="Open">Open Only</option>
    <option value="Closed">Closed Only</option>
  </select>

</div>


        {filteredObservations.length === 0 ? (
          <p className="text-slate-500">
            No observations found.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredObservations.map((item) => (
              <div
                key={item.id}
                className={`border rounded-xl p-4 ${
                  item.status === 'Open'
                    ? 'border-red-200 bg-red-50'
                    : 'border-emerald-200 bg-emerald-50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {item.station}
                    </h4>

                    <p className="text-sm text-slate-500">
                      {item.level} | {item.discipline} | {item.impact}
                    </p>
<div className="mt-2 text-xs text-slate-500 space-y-1">
  <p>
    <strong>Sheet No.:</strong> {item.sheetNumber || 'Not captured'}
  </p>

  <p>
    <strong>Revision:</strong> {item.revision || 'Not captured'}
  </p>

  <p>
    <strong>Aconex Ref.:</strong> {item.aconexReference || 'Not captured'}
  </p>

  <p>
    <strong>Source File:</strong> {item.sourceFileName || 'Not captured'}
  </p>
</div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.status === 'Open'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.status}
                  </span>
<button
  onClick={() => handleToggleObservationStatus(item.id)}
  className={`ml-2 text-xs font-bold px-3 py-1 rounded-full ${
    item.status === 'Open'
      ? 'bg-emerald-500 text-white'
      : 'bg-red-500 text-white'
  }`}
>
  {item.status === 'Open' ? 'Close' : 'Reopen'}
</button>

<button
  onClick={() => handleDeleteObservation(item.id)}
  className="ml-2 text-xs font-bold px-3 py-1 rounded-full bg-slate-700 text-white hover:bg-slate-900"
>
  Delete
</button>

                </div>

                <p className="text-sm text-slate-700 mt-3">
                  <strong>Observation:</strong> {item.observation}
                </p>

                {item.reply && (
                  <p className="text-sm text-slate-700 mt-2">
                    <strong>Reply:</strong> {item.reply}
                  </p>
                )}

                <p className="text-xs text-slate-500 mt-2">
                  Date: {item.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}