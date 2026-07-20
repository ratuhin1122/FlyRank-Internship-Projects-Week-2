const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');

const app = express();
const PORT = 3000;

// Our whole "database": a list in memory. It disappears when the server stops.
let tasks = [
  { id: 1, title: 'Read the assignment', done: true },
  { id: 2, title: 'Build the CRUD API', done: false },
  { id: 3, title: 'Push it to GitHub', done: false },
];

// Lets Express read JSON request bodies into req.body.
app.use(express.json());

// Swagger UI reads openapi.json and turns it into a clickable page.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// The front door: tells a client what this API is.
app.get('/', (req, res) => {
  res.json({ name: 'Task API', version: '1.0', endpoints: ['/tasks'] });
});

// Health check — how monitoring tools ask "are you alive?"
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Read: the whole list.
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Read: one task. ":id" is a path parameter — the changing piece of the URL.
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  res.json(task);
});

// Create: the server never trusts the client, so we validate first.
app.post('/tasks', (req, res) => {
  const { title } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Field "title" is required and must be a non-empty string' });
  }

  const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const task = { id: nextId, title: title.trim(), done: false };

  tasks.push(task);
  res.status(201).json(task);
});

// Update: change the title and/or the done flag of an existing task.
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  const { title, done } = req.body || {};

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'Body must contain "title" and/or "done"' });
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Field "title" must be a non-empty string' });
  }
  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ error: 'Field "done" must be true or false' });
  }

  if (title !== undefined) task.title = title.trim();
  if (done !== undefined) task.done = done;

  res.json(task);
});

// Delete: 204 means "it worked, and there is nothing left to say".
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Task API listening on http://localhost:${PORT}`);
});
