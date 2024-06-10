// Import required modules
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Express Demo!');
});

// GET route
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is a GET request', data: [1, 2, 3, 4, 5] });          
});

// POST route
app.post('/api/data', (req, res) => {
  const newData = req.body;
  res.json({ message: 'This is a POST request', receivedData: newData });
});

// PUT route
app.put('/api/data/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  res.json({ message: `This is a PUT request for ID: ${id}`, updatedData });
});

// DELETE route
app.delete('/api/data/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `This is a DELETE request for ID: ${id}` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
