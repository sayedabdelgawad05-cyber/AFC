import React from 'react';

export default function DocumentControl() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Document Control
      </h2>

      <p className="text-slate-500 mb-6">
        Upload and manage Architecture, Structure, Builders Work, AFC,
        NCR, RFI and Observation documents.
      </p>

      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center">
        <p className="font-semibold text-slate-700">
          Upload PDF, Excel or Word Documents
        </p>
      </div>
    </div>
  );
}
