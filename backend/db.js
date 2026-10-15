const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

function createPool() {
  if (process.env.DB_NAME !== 'ip_std6730202211') throw new Error('DB_NAME must be ip_std6730202211');
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD']) {
    if (!process.env[key]) throw new Error(`Missing ${key} in backend/.env`);
  }
  return mysql.createPool({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: 'ip_std6730202211', waitForConnections: true,
    connectionLimit: 5, decimalNumbers: true, charset: 'utf8mb4',
  });
}
module.exports = { createPool };
