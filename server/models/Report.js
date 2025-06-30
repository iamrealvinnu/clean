const { getDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Report {
  constructor(reportData) {
    this.id = reportData.id || uuidv4();
    this.userId = reportData.userId;
    this.type = reportData.type;
    this.location = reportData.location;
    this.description = reportData.description;
    this.status = reportData.status || 'pending';
    this.priority = reportData.priority || 'medium';
    this.imageUrl = reportData.imageUrl;
    this.createdAt = reportData.createdAt || new Date().toISOString();
    this.updatedAt = reportData.updatedAt || new Date().toISOString();
  }

  static async create(reportData) {
    const db = getDB();
    const report = new Report(reportData);

    const stmt = db.prepare(`
      INSERT INTO waste_reports (id, userId, type, location, description, status, priority, imageUrl, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        report.id, report.userId, report.type, report.location, report.description,
        report.status, report.priority, report.imageUrl, report.createdAt, report.updatedAt
      );
      return report;
    } catch (error) {
      throw new Error(`Error creating report: ${error.message}`);
    }
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM waste_reports WHERE id = ?');
    const reportData = stmt.get(id);
    return reportData ? new Report(reportData) : null;
  }

  static findAll() {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM waste_reports ORDER BY createdAt DESC');
    const reports = stmt.all();
    return reports.map(reportData => new Report(reportData));
  }

  static findByUserId(userId) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM waste_reports WHERE userId = ? ORDER BY createdAt DESC');
    const reports = stmt.all(userId);
    return reports.map(reportData => new Report(reportData));
  }

  static findByStatus(status) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM waste_reports WHERE status = ? ORDER BY createdAt DESC');
    const reports = stmt.all(status);
    return reports.map(reportData => new Report(reportData));
  }

  async save() {
    const db = getDB();
    this.updatedAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE waste_reports 
      SET type = ?, location = ?, description = ?, status = ?, priority = ?, 
          imageUrl = ?, updatedAt = ?
      WHERE id = ?
    `);

    try {
      stmt.run(
        this.type, this.location, this.description, this.status, this.priority,
        this.imageUrl, this.updatedAt, this.id
      );
      return this;
    } catch (error) {
      throw new Error(`Error updating report: ${error.message}`);
    }
  }

  static async delete(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM waste_reports WHERE id = ?');
    
    try {
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error deleting report: ${error.message}`);
    }
  }
}

module.exports = Report;