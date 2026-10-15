const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('./app');
const { salaryClusters } = require('./clusters');
const { employeeRepository } = require('./repository');
const auth = { Authorization: 'Bearer mock-jwt-token' };

// In-memory fixture is injected ONLY by tests. Production server always uses MySQL.
function fixture() {
  let rows = [10000, 12000, 40000, 44000, 90000].map((salary, i) => ({ id: String(i + 1), name: `Employee ${i}`, position: i === 0 ? 'HR Officer' : 'Engineer', salary, status: 'Active' }));
  let next = 6;
  return {
    async list(search = '') { return rows.filter(e => `${e.name} ${e.position}`.toLowerCase().includes(search.toLowerCase())); },
    async add(input) { const e = { ...input, id: String(next++) }; rows.push(e); return e; },
    async update(id, input) { const e = rows.find(e => e.id === id); return e ? Object.assign(e, input) : null; },
    async toggle(id) { const e = rows.find(e => e.id === id); if (e) e.status = e.status === 'Active' ? 'On Leave' : 'Active'; return e; },
    async remove(id) { const count = rows.length; rows = rows.filter(e => e.id !== id); return rows.length < count; },
  };
}
test('login and protected routes reject unauthenticated requests', async () => {
  const app = createApp(fixture());
  await request(app).post('/api/login').send({ username: 'admin', password: 'wrong' }).expect(401);
  await request(app).post('/api/login').send({ username: 'admin', password: 'password123' }).expect(200, { success: true, token: 'mock-jwt-token' });
  for (const route of ['/api/employees', '/api/employees/salary-clusters']) await request(app).get(route).expect(401);
  await request(app).delete('/api/employees/1').expect(401);
});
test('CRUD, name/position search and analytics reflect current records', async () => {
  const app = createApp(fixture());
  const list = await request(app).get('/api/employees').set(auth).expect(200);
  assert.equal(list.body.length, 5);
  const added = await request(app).post('/api/employees').set(auth).send({ name: '  New Person ', position: 'Analyst', salary: 30000 }).expect(201);
  assert.equal(added.body.name, 'New Person'); assert.equal(added.body.status, 'Active');
  const id = added.body.id;
  await request(app).put(`/api/employees/${id}`).set(auth).send({ name: 'Updated Name', position: 'Director', salary: 99000, status: 'On Leave' }).expect(200);
  for (const search of ['Updated', 'Director']) {
    const found = await request(app).get('/api/employees').query({ search }).set(auth).expect(200);
    assert.equal(found.body[0].id, id); assert.equal(found.body.length, 1);
  }
  const toggle = await request(app).put(`/api/employees/${id}/status`).set(auth).expect(200);
  assert.equal(toggle.body.status, 'Active');
  const back = await request(app).put(`/api/employees/${id}/status`).set(auth).expect(200);
  assert.equal(back.body.status, 'On Leave');
  let clusters = await request(app).get('/api/employees/salary-clusters').set(auth).expect(200);
  assert.equal(clusters.body.clusters.reduce((n, c) => n + c.count, 0), 6);
  await request(app).delete(`/api/employees/${id}`).set(auth).expect(200);
  await request(app).delete(`/api/employees/${id}`).set(auth).expect(404);
  clusters = await request(app).get('/api/employees/salary-clusters').set(auth).expect(200);
  assert.deepEqual(clusters.body, { success: true, clusters: [
    { group: 'Tier 1', centroid: 11000, count: 2 },
    { group: 'Tier 2', centroid: 42000, count: 2 },
    { group: 'Tier 3', centroid: 90000, count: 1 },
  ] });
});
test('validation, malformed requests, missing records, database failures', async () => {
  const app = createApp(fixture());
  for (const input of [{}, { name: ' ', position: 'HR', salary: 5 }, { name: 'A', position: '', salary: 5 },
    ...[null, '', '500', -1, 0, 1.234, 1e12].map(salary => ({ name: 'A', position: 'HR', salary })),
    { name: 'A', position: 'HR', salary: 500, status: 'Invalid' }]) {
    await request(app).post('/api/employees').set(auth).send(input).expect(400);
  }
  await request(app).put('/api/employees/999').set(auth).send({ name: 'A', position: 'HR', salary: 500, status: 'Active' }).expect(404);
  await request(app).put('/api/employees/999/status').set(auth).expect(404);
  await request(app).delete('/api/employees/not-id').set(auth).expect(400);
  await request(app).get('/api/employees?search[x]=a&search=b&search=c').set(auth).expect(400);
  await request(app).post('/api/employees').set(auth).set('Content-Type', 'application/json').send('{').expect(400);
  const broken = createApp({ list: async () => { throw new Error('secret database details'); } });
  const response = await request(broken).get('/api/employees').set(auth).expect(500);
  assert.ok(!JSON.stringify(response.body).includes('secret'));
});
test('K-Means handles empty, identical, fewer than k, skewed and fractional salaries', () => {
  for (const values of [[], [5], [5, 5, 5], [1, 2], [0.1, 0.2, 1.1, 1.2, 5], [1, 1, 1, 2, 1000000]]) {
    const clusters = salaryClusters(values);
    assert.equal(clusters.length, 3);
    assert.equal(clusters.reduce((sum, c) => sum + c.count, 0), values.length);
    assert.ok(clusters.every(c => c.count === 0 ? c.centroid === null : Number.isFinite(c.centroid)));
    if (values.length) {
      const actual = clusters.reduce((sum, c) => sum + (c.centroid || 0) * c.count, 0);
      assert.ok(Math.abs(actual - values.reduce((a, b) => a + b, 0)) <= values.length * 0.005 + 1e-6);
    }
  }
});
test('MySQL mapping and bound parameters preserve schema and prevent SQL interpolation', async () => {
  const calls = [];
  const pool = { async execute(sql, params) { calls.push({ sql, params }); return [[{ id: 7, name: 'A', position: 'HR', status: 'Active', salary: '123.45' }]]; } };
  const repo = employeeRepository(pool);
  const input = "' OR 1=1 --";
  const rows = await repo.list(input);
  assert.equal(rows[0].id, '7'); assert.equal(rows[0].salary, 123.45);
  assert.ok(calls[0].sql.includes('ThaKet_employees'));
  assert.ok(!calls[0].sql.includes(input));
  assert.deepEqual(calls[0].params, [`%${input}%`, `%${input}%`]);
});
