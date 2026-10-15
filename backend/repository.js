const columns = 'ThaKet_id AS id, ThaKet_name AS name, ThaKet_position AS position, ThaKet_status AS status, ThaKet_salary AS salary';
const map = row => ({ ...row, id: String(row.id), salary: Number(row.salary) });
function employeeRepository(pool) {
  return {
    async list(search = '') {
      const [rows] = await pool.execute(`SELECT ${columns} FROM ThaKet_employees WHERE ThaKet_name LIKE ? OR ThaKet_position LIKE ? ORDER BY ThaKet_id`, [`%${search}%`, `%${search}%`]);
      return rows.map(map);
    },
    async get(id) {
      const [rows] = await pool.execute(`SELECT ${columns} FROM ThaKet_employees WHERE ThaKet_id = ?`, [id]);
      return rows[0] ? map(rows[0]) : null;
    },
    async add(employee) {
      const [result] = await pool.execute('INSERT INTO ThaKet_employees (ThaKet_name, ThaKet_position, ThaKet_status, ThaKet_salary) VALUES (?, ?, ?, ?)', [employee.name, employee.position, employee.status, employee.salary]);
      return this.get(result.insertId);
    },
    async update(id, employee) {
      const [result] = await pool.execute('UPDATE ThaKet_employees SET ThaKet_name=?, ThaKet_position=?, ThaKet_status=?, ThaKet_salary=? WHERE ThaKet_id=?', [employee.name, employee.position, employee.status, employee.salary, id]);
      return result.affectedRows ? this.get(id) : null;
    },
    async toggle(id) {
      const [result] = await pool.execute("UPDATE ThaKet_employees SET ThaKet_status=IF(ThaKet_status='Active','On Leave','Active') WHERE ThaKet_id=?", [id]);
      return result.affectedRows ? this.get(id) : null;
    },
    async remove(id) {
      const [result] = await pool.execute('DELETE FROM ThaKet_employees WHERE ThaKet_id=?', [id]);
      return result.affectedRows > 0;
    },
  };
}
module.exports = { employeeRepository };
