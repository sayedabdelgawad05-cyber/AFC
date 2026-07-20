import React, { useState } from 'react';

export default function DocumentControl() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Architecture');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const newDocument = {
      id: Date.now(),
      name: selectedFile.name,
      type: documentType,
      uploadDate: new Date().toLocaleDateString(),
      size: `${(selectedFile.size / 1024).toFixed(1)} KB`
    };

    setUploadedFiles(prev => [...prev, newDocument]);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Document Control
        </h2>

        <p className="text-slate-500 mb-6">
          Upload and manage Architecture, Structure, Builders Work,
          AFC, NCR, RFI and Observation documents.
        </p>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-semibold mb-2">
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            >
              <option>Architecture</option>
              <option>Structure</option>
              <option>Builders Work</option>
              <option>AFC</option>
              <option>Civil</option>
              <option>MEP</option>
              <option>Observation</option>
              <option>RFI</option>
              <option>NCR</option>
              <option>Method Statement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Select File
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) =>
                setSelectedFile(
                  e.target.files ? e.target.files[0] : null
                )
              }
              className="w-full border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

        </div>

        <button
          onClick={handleUpload}
          className="mt-5 px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl"
        >
          Upload Document
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-4">
          Uploaded Documents
        </h3>

        {uploadedFiles.length === 0 ? (
          <p className="text-slate-500">
            No uploaded documents yet.
          </p>
        ) : (
          <div className="space-y-3">
            {uploadedFiles.map((doc) => (
              <div
                key={doc.id}
                className="border border-slate-200 rounded-xl p-4"
              >
                <h4 className="font-bold">{doc.name}</h4>

                <p className="text-sm text-slate-500">
                  Type: {doc.type}
                </p>

                <p className="text-sm text-slate-500">
                  Size: {doc.size}
                </p>

                <p className="text-sm text-slate-500">
                  Uploaded: {doc.uploadDate}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}