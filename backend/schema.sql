-- Run ONLY within the assigned existing database. No CREATE DATABASE or legacy-table changes.
USE ip_std6730202211;
CREATE TABLE IF NOT EXISTS ThaKet_employees (
  ThaKet_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ThaKet_name VARCHAR(100) NOT NULL,
  ThaKet_position VARCHAR(100) NOT NULL,
  ThaKet_status ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
  ThaKet_salary DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
