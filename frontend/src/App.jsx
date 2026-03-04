import React, { useState, useRef, useEffect } from 'react';
import { Layers, FileOutput, Scissors, RotateCw, ListOrdered, FileUp, X, CheckCircle, FileText, Loader2, Download, Scan } from 'lucide-react';
import axios from 'axios';
import PdfPreviewWrapper from './PdfPreviewWrapper';


const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState('');

  // Form states
  const [deletePages, setDeletePages] = useState([]);
  const [rotatePages, setRotatePages] = useState([]);
  const [rotateAngle, setRotateAngle] = useState(90);
  const [reorderPages, setReorderPages] = useState([]);
  const [deskewPages, setDeskewPages] = useState([]);

  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'merge', label: 'Merge PDFs', icon: Layers },
    { id: 'split', label: 'Split PDF', icon: FileOutput },
    { id: 'delete', label: 'Delete Pages', icon: Scissors },
    { id: 'rotate', label: 'Rotate Pages', icon: RotateCw },
    { id: 'reorder', label: 'Reorder Pages', icon: ListOrdered },
    { id: 'deskew', label: 'Deskew Pages', icon: Scan },
  ];

  useEffect(() => {
    setFiles([]);
    setError(null);
    setDownloadUrl(null);
    setLoading(false);
    setDeletePages([]);
    setRotatePages([]);
    setReorderPages([]);
    setDeskewPages([]);
  }, [activeTab]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
       // Merge can take multiple, others take single
      if (activeTab === 'merge') {
          setFiles(prev => [...prev, ...selectedFiles]);
      } else {
          setFiles([selectedFiles[0]]);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      if (activeTab === 'merge') {
          setFiles(prev => [...prev, ...droppedFiles]);
      } else {
          setFiles([droppedFiles[0]]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please select at least one PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadUrl(null);

    const formData = new FormData();

    if (activeTab === 'merge') {
      if (files.length < 2) {
        setError("Merge requires at least 2 PDF files.");
        setLoading(false);
        return;
      }
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('file', files[0]);
    }

    // Append specific form data based on active tab
    try {
      let endpoint = `${API_BASE_URL}/${activeTab}`;

      if (activeTab === 'delete') {
        if(deletePages.length === 0) throw new Error("Please specify pages to delete.");
        formData.append('pages', deletePages.join(' '));
      } else if (activeTab === 'rotate') {
        if(rotatePages.length === 0) throw new Error("Please specify pages to rotate.");
        formData.append('pages', rotatePages.join(' '));
        formData.append('angle', rotateAngle);
      } else if (activeTab === 'reorder') {
        if(reorderPages.length === 0) throw new Error("Please specify new order.");
        formData.append('order', reorderPages.join(' '));
      } else if (activeTab === 'deskew') {
        if(deskewPages.length === 0) throw new Error("Please specify pages to deskew.");
        formData.append('pages', deskewPages.join(' '));
      }

      const response = await axios.post(endpoint, formData, {
        responseType: 'blob', // Important for receiving binary data
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);

      // Determine filename from headers if possible, otherwise fallback
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${activeTab}_result.pdf`;
      if (activeTab === 'split') filename = 'split_pages.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
            filename = filenameMatch[1];
        }
      }
      setDownloadFilename(filename);

    } catch (err) {
       console.error(err);
       if (err.response && err.response.data instanceof Blob) {
          // Try to extract JSON error message from blob
          const text = await err.response.data.text();
          try {
             const json = JSON.parse(text);
             setError(json.detail || "Server error occurred");
          } catch(e) {
             setError("An error occurred processing your request.");
          }
       } else {
          setError(err.message || "Network error. Is the server running?");
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Ultimate PDF Tool</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h2>
            </div>
            <nav className="p-2 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
           <div className="p-8 flex-1 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500 mb-8">
                {activeTab === 'merge' && 'Combine multiple PDFs into a single document.'}
                {activeTab === 'split' && 'Extract every page of your PDF into separate files (downloaded as a ZIP).'}
                {activeTab === 'delete' && 'Remove specific pages from your document.'}
                {activeTab === 'rotate' && 'Rotate specific pages by 90, 180, or 270 degrees.'}
                {activeTab === 'reorder' && 'Change the order of the pages in your PDF.'}
                {activeTab === 'deskew' && 'Automatically straighten skewed or crooked scanned pages.'}
              </p>

              {/* File Upload Area */}
              {files.length === 0 ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex-1"
                  >
                    <FileUp className="h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-1">Drag & drop your PDF{activeTab === 'merge' ? 's' : ''} here</p>
                    <p className="text-sm text-gray-500 mb-6">or click to browse files</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm pointer-events-none">
                      Select PDF{activeTab === 'merge' ? ' Files' : ' File'}
                    </button>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      multiple={activeTab === 'merge'}
                    />
                  </div>
              ) : (
                <div className="flex-1 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Selected File{files.length > 1 ? 's' : ''}</h3>
                        {activeTab === 'merge' && (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                + Add more files
                            </button>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf"
                          multiple={activeTab === 'merge'}
                        />
                    </div>

                    <div className="space-y-3 mb-8">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="text-red-500 h-5 w-5 shrink-0" />
                                    <span className="truncate text-sm font-medium text-gray-700">{file.name}</span>
                                    <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button onClick={() => removeFile(idx)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-500 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Operation Specific Forms */}
                    <div className="mb-8">
                        {activeTab === 'delete' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Pages to Delete</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={deletePages} onSelect={setDeletePages} mode="delete" />
                           </div>
                        )}
                        {activeTab === 'rotate' && (
                           <div className="flex flex-col gap-4">
                              <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Angle</label>
                                <select value={rotateAngle} onChange={e => setRotateAngle(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                                    <option value={90}>90°</option>
                                    <option value={180}>180°</option>
                                    <option value={270}>270°</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pages to Rotate</label>
                                <PdfPreviewWrapper file={files[0]} selectedPages={rotatePages} onSelect={setRotatePages} mode="rotate" />
                              </div>
                           </div>
                        )}
                        {activeTab === 'reorder' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">New Order (Click pages in order)</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={reorderPages} onSelect={setReorderPages} mode="reorder" />
                           </div>
                        )}
                        {activeTab === 'deskew' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Pages to Deskew</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={deskewPages} onSelect={setDeskewPages} mode="deskew" />
                           </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {downloadUrl ? (
                        <div className="mt-auto flex flex-col items-center justify-center p-8 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                            <h3 className="text-lg font-semibold text-green-800 mb-4">Task Completed Successfully!</h3>
                            <a
                               href={downloadUrl}
                               download={downloadFilename}
                               className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                            >
                               <Download className="h-5 w-5" />
                               Download {downloadFilename}
                            </a>
                        </div>
                    ) : (
                        <div className="mt-auto flex justify-end pt-6 border-t border-gray-200">
                            <button
                               onClick={handleSubmit}
                               disabled={loading || (activeTab === 'merge' && files.length < 2)}
                               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {loading ? (activeTab === 'deskew' ? 'Processing... (This may take a while)' : 'Processing...') : `Process PDF${activeTab === 'merge' ? 's' : ''}`}
                            </button>
                        </div>
                    )}
                </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
}
