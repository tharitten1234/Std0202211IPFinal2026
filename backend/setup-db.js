const fs = require('node:fs');
const path = require('node:path');
const { createPool } = require('./db');
async function setup() {
  const pool = createPool();
  let connection;
  try {
    connection = await pool.getConnection();
    const [lock] = await connection.query("SELECT GET_LOCK('ThaKet_employees_setup', 10) AS acquired");
    if (lock[0].acquired !== 1) throw new Error('Setup busy');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const create = schema.slice(schema.indexOf('CREATE TABLE')).trim().replace(/;$/, '');
    await connection.query(create);
    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM ThaKet_employees');
    if (Number(rows[0].count) === 0) {
      await connection.execute('INSERT INTO ThaKet_employees (ThaKet_name, ThaKet_position, ThaKet_status, ThaKet_salary) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)', [
        'John Doe', 'Software Engineer', 'Active', 45000,
        'Jane Smith', 'HR Officer', 'Active', 25000,
        'Somchai Jai', 'Manager', 'On Leave', 85000,
        'Suda Dee', 'Accountant', 'Active', 35000,
        'Anan Rak', 'Assistant', 'Active', 18000,
      ]);
      console.log('Created five initial employee records');
    } else console.log('Existing employee records preserved; no seed inserted');
  } finally {
    if (connection) { await connection.query("SELECT RELEASE_LOCK('ThaKet_employees_setup')"); connection.release(); }
    await pool.end();
  }
}
setup().catch(error => {
  const hints = {
    ECONNREFUSED: 'MySQL connection refused. If running locally against cloud MySQL, open an SSH tunnel and set DB_PORT to its local port.',
    ETIMEDOUT: 'MySQL connection timed out. Check network access or the SSH tunnel.',
    ENOTFOUND: 'DB_HOST could not be resolved.',
    PROTOCOL_CONNECTION_LOST: 'Connection closed before MySQL completed the handshake. Check the SSH terminal for forwarding errors and confirm the remote MySQL host/port.',
    ECONNRESET: 'Connection was reset. Check SSH forwarding and the remote MySQL service.',
    ER_ACCESS_DENIED_ERROR: 'MySQL rejected the credentials or host grant. Check DB_USER/DB_PASSWORD and account permissions.',
    ER_BAD_DB_ERROR: 'Assigned database was not found. Confirm ip_std6730202211 with the teacher; do not create another database.',
    ER_DBACCESS_DENIED_ERROR: 'This account cannot access the assigned database.',
    ER_TABLEACCESS_DENIED_ERROR: 'Missing CREATE/SELECT/INSERT permissions for ThaKet_employees.',
    ER_BAD_FIELD_ERROR: 'ThaKet_employees has an unexpected schema. Inspect it without dropping or changing existing data.',
  };
  const configurationError = /^Missing DB_(HOST|USER|PASSWORD) in backend\/\.env$/.test(error.message) || error.message === 'DB_NAME must be ip_std6730202211';
  const hint = hints[error.code] || (configurationError ? error.message : 'Check database setup and permissions; no raw database details are printed.');
  console.error(`Setup failed: ${hint}`);
  process.exitCode = 1;
});
