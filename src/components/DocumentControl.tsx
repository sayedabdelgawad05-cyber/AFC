import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function DocumentControl() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Architecture');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
const [deleteReason, setDeleteReason] = useState('');
const [documentToDelete, setDocumentToDelete] = useState<any | null>(null);
const [searchTerm, setSearchTerm] = useState('');
const [selectedCommentDoc, setSelectedCommentDoc] = useState<any | null>(null);
const [newComment, setNewComment] = useState('');
const [comments, setComments] = useState<any>({});
useEffect(() => {
  api.getDocuments().then((docs) => {
    setUploadedFiles(docs);
  });
}, []);

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

api.saveDocument(newDocument);

setUploadedFiles(prev => [
  ...prev,
  newDocument
]);

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
<div className="mb-4">
  <input
    type="text"
    placeholder="Search documents..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full border border-slate-300 rounded-xl px-3 py-2"
  />
</div>
        {uploadedFiles.length === 0 ? (
          <p className="text-slate-500">
            No uploaded documents yet.
          </p>
        ) : (
          <div className="space-y-3">
            {uploadedFiles
  .filter(doc =>
   
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
doc.type.toLowerCase().includes(searchTerm.toLowerCase())
)
.map((doc) => (
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

<div className="mt-3 flex gap-2 flex-wrap">

  <button
    onClick={() => setSelectedDocument(doc)}
    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
  >
    View
  </button>

<button
  onClick={() => setSelectedCommentDoc(doc)}
  className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm"
>
  Comment
</button>


  <button
    className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm"
  >
    Download
  </button>

<button
  onClick={() => setDocumentToDelete(doc)}
  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
>
  Delete
</button>

</div>
  </div>
))}
          </div>
        )}
      </div>

      {selectedDocument && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mt-6">
          <h3 className="text-lg font-bold mb-4">
            Document Details
          </h3>

          <p>
            <strong>Name:</strong> {selectedDocument.name}
          </p>

          <p>
            <strong>Type:</strong> {selectedDocument.type}
          </p>

          <p>
            <strong>Size:</strong> {selectedDocument.size}
          </p>

          <p>
            <strong>Upload Date:</strong> {selectedDocument.uploadDate}
          </p>

          <button
            onClick={() => setSelectedDocument(null)}
            className="mt-4 px-4 py-2 bg-slate-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}
{documentToDelete && (
  <div className="bg-white border border-red-200 rounded-3xl p-6 mt-6">
    <h3 className="text-lg font-bold text-red-600 mb-4">
      Delete Document
    </h3>

    <p className="mb-3">
      Please enter deletion reason:
    </p>

    <input
      type="text"
      value={deleteReason}
      onChange={(e) => setDeleteReason(e.target.value)}
      placeholder="Reason for deletion..."
      className="w-full border border-slate-300 rounded-xl px-3 py-2"
    />

    <div className="flex gap-2 mt-4">

      <button
        onClick={() => {
          setDeleteReason('');
          setDocumentToDelete(null);
        }}
        className="px-4 py-2 bg-slate-500 text-white rounded-lg"
      >
        Cancel
      </button>

      <button
       onClick={() => {
  if (!deleteReason.trim()) {
    alert('Please enter deletion reason.');
    return;
  }

  const updatedFiles = uploadedFiles.filter(
    file => file.id !== documentToDelete.id
  );

  setUploadedFiles(updatedFiles);

  localStorage.setItem(
    'hsr_documents',
    JSON.stringify(updatedFiles)
  );

  setDeleteReason('');
  setDocumentToDelete(null);
}}
        className="px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Confirm Delete
      </button>

    </div>
  </div>
)}
{selectedCommentDoc && (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 mt-6">
    <h3 className="text-lg font-bold mb-4">
      Comments - {selectedCommentDoc.name}
    </h3>

    <input
      type="text"
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Write a comment..."
      className="w-full border border-slate-300 rounded-xl px-3 py-2"
    />

    <button
      onClick={() => {
        if (!newComment.trim()) return;

        setComments(prev => ({
          ...prev,
          [selectedCommentDoc.id]: [
            ...(prev[selectedCommentDoc.id] || []),
            newComment
          ]
        }));

        setNewComment('');
      }}
      className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg"
    >
      Add Comment
    </button>

    <div className="mt-4 space-y-2">

      {(comments[selectedCommentDoc.id] || []).map(
        (comment: string, index: number) => (
          <div
            key={index}
            className="border border-slate-200 rounded-lg p-2"
          >
            {comment}
          </div>
        )
      )}

    </div>

    <button
      onClick={() => setSelectedCommentDoc(null)}
      className="mt-4 px-4 py-2 bg-slate-500 text-white rounded-lg"
    >
      Close
    </button>
  </div>
)}
    </div>
  );
}