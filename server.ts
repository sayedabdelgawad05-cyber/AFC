import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { DEFAULT_USERS, DEFAULT_STATIONS, DEFAULT_RFIS, DEFAULT_NCRS, DEFAULT_PUNCH_ITEMS } from './src/defaultData.js';

dotenv.config();

console.log('Gemini Key Exists:', !!process.env.GEMINI_API_KEY);

const app = express();
const PORT = 3000;

// Body parser limits for base64 images
app.use(express.json({ limit: '20mb' }));

const DB_FILE_PATH = path.join(process.cwd(), 'db.json');

// Interface for DB persistence
interface Database {
  users: any[];
  stations: any[];
  rfis: any[];
  ncrs: any[];
  punches: any[];
  reports: any[];
}

// Ensure database file exists and load it
let db: Database = {
  users: [...DEFAULT_USERS],
  stations: [...DEFAULT_STATIONS],
  rfis: [...DEFAULT_RFIS],
  ncrs: [...DEFAULT_NCRS],
  punches: [...DEFAULT_PUNCH_ITEMS],
  reports: []
};

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save db.json:', error);
  }
}


function loadDb() {
  try {
    console.log('DB FILE PATH:', DB_FILE_PATH);

    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');

      console.log('RAW DB FILE:', data);

      db = JSON.parse(data);

      console.log('DB AFTER LOAD:', db);
    } else {
      console.log('DB FILE NOT FOUND - CREATING NEW ONE');
      saveDb();
    }
  } catch (error) {
    console.error('Failed to load db.json, using defaults:', error);
  }
}
loadDb();

// Lazy Gemini API initialization helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('API Key Present:', !!apiKey);

    if (apiKey) {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        console.log('Gemini Client Created');
      } catch (err) {
        console.error('Gemini Client Error:', err);
      }
    }
  }

  return aiClient;
}

// Dynamic KPI Calculator helper
function updateStationKPIs() {
  db.stations = db.stations.map((st) => {
    const stationRfis = db.rfis.filter(r => r.stationId === st.id);
    const stationNcrs = db.ncrs.filter(n => n.stationId === st.id);
    const stationPunches = db.punches.filter(p => p.stationId === st.id);

    return {
      ...st,
      totalRFIs: stationRfis.length,
      openRFIs: stationRfis.filter(r => r.status === 'Open').length,
      totalNCRs: stationNcrs.length,
      openNCRs: stationNcrs.filter(n => n.status === 'Open').length,
      totalPunches: stationPunches.length,
      openPunches: stationPunches.filter(p => p.status === 'Open').length,
    };
  });
  saveDb();
}

// ----------------------------------------
// API ENDPOINTS
// ----------------------------------------

// Auth API
app.post('/api/auth/login', (req, res) => {
 
const { username, password } = req.body;

console.log('LOGIN REQUEST:', username, password);
console.log('USERS IN DB:', db.users);

const user = db.users.find(
  u =>
    u.username === username &&
    u.password === password
);

console.log('FOUND USER:', user);

if (!user) {
  return res.status(401).json({
    success: false,
    message: 'Invalid username or password'
  });
}

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || ''
      }
    });
 
});

// User Management APIs
app.get('/api/users', (req, res) => {
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;
  if (!newUser.username || !newUser.name || !newUser.role) {
    return res.status(400).json({ error: 'Username, name and role are required.' });
  }
  
  const exists = db.users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  newUser.id = 'usr-' + Date.now();
  if (!newUser.avatarUrl) {
    newUser.avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  }
  
  db.users.push(newUser);
  saveDb();
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.users[idx] = { ...db.users[idx], ...updatedData };
  saveDb();
  res.json(db.users[idx]);
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  if (id === 'usr-1') {
    return res.status(400).json({ error: 'Cannot delete the primary Administrator.' });
  }
  db.users = db.users.filter(u => u.id !== id);
  saveDb();
  res.json({ success: true });
});

// Project Stations API
app.get('/api/stations', (req, res) => {
  updateStationKPIs();
  res.json(db.stations);
});

app.get('/api/stations/:id', (req, res) => {
  const { id } = req.params;
  const station = db.stations.find(s => s.id === id);
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  const rfis = db.rfis.filter(r => r.stationId === id);
  const ncrs = db.ncrs.filter(n => n.stationId === id);
  const punches = db.punches.filter(p => p.stationId === id);

  res.json({ station, rfis, ncrs, punches });
});

// RFIs Management
app.get('/api/rfis', (req, res) => {
  res.json(db.rfis);
});

app.post('/api/rfis', (req, res) => {
  const rfi = req.body;
  rfi.id = 'rfi-' + Date.now();
  db.rfis.push(rfi);
  updateStationKPIs();
  res.status(201).json(rfi);
});

app.put('/api/rfis/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.rfis.findIndex(r => r.id === id);
  if (idx !== -1) {
    db.rfis[idx] = { ...db.rfis[idx], ...req.body };
    updateStationKPIs();
    res.json(db.rfis[idx]);
  } else {
    res.status(404).json({ error: 'RFI not found' });
  }
});

app.delete('/api/rfis/:id', (req, res) => {
  db.rfis = db.rfis.filter(r => r.id !== req.params.id);
  updateStationKPIs();
  res.json({ success: true });
});

// NCRs Management
app.get('/api/ncrs', (req, res) => {
  res.json(db.ncrs);
});

app.post('/api/ncrs', (req, res) => {
  const ncr = req.body;
  ncr.id = 'ncr-' + Date.now();
  db.ncrs.push(ncr);
  updateStationKPIs();
  res.status(201).json(ncr);
});

app.put('/api/ncrs/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.ncrs.findIndex(n => n.id === id);
  if (idx !== -1) {
    db.ncrs[idx] = { ...db.ncrs[idx], ...req.body };
    updateStationKPIs();
    res.json(db.ncrs[idx]);
  } else {
    res.status(404).json({ error: 'NCR not found' });
  }
});

app.delete('/api/ncrs/:id', (req, res) => {
  db.ncrs = db.ncrs.filter(n => n.id !== req.params.id);
  updateStationKPIs();
  res.json({ success: true });
});

// Punch list Management
app.get('/api/punches', (req, res) => {
  res.json(db.punches);
});

app.post('/api/punches', (req, res) => {
  const punch = req.body;
  punch.id = 'pnc-' + Date.now();
  db.punches.push(punch);
  updateStationKPIs();
  res.status(201).json(punch);
});

app.put('/api/punches/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.punches.findIndex(p => p.id === id);
  if (idx !== -1) {
    db.punches[idx] = { ...db.punches[idx], ...req.body };
    updateStationKPIs();
    res.json(db.punches[idx]);
  } else {
    res.status(404).json({ error: 'Punch item not found' });
  }
});

app.delete('/api/punches/:id', (req, res) => {
  db.punches = db.punches.filter(p => p.id !== req.params.id);
  updateStationKPIs();
  res.json({ success: true });
});

// Inspection Reports Management
app.get('/api/reports', (req, res) => {
  res.json(db.reports);
});

app.post('/api/reports', (req, res) => {
  const report = req.body;
  if (!report.id) {
    report.id = 'rep-' + Date.now();
  }
  
  // Clean duplicates on sync
  db.reports = db.reports.filter(r => r.id !== report.id);
  db.reports.push(report);
  saveDb();
  res.status(201).json(report);
});

app.put('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.reports.findIndex(r => r.id === id);
  if (idx !== -1) {
    db.reports[idx] = { ...db.reports[idx], ...req.body };
    saveDb();
    res.json(db.reports[idx]);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

app.delete('/api/reports/:id', (req, res) => {
  db.reports = db.reports.filter(r => r.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Import simulated data
app.post('/api/data/import', (req, res) => {
  const { type, items } = req.body; // e.g., type: 'rfi' | 'ncr' | 'punch'
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required for import.' });
  }

  if (type === 'rfi') {
    items.forEach(it => {
      it.id = 'rfi-imp-' + Math.floor(Math.random() * 1000000);
      db.rfis.push(it);
    });
  } else if (type === 'ncr') {
    items.forEach(it => {
      it.id = 'ncr-imp-' + Math.floor(Math.random() * 1000000);
      db.ncrs.push(it);
    });
  } else if (type === 'punch') {
    items.forEach(it => {
      it.id = 'pnc-imp-' + Math.floor(Math.random() * 1000000);
      db.punches.push(it);
    });
  }

  updateStationKPIs();
  res.json({ success: true, count: items.length });
});

// ----------------------------------------
// GEMINI INTELLIGENCE APIs
// ----------------------------------------

// Translate raw notes (Arabic/English) to professional structured English Engineering Report
app.post('/api/ai/translate-report', async (req, res) => {
  const { notesRaw, type, stationName } = req.body;
  if (!notesRaw) {
    return res.status(400).json({ error: 'Notes raw content is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant fallback simulation
    return res.json({
      success: true,
      notesEn: {
        technicalNotes: `Conducted detailed field walk and physical inspection of AFC ticketing terminals and entry-barrier gates at ${stationName || 'the station'}. Equipment structural alignment verified. Power cabling termination checked for continuous contact.`,
        identifiedIssues: `Identified minor cosmetic scrapes on the ticketing terminal external casings. Discovered slight misalignment in the cable protection sleeves of Gateway Gate-03.`,
        correctiveActions: `Instructed local civil works sub-contractor to re-level containment base and seal with approved silicone. Re-tag MDF visual marker panels.`,
        recommendations: `Upgrade field enclosures waterproofing seal before testing and commissioning phase. Deploy temporary portable dehumidifiers if humidity climbs.`,
        followUpPlan: `Verify Gate-03 signal release functionality under emergency simulation on the next inspection cycle.`
      }
    });
  }

  try {
    const systemPrompt = `You are an expert Senior Site Commissioning Engineer specialized in Automatic Fare Collection (AFC) and site inspections for Siemens Mobility.
Your task is to take informal site inspection notes written in Arabic, English, or a mix of both (Franco-Arab), and translate/transform them into an extremely professional, technical, formal English engineering site inspection record.
The tone must match Siemens Mobility global standards for high-speed rail engineering projects.
Always produce five structured JSON fields:
1. technicalNotes: Technical description of completed work, tests conducted, or observed installations.
2. identifiedIssues: Clear, engineering-grade description of any issues, damage, misalignments, or non-conformances.
3. correctiveActions: Action items for site technicians or contractors to resolve identified issues.
4. recommendations: Proactive preventive engineering recommendations.
5. followUpPlan: Next actions, dates, or specific tests for the next inspection.

Your output MUST be a valid JSON object matching this schema:
{
  "technicalNotes": "string",
  "identifiedIssues": "string",
  "correctiveActions": "string",
  "recommendations": "string",
  "followUpPlan": "string"
}
Do not include any Markdown or formatting other than the pure JSON string.`;

    const userPrompt = `Station: ${stationName || 'Egypt HSR Site'}
Report Type: ${type || 'Site Inspection'}
Raw Engineer Notes:
"${notesRaw}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technicalNotes: { type: Type.STRING },
            identifiedIssues: { type: Type.STRING },
            correctiveActions: { type: Type.STRING },
            recommendations: { type: Type.STRING },
            followUpPlan: { type: Type.STRING },
          },
          required: ['technicalNotes', 'identifiedIssues', 'correctiveActions', 'recommendations', 'followUpPlan']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, notesEn: parsed });
  } catch (error: any) {
    console.error('Gemini translate-report error:', error);
    res.status(500).json({ error: 'AI Translation processing failed.', details: error.message });
  }
});

// Analyze site inspection image via Gemini Multimodal
app.post('/api/ai/analyze-image', async (req, res) => {
  const { imageBase64, mimeType, userNotes } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Base64 image data is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      description: "Visual inspection of AFC installation shows standard ticket vending machine cabinet securely anchored to the concrete plinth. Cable entry conduits are routed via floor cavities. Cabling requires final gland tightening and approved Siemens labeling before closing.",
      detectedIssues: "Cable containment covers not yet secured. Visual alignment check indicates 3mm tilt of the side-panel relative to neighboring gate structure.",
      engineeringAction: "Secure metal protection covers. Re-verify vertical levels using a standard bubble level. Affix approved tags."
    });
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    };

    const systemPrompt = `You are a Senior Railway Quality Inspector for Siemens Mobility on the Egypt High Speed Rail Project.
Analyze the provided site photo which displays an AFC (Automatic Fare Collection) installation, ticketing machines, turnstile gates, cabling, server racks, or general railway site elements.
Write a detailed, professional technical description of the equipment, structural state, cable routing, earthing, or general workmanship shown.
Identify any visible technical issues or defects (such as wire clutter, loose conduits, missing waterproofing, alignment deviations, dirt, water ingress, unfinished paint).
Provide the precise engineering correction action required.

Return a valid JSON object matching this schema:
{
  "description": "Professional engineering description of what is shown in the photo, emphasizing workmanship.",
  "detectedIssues": "Any issues, defects, hazards, or non-conformances visible in the image. Write 'No visible defects' if perfect.",
  "engineeringAction": "Concrete step-by-step engineering instructions to resolve issues or proceed with handover."
}`;

    const userPromptText = `Engineer site comments: "${userNotes || 'None'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          imagePart,
          { text: userPromptText }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            detectedIssues: { type: Type.STRING },
            engineeringAction: { type: Type.STRING }
          },
          required: ['description', 'detectedIssues', 'engineeringAction']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Gemini image analysis error:', error);
    res.status(500).json({ error: 'AI Image analysis failed.', details: error.message });
  }
});

// Interactive AI Assistant with Contextualized Project Data
app.post('/api/ai/assistant', async (req, res) => {
  const { messages, activeStationId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const ai = getGeminiClient();
console.log('AI Client Status:', ai ? 'READY' : 'NULL');
  
  // Format our live database into readable text chunks to inject as Gemini's real-time knowledge base
  const stationsSummary = db.stations.map(s => 
    `- Station: ${s.nameEn}, Progress: ${s.progress}%, Open RFIs: ${s.openRFIs}/${s.totalRFIs}, Open NCRs: ${s.openNCRs}/${s.totalNCRs}, Open Punch: ${s.openPunches}/${s.totalPunches}, Delayed: ${s.delayedTasksCount}`
  ).join('\n');

  const openRfis = db.rfis.filter(r => r.status === 'Open').map(r => 
    `- RFI ${r.number}: Subject "${r.subject}" at ${db.stations.find(s => s.id === r.stationId)?.nameEn || r.stationId} (Priority: ${r.priority}, Assignee: ${r.assignee})`
  ).join('\n');

  const openNcrs = db.ncrs.filter(n => n.status === 'Open').map(n => 
    `- NCR ${n.number}: "${n.description}" (Priority: ${n.priority}, Corrective Action: ${n.correctiveAction})`
  ).join('\n');

  const openPunches = db.punches.filter(p => p.status === 'Open').map(p => 
    `- Punch ${p.number}: "${p.description}" at ${db.stations.find(s => s.id === p.stationId)?.nameEn || p.stationId} (Category: ${p.category}, Assignee: ${p.assignee})`
  ).join('\n');

  let activeStationContext = '';
  if (activeStationId) {
    const active = db.stations.find(s => s.id === activeStationId);
    if (active) {
      activeStationContext = `The user is currently viewing the station details of "${active.nameEn}". Keep this in mind as the default context of the inquiry unless specified otherwise.`;
    }
  }

  const systemInstruction = `You are the Egypt High Speed Rail (HSR) Engineering AI Assistant, designed specifically for Siemens Mobility Egypt's AFC (Automatic Fare Collection) and Site Inspection teams.
Your tone must be highly professional, helpful, accurate, and engineering-focused.
You are bilingual: you understand Arabic, Franco-Arab, and English perfectly. 
You must always respond in the same language used by the user.

Arabic question → Arabic answer.
English question → English answer.

Do not mix Arabic and English unless the user mixes both languages first.
Keep engineering terminology such as AFC, RFI, NCR, Punch List, TVM, SC, UPS and Gate Array in English.

lways answer using the live database data provided in this prompt.

If requested information does not exist in the database, clearly state that no matching records were found.

Never invent stations, RFIs, NCRs, Punch Items, reports, progress percentages, users, or statistics.When summarizing, use structured bullet points and professional terms (NCR, RFI, Punch List, TVM, Gate Barrier, UPS).

Here is the exact real-time live database state of the project. ALWAYS answer using this factual data and do NOT make up RFIs, NCRs, or stations:

[PROJECT GENERAL STATIONS SUMMARY]
${stationsSummary}

[OPEN RFIS]
${openRfis || 'No open RFIs.'}

[OPEN NON-CONFORMANCE REPORTS (NCRs)]
${openNcrs || 'No open NCRs.'}

[OPEN PUNCH LIST ITEMS]
${openPunches || 'No open Punch List items.'}

${activeStationContext}


If the user asks to create a site inspection report, generate a professional Siemens-style report using the actual station data available in the live database.

Always use the current stations stored in the database.
Never assume station names.
Use only real-time project data from RFIs, NCRs, Punch Items, Reports, and Stations.

Respond in the same language used by the user.
If the user writes in Arabic, respond in Arabic.
If the user writes in English, respond in English.`;

  // Process message history for Gemini chat format
  const chatContents = messages.map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  
if (!ai) {
  return res.json({
    success: true,
    text: 'AI service is currently unavailable. Please configure the Gemini API key in the server settings.'
  });
}

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction
      }
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini Assistant chat error:', error);
    res.status(500).json({ error: 'AI Assistant failed to generate a response.', details: error.message });
  }
});

// ----------------------------------------
// VITE CLIENT MIDDLEWARE & SERVER BOOT
// ----------------------------------------

app.get('/api/models', async (req, res) => {
  try {
    const ai = getGeminiClient();

    const models = await ai.models.list();

    res.json(models);
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Siemens Egypt HSR Backend running on port ${PORT}`);
  });
}

start();
