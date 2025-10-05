import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Image, Presentation, File, Search, Filter, Eye, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { filesAPI, groupsAPI } from '../services/api';

export function StudentFiles() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const location = useLocation();

  // Get group from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const groupId = params.get('group');
    if (groupId) setSelectedGroup(groupId);
  }, [location.search]);

  // Fetch groups on load
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await groupsAPI.getGroups();
      const groupsData = Array.isArray(data) ? data : [];
      setGroups(groupsData);
      if (groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0].id || groupsData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    if (!selectedGroup) {
      toast.error('Please select a group first');
      return;
    }

    setFilesLoading(true);
    try {
      const response = await filesAPI.getGroupFiles(selectedGroup);
      console.log('Files API response:', response);

      let files = [];
      if (Array.isArray(response)) files = response;
      else if (Array.isArray(response.data)) files = response.data;
      else if (response.data?.files) files = response.data.files;
      else if (response.files) files = response.files;

      const normalizedFiles = files.map(file => ({
        _id: file._id || file.id,
        fileName: file.fileName || file.name || file.originalname || 'Unnamed File',
        fileType: file.fileType || file.mimetype || file.type || "",
        fileSize: file.fileSize || file.size,
        filePath: file.filePath || file.url || file.path,
        createdAt: file.createdAt || file.uploadDate,
        uploadedBy: file.uploadedBy || { email: 'Unknown' }
      }));

      setUploadedFiles(normalizedFiles);
      toast.success(`Loaded ${normalizedFiles.length} files`);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
      setUploadedFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const getFileIcon = (type) => {
    const mimeType = type?.toLowerCase();
    if (mimeType?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return <Presentation className="w-8 h-8 text-orange-500" />;
    if (mimeType?.includes('document') || mimeType?.includes('word')) return <File className="w-8 h-8 text-blue-500" />;
    if (mimeType?.includes('image')) return <Image className="w-8 h-8 text-green-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary-700 dark:text-primary-100 hover:text-primary-600 dark:hover:text-primary-50 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-50 mb-2">
                Study Materials
              </h1>
              <p className="text-primary-700 dark:text-primary-100">
                View study files shared by your teachers
              </p>
            </div>

            {/* Group Selector */}
            <div className="mt-4 sm:mt-0">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
                Select Group:
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg dark:bg-primary-700 text-primary-900 dark:text-primary-50 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a group</option>
                {groups.map((group) => (
                  <option key={group._id || group.id} value={group._id || group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* File Display */}
        <div className="dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Files ({uploadedFiles.length})
              </h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!selectedGroup ? (
              <div className="text-center py-8">
                <File className="w-12 h-12 mx-auto text-primary-400 mb-4" />
                <p className="text-primary-600 dark:text-primary-400">Please select a group to view files</p>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <File className="w-12 h-12 mx-auto text-primary-400 mb-4" />
                <p className="text-primary-600 dark:text-primary-400">No files found for this group</p>
                <button 
                  onClick={fetchFiles}
                  disabled={filesLoading}
                  className="mt-4 bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  <span>{filesLoading ? 'Loading...' : 'View Files'}</span>
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.map((file) => (
                  <div
                    key={file._id}
                    className="p-4 border border-primary-200 dark:border-primary-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-700 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-primary-900 dark:text-primary-50 truncate">
                          {file.fileName}
                        </h3>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-primary-500 dark:text-primary-400">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                          Uploaded by: {file.uploadedBy?.email || "Unknown"}
                        </p>
                        <div className="mt-3 flex space-x-2">
                          <a
                            href={file.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200 flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
