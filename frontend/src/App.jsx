import React, { useState, useEffect } from "react";
import "./App.css";
import Terminal from "./components/terminal";
import FileExplorer from "./components/tree";
import AceEditor from "react-ace";
import socket from './socket';
import AIComponent from "./components/aichat";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-github_dark";

function App() {
  const [code, setCode] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [mode, setMode] = useState("java");

  const getFileMode = (path) => {
    const extension = path.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'py':
        return 'python';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      default:
        return 'java';
    }
  };

  useEffect(() => {
    if (code && selectedFilePath) {
      const timer = setTimeout(() => {
        console.log("save code ", code);
        socket.emit('file:change', { path: selectedFilePath, content: code });
      }, 5000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code]);

  async function getFileContents() {
    if (!selectedFilePath) return;
    const response = await fetch(`http://localhost:9000/files/content?path=${selectedFilePath}`);
    const result = await response.json();
    setCode(result.content);
    setMode(getFileMode(selectedFilePath));
    console.log(result);
  }

  useEffect(() => {
    console.log("function ran");
    getFileContents();
  }, [selectedFilePath]);

  const handleFileSelect = (path) => {
    setSelectedFilePath(path);
    console.log("Selected file path:", path);
  };

  return (
    <div id="playground-container" className="flex flex-col h-screen bg-gray-800">
      <div className="flex justify-around items-center h-10 bg-gray-800 text-white shadow-md rounded-md mb-1 p-2">
        <p>Lumina AI Studio</p>
        <p className="text-sm font-semibold">Current Location: {selectedFilePath.replaceAll("/", " > ")}</p>
      </div>
    
      <div id="editor-container" className="flex flex-grow">
        <div id="files" className="bg-gray-800 overflow-scroll w-1/4">
          <FileExplorer onFileSelect={handleFileSelect} />
        </div>
        <div id="editor" className="overflow-auto flex-grow">
          <AceEditor
            mode={mode}
            theme="github_dark"
            value={code}
            onChange={(e) => {
              setCode(e);
            }}
            width="100%"
            height="100%"
            setOptions={{
              useWorker: false,
            }}
          />
        </div>
        <div className="w-72 overflow-y-auto h-96 ">
          <AIComponent />
        </div>
      </div>
      <div className="flex justify-center text-white">
      Lumina AI Studio Terminal Current:Bash
      </div>
      <div id="terminal-container">
        <Terminal />
      </div>
    </div>
  );
}

export default App;
