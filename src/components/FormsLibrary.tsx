import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { get_forms, add_form, delete_form, search_forms, export_form, read_form_file, type Form, FORM_CATEGORIES, SAMPLE_STATES, SAMPLE_DISTRICTS } from '../api/forms';
import { save } from '@tauri-apps/plugin-dialog';
import './FormsLibrary.css';

export function FormsLibrary() {
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Upload form state
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadState, setUploadState] = useState('');
  const [uploadDistrict, setUploadDistrict] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const districts = selectedState && selectedState !== 'all' 
    ? SAMPLE_DISTRICTS[selectedState as keyof typeof SAMPLE_DISTRICTS] || ['Other']
    : ['All'];

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const data = await get_forms();
      setFilteredForms(data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to load forms' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      const results = await search_forms(searchQuery, selectedCategory === 'all' ? undefined : selectedCategory);
      setFilteredForms(results);
    } catch {
      setStatus({ type: 'error', message: 'Search failed' });
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  const handleOpenForm = async (form: Form) => {
    try {
      const bytes = await read_form_file(form.id);
      const blob = new Blob([new Uint8Array(bytes)], { type: getMimeType(form.file_type) });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setStatus({ type: 'success', message: `Opened ${form.name}` });
    } catch {
      setStatus({ type: 'error', message: 'Failed to open form. File may be missing.' });
    }
  };

  const handleExportForm = async (form: Form) => {
    try {
      const suggestedName = `${form.name}.${form.file_type.toLowerCase()}`;
      const path = await save({
        defaultPath: suggestedName,
        filters: [{ name: form.file_type, extensions: [form.file_type.toLowerCase()] }]
      });
      
      if (path) {
        await export_form(form.id, path);
        setStatus({ type: 'success', message: `Exported ${form.name} to ${path}` });
      }
    } catch {
      setStatus({ type: 'error', message: 'Failed to export form' });
    }
  };

  const handleDeleteForm = async (form: Form) => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    
    try {
      await delete_form(form.id);
      setFilteredForms(prev => prev.filter(f => f.id !== form.id));
      setStatus({ type: 'success', message: 'Form deleted' });
    } catch {
      setStatus({ type: 'error', message: 'Failed to delete form' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setStatus({ type: 'error', message: 'Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG, TXT' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'File too large. Maximum 10MB.' });
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim() || !uploadCategory || !uploadState || !uploadDistrict) {
      setStatus({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    setIsUploading(true);
    try {
      const appDataDir = await invoke<string>('get_app_data_dir');
      const formsDir = `${appDataDir}/forms`;
      
      // Create unique filename
      const ext = uploadFile.name.split('.').pop() || 'txt';
      const fileName = `${Date.now()}_${uploadFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${formsDir}/${fileName}`;
      
      // Save file using Tauri FS
      await invoke('save_form_file', { 
        filePath, 
        data: Array.from(new Uint8Array(await uploadFile.arrayBuffer())) 
      });
      
      // Add to database
      await add_form({
        name: uploadName.trim(),
        category: uploadCategory,
        state: uploadState,
        district: uploadDistrict,
        description: uploadDescription.trim(),
        file_path: filePath,
        file_type: ext.toUpperCase(),
      });
      
      setShowUploadModal(false);
      resetUploadForm();
      await loadForms();
      setStatus({ type: 'success', message: 'Form uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ type: 'error', message: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadName('');
    setUploadCategory('');
    setUploadState('');
    setUploadDistrict('');
    setUploadDescription('');
    setUploadFile(null);
  };

  const getMimeType = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'jpg': case 'jpeg': case 'png': return '🖼';
      case 'txt': return '📃';
      default: return '📄';
    }
  };

  return (
    <div className="forms-page">
      <div className="page-header">
        <div>
          <h1>Forms Library</h1>
          <p className="page-subtitle">Search and manage commonly used forms</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          ➕ Upload Form
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search forms by name, category, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select className="filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {FORM_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select className="filter-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
            <option value="all">All States</option>
            {SAMPLE_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select className="filter-select" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
            <option value="all">All Districts</option>
            {districts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading forms...</div>
      ) : filteredForms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No forms found</h3>
          <p>{searchQuery || selectedCategory !== 'all' ? 'Try adjusting your search or filters' : 'Upload your first form to get started'}</p>
          {!searchQuery && selectedCategory === 'all' && (
            <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
              ➕ Upload Form
            </button>
          )}
        </div>
      ) : (
        <div className="forms-grid">
          {filteredForms.map(form => (
            <div key={form.id} className="form-card">
              <div className="form-card-header">
                <span className="form-icon">{getFileIcon(form.file_type)}</span>
                <div className="form-info">
                  <h4 className="form-name">{form.name}</h4>
                  <div className="form-meta">
                    <span className="form-category">{form.category}</span>
                    <span className="form-location">{form.district}, {form.state}</span>
                    <span className="form-type">{form.file_type}</span>
                  </div>
                </div>
              </div>
              <p className="form-description">{form.description}</p>
              <div className="form-actions">
                <button className="btn btn-sm btn-outline" onClick={() => handleOpenForm(form)}>
                  👁 Open
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => handleExportForm(form)}>
                  💾 Export
                </button>
                <button className="btn btn-sm btn-ghost btn-danger" onClick={() => handleDeleteForm(form)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {status && (
        <div className={`status-toast ${status.type}`} role="alert">
          {status.message}
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload New Form</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Form Name *</label>
                <input type="text" className="input" value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="e.g., Birth Certificate Application" />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="input" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {FORM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>State *</label>
                <select className="input" value={uploadState} onChange={e => setUploadState(e.target.value)}>
                  <option value="">Select state</option>
                  {SAMPLE_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>District *</label>
                <select className="input" value={uploadDistrict} onChange={e => setUploadDistrict(e.target.value)}>
                  <option value="">Select district</option>
                  {districts.filter(d => d !== 'All').map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input" rows={3} value={uploadDescription} onChange={e => setUploadDescription(e.target.value)} placeholder="Brief description of the form" />
              </div>
              <div className="form-group">
                <label>File *</label>
                <input type="file" className="input" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={handleFileSelect} />
                {uploadFile && <span className="file-name">{uploadFile.name} ({formatFileSize(uploadFile.size)})</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowUploadModal(false); resetUploadForm(); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? '⏳ Uploading...' : '✓ Upload Form'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}