const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(userData) {
    this.id = userData.id || uuidv4();
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || 'resident';
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.phone = userData.phone;
    this.address = userData.address;
    this.createdAt = userData.createdAt || new Date().toISOString();
    this.updatedAt = userData.updatedAt || new Date().toISOString();
  }

  static async create(userData) {
    const db = getDB();
    const user = new User(userData);
    
    // Hash password
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password, role, firstName, lastName, phone, address, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        user.id, user.username, user.email, user.password, user.role,
        user.firstName, user.lastName, user.phone, user.address,
        user.createdAt, user.updatedAt
      );
      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const userData = stmt.get(id);
    return userData ? new User(userData) : null;
  }

  static findByEmail(email) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const userData = stmt.get(email);
    return userData ? new User(userData) : null;
  }

  static findByUsername(username) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const userData = stmt.get(username);
    return userData ? new User(userData) : null;
  }

  static findAll() {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users ORDER BY createdAt DESC');
    const users = stmt.all();
    return users.map(userData => new User(userData));
  }

  static findByRole(role) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY createdAt DESC');
    const users = stmt.all(role);
    return users.map(userData => new User(userData));
  }

  async save() {
    const db = getDB();
    this.updatedAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE users 
      SET username = ?, email = ?, role = ?, firstName = ?, lastName = ?, 
          phone = ?, address = ?, updatedAt = ?
      WHERE id = ?
    `);

    try {
      stmt.run(
        this.username, this.email, this.role, this.firstName, this.lastName,
        this.phone, this.address, this.updatedAt, this.id
      );
      return this;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;