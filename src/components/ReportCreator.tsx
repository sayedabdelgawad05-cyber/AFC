import React, { useState, useRef } from 'react';
import { Station, InspectionReport, PhotoAttachment, User } from '../types';
import { api, isOnline } from '../lib/api';
import { 
  FileText, 
  MapPin, 
  Sparkles, 
  Image as ImageIcon, 
  Trash2, 
  Printer, 
  Save, 
  RefreshCw, 
  UploadCloud, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle,
  Eye,
  FileDown
} from 'lucide-react';

interface ReportCreatorProps {
  stations: Station[];
  currentUser: User | null;
  onSaveReport: (report: InspectionReport) => void;
  activeReport?: InspectionReport | null;
  onCloseCreator: () => void;
}

export default function ReportCreator({
  stations,
  currentUser,
  onSaveReport,
  activeReport,
  onCloseCreator
}: ReportCreatorProps) {
  const [stationId, setStationId] = useState(activeReport?.stationId || stations[0]?.id || '');
  const [reportType, setReportType] = useState<'Site Inspection' | 'Installation Progress'>(
    activeReport?.type || 'Site Inspection'
  );
  const [title, setTitle] = useState(activeReport?.title || 'Site Inspection Record');
  const [date, setDate] = useState(activeReport?.date || new Date().toISOString().split('T')[0]);
  
  // Notes states
  const [notesRaw, setNotesRaw] = useState(activeReport?.notesRaw || '');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [technicalNotes, setTechnicalNotes] = useState(activeReport?.notesEn?.technicalNotes || '');
  const [identifiedIssues, setIdentifiedIssues] = useState(activeReport?.notesEn?.identifiedIssues || '');
  const [correctiveActions, setCorrectiveActions] = useState(activeReport?.notesEn?.correctiveActions || '');
  const [recommendations, setRecommendations] = useState(activeReport?.notesEn?.recommendations || '');
  const [followUpPlan, setFollowUpPlan] = useState(activeReport?.notesEn?.followUpPlan || '');

  // Photo attachments state
  const [photos, setPhotos] = useState<PhotoAttachment[]>(activeReport?.photos || []);
  const [analyzingPhotoId, setAnalyzingPhotoId] = useState<string | null>(null);

  const [uiError, setUiError] = useState('');
  const [uiSuccess, setUiSuccess] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedStation = stations.find(s => s.id === stationId);

  // Trigger AI translation & structuring
  const handleAiTranslate = async () => {
    if (!notesRaw.trim()) {
      setUiError('Please enter some raw notes or comments first.');
      return;
    }
    setIsTranslating(true);
    setUiError('');
    setUiSuccess('');

    try {
      const result = await api.translateReportNotes(
        notesRaw, 
        reportType, 
        selectedStation?.nameEn || 'Station'
      );
      
      setTechnicalNotes(result.technicalNotes);
      setIdentifiedIssues(result.identifiedIssues);
      setCorrectiveActions(result.correctiveActions);
      setRecommendations(result.recommendations);
      setFollowUpPlan(result.followUpPlan);

      setUiSuccess('AI successfully translated, structured, and formulated your report details in English!');
    } catch (err) {
      setUiError('Failed to translate notes via AI, please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Upload Photo handler (loads into base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newPhoto: PhotoAttachment = {
          id: 'photo-' + Date.now() + Math.floor(Math.random() * 1000),
          url: base64String,
          description: 'Uploading and processing photo...',
          timestamp: new Date().toLocaleTimeString(),
          analyzed: false
        };

        setPhotos((prev) => [...prev, newPhoto]);
        // Automatically trigger AI analysis of the photo
        triggerPhotoAnalysis(newPhoto.id, base64String, file.type);
      };
      reader.readAsDataURL(file);
    });
  };

  // Analyze Photo using Gemini Multimodal
  const triggerPhotoAnalysis = async (photoId: string, base64: string, mime: string) => {
    setAnalyzingPhotoId(photoId);
    try {
      const analysis = await api.analyzeImage(base64, mime, notesRaw);
      
      setPhotos((prev) => prev.map(p => {
        if (p.id === photoId) {
          return {
            ...p,
            description: `${analysis.description}\n\n• Detected: ${analysis.detectedIssues}\n• Action Required: ${analysis.engineeringAction}`,
            analyzed: true
          };
        }
        return p;
      }));

      // Append discovered issues to main report body if empty
      if (analysis.detectedIssues !== 'No visible defects' && analysis.detectedIssues !== 'none') {
        setIdentifiedIssues(prev => prev ? `${prev}\n- ${analysis.detectedIssues}` : `- ${analysis.detectedIssues}`);
      }
      if (analysis.engineeringAction) {
        setCorrectiveActions(prev => prev ? `${prev}\n- ${analysis.engineeringAction}` : `- ${analysis.engineeringAction}`);
      }
    } catch (err) {
      setPhotos((prev) => prev.map(p => {
        if (p.id === photoId) {
          return {
            ...p,
            description: 'Failed to analyze photo, click refresh to retry.',
            analyzed: false
          };
        }
        return p;
      }));
    } finally {
      setAnalyzingPhotoId(null);
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Save Report (Draft or Submitted)
  const handleSave = (status: 'Draft' | 'Submitted') => {
    if (!stationId) {
      setUiError('Please select a station.');
      return;
    }

    const report: InspectionReport = {
      id: activeReport?.id || 'rep-' + Date.now(),
      title,
      stationId,
      date,
      type: reportType,
      engineerName: currentUser?.name || 'Moustafa El-Shenawy',
      notesRaw,
      notesEn: {
        technicalNotes,
        identifiedIssues,
        correctiveActions,
        recommendations,
        followUpPlan
      },
      photos,
      status,
      syncStatus: 'pending' // Checked inside saveReport
    };

    onSaveReport(report);
    setUiSuccess(`Report saved successfully as ${status}!`);
    setTimeout(() => {
      onCloseCreator();
    }, 1500);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div id="report_creator_panel" className="space-y-6">
      {/* Printable Report View (only visible in print-media mode or preview mode) */}
      {isPreview ? (
        <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4 no-print">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Siemens HSR Report Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPreview(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                Go back & Edit
              </button>
              <button
                onClick={triggerPrint}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print or Save to PDF</span>
              </button>
            </div>
          </div>

          {/* Siemens Mobility Official Document Header */}
          <div className="space-y-6 print:space-y-6">
            <div className="flex justify-between items-start border-b-4 border-teal-600 pb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans tracking-tight uppercase">
                  SIEMENS MOBILITY
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">EGYPT HIGH SPEED RAIL PROJECT (GREEN LINE)</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono px-2 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded">
                  Doc-Ref: HSR-AFC-SIR-{selectedStation?.nameEn.replace(/\s+/g, '').toUpperCase()}-{date.replace(/-/g, '')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Contractor: Siemens Mobility Egypt LLC</p>
              </div>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-sans">
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Station Name</span>
                <span className="text-slate-900 font-bold text-sm">{selectedStation?.nameEn}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Document Type</span>
                <span className="text-slate-900 font-bold text-sm">{reportType}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Inspection Date</span>
                <span className="text-slate-900 font-bold text-sm">{date}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Lead Commissioning Engineer</span>
                <span className="text-slate-900 font-bold text-sm">{currentUser?.name || 'Moustafa El-Shenawy'}</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-3 border-y border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">{title}</h2>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-teal-200 pb-1">
                  1. Technical Notes & Executed Scope
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {technicalNotes || 'No technical notes recorded.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-teal-200 pb-1">
                  2. Identified Issues & Deviations
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {identifiedIssues || 'No outstanding issues or deviations identified.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-teal-200 pb-1">
                  3. Corrective Actions Required
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {correctiveActions || 'No corrective action items required.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-teal-200 pb-1">
                  4. Preventative Recommendations
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {recommendations || 'No preventive recommendations.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-teal-200 pb-1">
                  5. Action & Follow-up Plan
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {followUpPlan || 'No follow-up inspection cycle scheduled.'}
                </p>
              </div>
            </div>

            {/* Photo attachments inside document */}
            {photos.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-teal-200 pb-1">
                  6. Visual Photographic Attachments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {photos.map((ph, idx) => (
                    <div key={ph.id} className="border border-slate-200 p-3 rounded-xl bg-slate-50 space-y-2 break-inside-avoid">
                      <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                        <img 
                          src={ph.url} 
                          alt={`Attachment ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Figure {idx + 1}: Captured at {ph.timestamp}
                      </p>
                      <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {ph.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engineer Sign-off signature footer */}
            <div className="pt-10 grid grid-cols-2 gap-8 text-xs border-t border-slate-200 break-inside-avoid">
              <div className="space-y-4">
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Report Formulated By</p>
                <div className="h-10 border-b border-slate-300"></div>
                <div>
                  <span className="font-bold text-slate-800">{currentUser?.name || 'Moustafa El-Shenawy'}</span>
                  <p className="text-[10px] text-slate-400">Lead AFC Commissioning Engineer</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Approved for Siemens Quality QA/QC</p>
                <div className="h-10 border-b border-slate-300"></div>
                <div>
                  <span className="font-bold text-slate-800">Sayed Abdelgawad</span>
                  <p className="text-[10px] text-slate-400">Siemens HSR System Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Report Form Editor */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Metadata and selection */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Report Metadata & Scope</h3>
              </div>

              {uiError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{uiError}</span>
                </div>
              )}

              {uiSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{uiSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Station Name  </label>
                  <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-700 font-bold"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-700 font-bold"
                  >
                    <option value="Site Inspection">Site Inspection Report</option>
                    <option value="Installation Progress">Installation Progress Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Document Title  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AFC Gateway Array Post-Installation Walk"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Bilingual Raw Note Input */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                  Field Comments & Raw Notes 
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Type or dictate your field observations in Arabic, English, or mixed. Click the Sparkles button below to generate a Siemens-standard formal report.
                </p>
              </div>

              <textarea
                rows={4}
                value={notesRaw}
                onChange={(e) => setNotesRaw(e.target.value)}
                placeholder="Example: AFC gates have been installed and powered successfully. Exposed cables were observed near Gate No. 3 and require proper containment. Ticket vending machines are operational. Glass panel alignment should be adjusted before final inspection."
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-3 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-900 font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500/30 transition-all leading-relaxed"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAiTranslate}
                  disabled={isTranslating}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-slate-100 disabled:to-slate-100 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini Processing & Structuring...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI Generate English Engineering Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editable AI Generated Sections */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-5 shadow-sm">
              <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Generated Document Sections</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Edit or refine individual fields generated by Gemini AI</p>
                </div>
                {!isOnline() && (
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-[9px] text-amber-700 font-bold rounded">
                    Offline Simulation Fallback
                  </span>
                )}
              </div>

              {/* Section 1 */}
              <div>
                <label className="block text-xs font-extrabold text-teal-600 uppercase tracking-wide mb-1.5">
                  1. Technical Notes
                </label>
                <textarea
                  rows={3}
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              {/* Section 2 */}
              <div>
                <label className="block text-xs font-extrabold text-teal-600 uppercase tracking-wide mb-1.5">
                  2. Identified Issues & Non-Conformances 
                </label>
                <textarea
                  rows={3}
                  value={identifiedIssues}
                  onChange={(e) => setIdentifiedIssues(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              {/* Section 3 */}
              <div>
                <label className="block text-xs font-extrabold text-teal-600 uppercase tracking-wide mb-1.5">
                  3. Corrective Actions Required 
                </label>
                <textarea
                  rows={3}
                  value={correctiveActions}
                  onChange={(e) => setCorrectiveActions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              {/* Section 4 */}
              <div>
                <label className="block text-xs font-extrabold text-teal-600 uppercase tracking-wide mb-1.5">
                  4. Preventative Recommendations 
                </label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              {/* Section 5 */}
              <div>
                <label className="block text-xs font-extrabold text-teal-600 uppercase tracking-wide mb-1.5">
                  5. Follow-up Inspection Plan 
                </label>
                <textarea
                  rows={2}
                  value={followUpPlan}
                  onChange={(e) => setFollowUpPlan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

            </div>
          </div>

          {/* Right Sidebar: Visual Photos Attachments & Actions (1 col) */}
          <div className="space-y-6">
            
            {/* Photos and Multimodal AI Analysis */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Visual Attachments</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Snap or upload site photos. Gemini will auto-analyze the image and formulate a Siemens QA engineering description.
              </p>

              {/* Drag and drop upload */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/10 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 shadow-sm"
              >
                <UploadCloud className="w-8 h-8 text-teal-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">Snap Photo or Browse</span>
                <span className="text-[10px] text-slate-400 font-mono">Supports JPEG, PNG</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  multiple
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Photos List with AI analysis description editable text */}
              {photos.length > 0 && (
                <div className="space-y-4 pt-2 overflow-y-auto max-h-96">
                  {photos.map((ph, idx) => (
                    <div key={ph.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 relative group">
                      <button
                        onClick={() => handleDeletePhoto(ph.id)}
                        className="absolute right-2.5 top-2.5 p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Attachment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                          <img 
                            src={ph.url} 
                            alt={`Photo ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-mono text-slate-500 font-bold">Photo {idx + 1} • {ph.timestamp}</span>
                          {analyzingPhotoId === ph.id ? (
                            <div className="flex items-center gap-1.5 text-[10px] text-teal-600 mt-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>AI analyzing photo...</span>
                            </div>
                          ) : ph.analyzed ? (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-0.5 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Siemens QA Analyzed</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerPhotoAnalysis(ph.id, ph.url, 'image/jpeg')}
                              className="text-[10px] text-teal-600 underline hover:text-teal-700 mt-1 block text-left font-bold"
                            >
                              Retry AI Analysis
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Photo Description Box */}
                      <textarea
                        value={ph.description}
                        onChange={(e) => {
                          const desc = e.target.value;
                          setPhotos(prev => prev.map(p => p.id === ph.id ? { ...p, description: desc } : p));
                        }}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Core Action Center */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3.5 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Save & Export Options</h3>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  disabled={!technicalNotes}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Preview Official Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Save as local Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('Submitted')}
                  className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Lock Report</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={onCloseCreator}
                  className="w-full py-2 bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel / Return to Project
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
