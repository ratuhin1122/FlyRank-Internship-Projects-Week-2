const express = require('express');

const app = express();
const PORT = 3000;

// The front door: tells a client what this API is.
app.get('/', (req, res) => {
  res.json({ name: 'Task API', version: '1.0', endpoints: ['/tasks'] });
});

// Health check — how monitoring tools ask "are you alive?"
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Task API listening on http://localhost:${PORT}`);
});
