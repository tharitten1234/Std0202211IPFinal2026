const express = require('express');
const cors = require('cors');
const { salaryClusters } = require('./clusters');

function validateEmployee(body, isNew) {
  const { name, position, salary, status = isNew ? 'Active' : undefined } = body || {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
      typeof position !== 'string' || !position.trim() || position.trim().length > 100 ||
      typeof salary !== 'number' || !Number.isFinite(salary) || salary <= 0 || salary > 9999999999.99 ||
      Math.abs(salary * 100 - Math.round(salary * 100)) > 0.0001 ||
      !['Active', 'On Leave'].includes(status)) return null;
  return { name: name.trim(), position: position.trim(), salary, status };
}
function createApp(repository) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '20kb' }));
  app.post('/api/login', (req, res) => {
    if (req.body?.username === 'admin' && req.body?.password === 'password123') {
      return res.json({ success: true, token: 'mock-jwt-token' });
    }
    res.status(401).json({ error: 'Invalid username or password' });
  });
  app.use('/api/employees', (req, res, next) => {
    if (req.get('Authorization') !== 'Bearer mock-jwt-token') return res.status(401).json({ error: 'Unauthorized' });
    next();
  });
  app.get('/api/employees/salary-clusters', async (req, res) => {
    const employees = await repository.list();
    res.json({ success: true, clusters: salaryClusters(employees.map(e => e.salary)) });
  });
  app.get('/api/employees', async (req, res) => {
    if (req.query.search !== undefined && typeof req.query.search !== 'string') return res.status(400).json({ error: 'Invalid search' });
    res.json(await repository.list(req.query.search || ''));
  });
  app.post('/api/employees', async (req, res) => {
    const employee = validateEmployee(req.body, true);
    if (!employee) return res.status(400).json({ error: 'Name and position required (max 100 characters); salary must be positive with at most 2 decimals; status must be Active or On Leave' });
    res.status(201).json(await repository.add(employee));
  });
  app.param('id', (req, res, next, id) => {
    if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > 4294967295) return res.status(400).json({ error: 'Invalid employee ID' });
    next();
  });
  app.put('/api/employees/:id/status', async (req, res) => {
    const employee = await repository.toggle(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  });
  app.put('/api/employees/:id', async (req, res) => {
    const input = validateEmployee(req.body, false);
    if (!input) return res.status(400).json({ error: 'Invalid employee fields' });
    const employee = await repository.update(req.params.id, input);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  });
  app.delete('/api/employees/:id', async (req, res) => {
    if (!await repository.remove(req.params.id)) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true });
  });
  app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));
  app.use((error, req, res, next) => {
    const status = error.type === 'entity.parse.failed' ? 400 : error.type === 'entity.too.large' ? 413 : 500;
    res.status(status).json({ error: status === 500 ? 'Database request failed; please try again' : 'Invalid request body' });
  });
  return app;
}
module.exports = { createApp, validateEmployee };
