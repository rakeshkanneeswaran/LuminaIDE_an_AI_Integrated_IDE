import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';

const FileExplorer = ({ onFileSelect }) => {
  const [fileTree, setFileTree] = useState({});
  const [openFolders, setOpenFolders] = useState([]);

  async function fetchFileTree() {
    try {
      const response = await axios.get('http://localhost:9000/files');
      setFileTree(response.data.tree);
    } catch (error) {
      console.error('Error fetching file tree:', error);
    }
  }

  useEffect(() => {
    fetchFileTree(); // Fetch initial file tree

    // Listen for file change events from the server
    socket.on('file:refresh', () => {
      fetchFileTree(); // Update file tree when files change
    });

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off('file:refresh');
    };
  }, []);

  const toggleFolder = (path) => {
    if (isOpen(path)) {
      setOpenFolders(openFolders.filter(folder => !isSamePath(folder, path)));
    } else {
      setOpenFolders([...openFolders, path]);
    }
  };

  const isOpen = (path) => {
    return openFolders.some(folder => isSamePath(folder, path));
  };

  const isSamePath = (path1, path2) => {
    return path1.length === path2.length && path1.every((value, index) => value === path2[index]);
  };

  const renderTree = (tree, path = []) => {
    return Object.entries(tree).map(([name, value]) => {
      const newPath = path.concat(name);
      const isFolder = value !== null;

      const handleClick = () => {
        if (!isFolder) {
          onFileSelect(newPath.join("/"));
        }
      };

      return (
        <div key={name} className={`pl-4 my-1 ${isFolder ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg`} onClick={handleClick}>
          <div className="flex items-center text-gray-300">
            {isFolder && (
              <button
                className={`mr-2 flex items-center focus:outline-none ${isOpen(newPath) ? 'rotate-90' : 'rotate-0'}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the folder toggle button from selecting the folder
                  toggleFolder(newPath);
                }}
              >
                <svg className="h-5 w-5 fill-current text-gray-400 mr-1" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </button>
            )}
            <span>{name}</span>
          </div>
          {isFolder && isOpen(newPath) && <div className="pl-4">{renderTree(value, newPath)}</div>}
        </div>
      );
    });
  };

  return (
    <div className="file-explorer w-64 overflow-y-auto bg-gray-900 text-gray-300 h-full p-2">
      {renderTree(fileTree)}
    </div>
  );
};

export default FileExplorer;
