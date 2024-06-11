import React, { useState, useRef } from 'react';
import axios from 'axios';

const AIComponent = () => {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [selectedModel, setSelectedModel] = useState('llava'); // Default model
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: selectedModel, // Use selected model
        prompt: question,
        stream: false,
      });
      const newAnswer = response.data.response;
      setAnswers(prevAnswers => [...prevAnswers, newAnswer]);
      setQuestion('');
      // Scroll to the bottom after adding a new answer
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error('Error fetching response:', error);
    }
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  // Define model options
  const modelOptions = ['llama', 'llama2', 'mistral', 'llava', 'llama3'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto px-4 py-2">
        {answers.map((answer, index) => (
          <div key={index} className="rounded-lg bg-gradient-to-r bg-yellow-200  p-4 mb-4">
            {answer}
          </div>
        ))}
        <div ref={inputRef}></div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center pt-2">
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-3/4"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
        />
        <div className='flex'>
        <select
          className="border border-gray-300   rounded-lg px-4 py-2 mb-2 w-3/4"
          value={selectedModel}
          onChange={handleModelChange}
        >
          {modelOptions.map((model, index) => (
            <option key={index} value={model}>{model}</option>
          ))}
        </select>

        <div className='px-2'>

        </div>
        <button
          type="submit"
          className="border bg-red-800 text-white border-gray-300 rounded-lg px-4 py-2 mb-2 w-3/4"
        >
          Ask
        </button>
        </div>
        
      </form>
    </div>
  );
};

export default AIComponent;
