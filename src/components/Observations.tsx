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
}

export default function Observations() {
  const [observations, setObservations] = useState<ObservationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredObservations = observations.filter((item) => {
    const search = searchTerm.toLowerCase();

    return (
      item.station.toLowerCase().includes(search) ||
      item.level.toLowerCase().includes(search) ||
      item.discipline.toLowerCase().includes(search) ||
      item.observation.toLowerCase().includes(search) ||
      item.reply.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search) ||
      item.impact.toLowerCase().includes(search)
    );
  });

  const openObservations = observations.filter(
    item => item.status === 'Open'
  ).length;

  const closedObservations = observations.filter(
    item => item.status === 'Closed'
  ).length;

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
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-4">
          Observations List
        </h3>

        <input
          type="text"
          placeholder="Search observations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3 py-2 mb-4"
        />

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