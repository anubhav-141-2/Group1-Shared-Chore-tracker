CREATE DATABASE IF NOT EXISTS fair_split;
USE fair_split;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE households (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  invite_code VARCHAR(36) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (household_id, user_id),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  payer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  expense_date DATE NOT NULL,
  archived TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (payer_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE expense_shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expense_id INT NOT NULL,
  member_id INT NOT NULL,
  share_amount DECIMAL(10,2) NOT NULL,
  UNIQUE KEY (expense_id, member_id),
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE chores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(50) NOT NULL DEFAULT 'weekly',
  weight DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  current_assignee_id INT,
  next_due_date DATE,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (current_assignee_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE chore_completions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chore_id INT NOT NULL,
  completed_by_id INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE,
  FOREIGN KEY (completed_by_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE settlements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  from_member_id INT NOT NULL,
  to_member_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  settlement_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (from_member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (to_member_id) REFERENCES members(id) ON DELETE CASCADE
);
