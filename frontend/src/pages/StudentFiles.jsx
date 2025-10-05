import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Image, Presentation, File, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to modify a Cloudinary URL to force a download
const createDownloadUrl = (url) => {
    if (!url) return '';
    // Inserts 'fl_attachment/' into the URL right after '/upload/'
    return url.replace('/upload/', '/upload/fl_attachment/');
};

export function StudentFiles() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const groupId = params.get('group');
        if (groupId) {
            setSelectedGroup(groupId);
        }
    }, [location.search]);
    
    useEffect(() => {
        if (selectedGroup) {
            fetchFilesForGroup(selectedGroup);
        } else {
            setUploadedFiles([]);
        }
    }, [selectedGroup]);

    const fetchGroups = async () => {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        try {
            const response = await fetch("http://localhost:8000/students/groups", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch groups from the server');
            }
            
            const res = await response.json();
            const groupsData = res || [];
            setGroups(groupsData);

        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilesForGroup = async (groupId) => {
        setFilesLoading(true);
        const token = localStorage.getItem('jwt');
        try {
            const response = await fetch(`http://localhost:8000/students/groups/${groupId}/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const res = await response.json();
            if (!response.ok || !res.status) {
                 throw new Error(res.payload?.info || 'Failed to fetch files for the group');
            }

            const files = res.payload.data || [];
            const normalizedFiles = files.map(file => ({
                _id: file._id,
                fileName: file.fileName || 'Unnamed File',
                fileType: file.fileType || '',
                fileSize: file.fileSize,
                filePath: file.filePath,
                createdAt: file.createdAt,
            }));

            setUploadedFiles(normalizedFiles);

        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error(error.message);
            setUploadedFiles([]);
        } finally {
            setFilesLoading(false);
        }
    };
    
    const getFileIcon = (type) => {
        const mimeType = type?.toLowerCase();
        if (mimeType?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
        if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return <Presentation className="w-8 h-8 text-orange-500" />;
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
            <div className="min-h-screen bg-[#01161E] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#01161E] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
                            <p className="text-gray-400">View and download files shared in your groups.</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Select Group:</label>
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                            >
                                <option value="">-- Choose a group --</option>
                                {groups.map((group) => (
                                    <option key={group._id} value={group._id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-[#124559] bg-opacity-40 rounded-xl shadow-lg border border-gray-700">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-semibold">
                            Available Files ({uploadedFiles.length})
                        </h2>
                    </div>
                    <div className="p-6">
                        {filesLoading ? (
                            <div className="text-center py-8 text-gray-400">Loading files...</div>
                        ) : !selectedGroup ? (
                            <div className="text-center py-8 text-gray-400">Please select a group to view its files.</div>
                        ) : uploadedFiles.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">No study materials found for this group.</div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {uploadedFiles.map((file) => (
                                    <div key={file._id} className="p-4 border border-gray-700 rounded-lg bg-gray-800 hover:border-blue-500 transition-all duration-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 pt-1">{getFileIcon(file.fileType)}</div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">{file.fileName}</h3>
                                                <div className="mt-1 flex items-center space-x-2 text-sm text-gray-400">
                                                    <span>{formatFileSize(file.fileSize)}</span>
                                                    <span>•</span>
                                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="mt-3">
                                                    <a 
                                                       href={createDownloadUrl(file.filePath)} 
                                                       target="_blank" 
                                                       rel="noopener noreferrer" 
                                                       className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 flex items-center"
                                                    >
                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                        Download File
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