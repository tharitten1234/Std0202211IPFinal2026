const { createPool } = require('./db');
const { employeeRepository } = require('./repository');
const { createApp } = require('./app');
async function start() {
  const pool = createPool();
  try {
    await pool.query('SELECT ThaKet_id FROM ThaKet_employees LIMIT 1');
    const port = Number(process.env.PORT || 3022);
    if (port !== 3022) throw new Error('Assigned port must be 3022');
    const server = createApp(employeeRepository(pool)).listen(port, '0.0.0.0', () => console.log(`HR API listening on port ${port}`));
    server.on('error', async () => { console.error('Cannot bind assigned port'); await pool.end(); process.exitCode = 1; });
    process.on('SIGINT', () => server.close(async () => { await pool.end(); process.exit(0); }));
  } catch (error) {
    await pool.end();
    throw error;
  }
}
start().catch(() => { console.error('Startup failed: check backend/.env, MySQL permissions, ThaKet_employees and port 3022'); process.exitCode = 1; });
