import React, { useState, useRef, useEffect } from 'react';
import { Layers, FileOutput, Scissors, RotateCw, ListOrdered, FileUp, X, CheckCircle, FileText, Loader2, Download, Scan, GripVertical, Minimize, Lock, Unlock, FilePlus, Tag, Moon, Sun, ImagePlus, Images, Droplets, Crop, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import PdfPreviewWrapper from './PdfPreviewWrapper';
import FileThumbnail from './FileThumbnail';


const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState('');

  // Form states
  const [splitPages, setSplitPages] = useState([]);
  const [deletePages, setDeletePages] = useState([]);
  const [rotatePages, setRotatePages] = useState([]);
  const [rotateAngle, setRotateAngle] = useState(90);
  const [reorderPages, setReorderPages] = useState([]);
  const [deskewPages, setDeskewPages] = useState([]);

  const [extractPages, setExtractPages] = useState([]);
  const [password, setPassword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [watermarkText, setWatermarkText] = useState('');
  const [cropMargins, setCropMargins] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'merge', label: 'Merge PDFs', icon: Layers },
    { id: 'split', label: 'Split PDF', icon: FileOutput },
    { id: 'delete', label: 'Delete Pages', icon: Scissors },
    { id: 'rotate', label: 'Rotate Pages', icon: RotateCw },
    { id: 'reorder', label: 'Reorder Pages', icon: ListOrdered },
    { id: 'deskew', label: 'Deskew Pages', icon: Scan },
    { id: 'compress', label: 'Compress PDF', icon: Minimize },
    { id: 'protect', label: 'Protect PDF', icon: Lock },
    { id: 'unlock', label: 'Unlock PDF', icon: Unlock },
    { id: 'extract', label: 'Extract Pages', icon: FilePlus },
    { id: 'metadata', label: 'Edit Metadata', icon: Tag },
    { id: 'images_to_pdf', label: 'Images to PDF', icon: ImagePlus },
    { id: 'pdf_to_images', label: 'PDF to Images', icon: Images },
    { id: 'extract_text', label: 'Extract Text', icon: FileText },
    { id: 'watermark', label: 'Add Watermark', icon: Droplets },
    { id: 'crop', label: 'Crop PDF', icon: Crop },
    { id: 'auto_rotate', label: 'Auto Rotate', icon: RefreshCcw },
  ];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    setFiles([]);
    setError(null);
    setDownloadUrl(null);
    setLoading(false);
    setSplitPages([]);
    setDeletePages([]);
    setRotatePages([]);
    setReorderPages([]);
    setDeskewPages([]);
    setExtractPages([]);
    setPassword('');
    setMetaTitle('');
    setMetaAuthor('');
    setWatermarkText('');
    setCropMargins({ left: 0, right: 0, top: 0, bottom: 0 });
  }, [activeTab]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
       // Merge and images_to_pdf can take multiple, others take single
      if (activeTab === 'merge' || activeTab === 'images_to_pdf') {
          setFiles(prev => [...prev, ...selectedFiles]);
      } else {
          setFiles([selectedFiles[0]]);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    let droppedFiles = [];
    if (activeTab === 'images_to_pdf') {
       droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    } else {
       droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    }

    if (droppedFiles.length > 0) {
      if (activeTab === 'merge' || activeTab === 'images_to_pdf') {
          setFiles(prev => [...prev, ...droppedFiles]);
      } else {
          setFiles([droppedFiles[0]]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDragStartFile = (e, index) => {
    if (activeTab !== 'merge' && activeTab !== 'images_to_pdf') return;
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOverFile = (e) => {
    if (activeTab !== 'merge' && activeTab !== 'images_to_pdf') return;
    e.preventDefault();
  };

  const handleDropFile = (e, targetIndex) => {
    if (activeTab !== 'merge' && activeTab !== 'images_to_pdf') return;
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (draggedIndex === targetIndex) return;

    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, draggedItem);

    setFiles(newFiles);
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

    if (activeTab === 'merge' || activeTab === 'images_to_pdf') {
      if (activeTab === 'merge' && files.length < 2) {
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

      if (activeTab === 'split') {
        if (splitPages.length > 0) {
            formData.append('pages', splitPages.join(' '));
        }
      } else if (activeTab === 'delete') {
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
      } else if (activeTab === 'extract') {
        if(extractPages.length === 0) throw new Error("Please specify pages to extract.");
        formData.append('pages', extractPages.join(' '));
      } else if (activeTab === 'protect' || activeTab === 'unlock') {
        if(!password) throw new Error("Please provide a password.");
        formData.append('password', password);
      } else if (activeTab === 'metadata') {
        if (metaTitle) formData.append('title', metaTitle);
        if (metaAuthor) formData.append('author', metaAuthor);
      } else if (activeTab === 'watermark') {
        if (!watermarkText) throw new Error("Please provide watermark text.");
        formData.append('text', watermarkText);
      } else if (activeTab === 'crop') {
        formData.append('left', cropMargins.left);
        formData.append('right', cropMargins.right);
        formData.append('top', cropMargins.top);
        formData.append('bottom', cropMargins.bottom);
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
      if (activeTab === 'pdf_to_images') filename = 'extracted_images.zip';
      if (activeTab === 'extract_text') filename = 'extracted_text.txt';

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
          } catch {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Ultimate PDF Tool</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-200">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tools</h2>
            </div>
            <nav className="p-2 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[500px] flex flex-col transition-colors duration-200">
           <div className="p-8 flex-1 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {activeTab === 'merge' && 'Combine multiple PDFs into a single document.'}
                {activeTab === 'split' && 'Select specific pages to extract, or extract every page of your PDF into separate files (downloaded as a ZIP).'}
                {activeTab === 'delete' && 'Remove specific pages from your document.'}
                {activeTab === 'rotate' && 'Rotate specific pages by 90, 180, or 270 degrees.'}
                {activeTab === 'reorder' && 'Change the order of the pages in your PDF.'}
                {activeTab === 'deskew' && 'Automatically straighten skewed or crooked scanned pages.'}
                {activeTab === 'compress' && 'Reduce the file size of your PDF document.'}
                {activeTab === 'protect' && 'Encrypt your PDF with a password.'}
                {activeTab === 'unlock' && 'Remove password protection from your PDF.'}
                {activeTab === 'extract' && 'Select specific pages to save as a new single PDF.'}
                {activeTab === 'metadata' && 'Update the Title and Author of your PDF document.'}
                {activeTab === 'images_to_pdf' && 'Convert multiple images into a single PDF document.'}
                {activeTab === 'pdf_to_images' && 'Convert each page of your PDF into high-quality images (downloaded as a ZIP).'}
                {activeTab === 'extract_text' && 'Extract all readable text from your PDF into a simple .txt file.'}
                {activeTab === 'watermark' && 'Add a text watermark overlay to all pages of your PDF document.'}
                {activeTab === 'crop' && 'Crop margins from the edges of your PDF pages.'}
                {activeTab === 'auto_rotate' && 'Automatically rotate upside-down or sideways pages based on text orientation.'}
              </p>

              {/* File Upload Area */}
              {files.length === 0 ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex-1"
                  >
                    <FileUp className="h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      Drag & drop your {activeTab === 'images_to_pdf' ? 'Images' : 'PDF'}{activeTab === 'merge' ? 's' : ''} here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">or click to browse files</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm pointer-events-none">
                      Select {activeTab === 'images_to_pdf' ? 'Images' : 'PDF'}{activeTab === 'merge' ? ' Files' : activeTab !== 'images_to_pdf' ? ' File' : ''}
                    </button>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept={activeTab === 'images_to_pdf' ? "image/*" : ".pdf"}
                      multiple={activeTab === 'merge' || activeTab === 'images_to_pdf'}
                    />
                  </div>
              ) : (
                <div className="flex-1 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Selected File{files.length > 1 ? 's' : ''}</h3>
                        {(activeTab === 'merge' || activeTab === 'images_to_pdf') && (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                            >
                                + Add more files
                            </button>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept={activeTab === 'images_to_pdf' ? "image/*" : ".pdf"}
                          multiple={activeTab === 'merge' || activeTab === 'images_to_pdf'}
                        />
                    </div>

                    <div className="space-y-3 mb-8">
                        {files.map((file, idx) => (
                            <div
                              key={idx}
                              draggable={activeTab === 'merge' || activeTab === 'images_to_pdf'}
                              onDragStart={(e) => handleDragStartFile(e, idx)}
                              onDragOver={handleDragOverFile}
                              onDrop={(e) => handleDropFile(e, idx)}
                              className={`flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-shadow hover:shadow-md ${activeTab === 'merge' || activeTab === 'images_to_pdf' ? 'cursor-move' : ''}`}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    {(activeTab === 'merge' || activeTab === 'images_to_pdf') && <GripVertical className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0" />}

                                    {activeTab === 'images_to_pdf' ? (
                                        <div className="w-12 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                            <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                                        </div>
                                    ) : (
                                        <FileThumbnail file={file} />
                                    )}

                                    <div className="flex flex-col">
                                      <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{file.name}</span>
                                      <span className="text-xs text-gray-400 dark:text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(idx)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Operation Specific Forms */}
                    <div className="mb-8">
                        {activeTab === 'split' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pages to Split (Leave empty to split all pages)</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={splitPages} onSelect={setSplitPages} mode="split" />
                           </div>
                        )}
                        {activeTab === 'delete' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pages to Delete</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={deletePages} onSelect={setDeletePages} mode="delete" />
                           </div>
                        )}
                        {activeTab === 'rotate' && (
                           <div className="flex flex-col gap-4">
                              <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Angle</label>
                                <select value={rotateAngle} onChange={e => setRotateAngle(Number(e.target.value))} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white">
                                    <option value={90}>90°</option>
                                    <option value={180}>180°</option>
                                    <option value={270}>270°</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pages to Rotate</label>
                                <PdfPreviewWrapper file={files[0]} selectedPages={rotatePages} onSelect={setRotatePages} mode="rotate" />
                              </div>
                           </div>
                        )}
                        {activeTab === 'reorder' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Order (Drag and drop pages to reorder)</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={reorderPages} onSelect={setReorderPages} mode="reorder" />
                           </div>
                        )}
                        {activeTab === 'deskew' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pages to Deskew</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={deskewPages} onSelect={setDeskewPages} mode="deskew" />
                           </div>
                        )}
                        {activeTab === 'extract' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pages to Extract</label>
                              <PdfPreviewWrapper file={files[0]} selectedPages={extractPages} onSelect={setExtractPages} mode="extract" />
                           </div>
                        )}
                        {(activeTab === 'protect' || activeTab === 'unlock') && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                              <input
                                type="text"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full max-w-sm border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                              />
                           </div>
                        )}
                        {activeTab === 'metadata' && (
                           <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                  type="text"
                                  value={metaTitle}
                                  onChange={e => setMetaTitle(e.target.value)}
                                  placeholder="New Title"
                                  className="w-full max-w-md border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                                <input
                                  type="text"
                                  value={metaAuthor}
                                  onChange={e => setMetaAuthor(e.target.value)}
                                  placeholder="New Author"
                                  className="w-full max-w-md border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                                />
                              </div>
                           </div>
                        )}
                        {activeTab === 'watermark' && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Watermark Text</label>
                              <input
                                type="text"
                                value={watermarkText}
                                onChange={e => setWatermarkText(e.target.value)}
                                placeholder="e.g. CONFIDENTIAL"
                                className="w-full max-w-sm border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                              />
                           </div>
                        )}
                        {activeTab === 'crop' && (
                           <div className="space-y-4">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Margins to crop (in points)</p>
                              <div className="grid grid-cols-2 gap-4 max-w-md">
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Top</label>
                                  <input type="number" min="0" value={cropMargins.top} onChange={e => setCropMargins({...cropMargins, top: Number(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white" />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bottom</label>
                                  <input type="number" min="0" value={cropMargins.bottom} onChange={e => setCropMargins({...cropMargins, bottom: Number(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white" />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Left</label>
                                  <input type="number" min="0" value={cropMargins.left} onChange={e => setCropMargins({...cropMargins, left: Number(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white" />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Right</label>
                                  <input type="number" min="0" value={cropMargins.right} onChange={e => setCropMargins({...cropMargins, right: Number(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white" />
                                </div>
                              </div>
                           </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {downloadUrl ? (
                        <div className="mt-auto flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mb-3" />
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">Task Completed Successfully!</h3>
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
                        <div className="mt-auto flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                            <button
                               onClick={handleSubmit}
                               disabled={loading || (activeTab === 'merge' && files.length < 2)}
                               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {loading ? (activeTab === 'deskew' ? 'Processing... (This may take a while)' : 'Processing...') : `Process ${activeTab === 'images_to_pdf' ? 'Images' : 'PDF'}${activeTab === 'merge' ? 's' : ''}`}
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
