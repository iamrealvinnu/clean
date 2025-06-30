const { getDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Schedule {
  constructor(scheduleData) {
    this.id = scheduleData.id || uuidv4();
    this.vehicleId = scheduleData.vehicleId;
    this.route = scheduleData.route;
    this.startTime = scheduleData.startTime;
    this.endTime = scheduleData.endTime;
    this.status = scheduleData.status || 'scheduled';
    this.createdAt = scheduleData.createdAt || new Date().toISOString();
    this.updatedAt = scheduleData.updatedAt || new Date().toISOString();
  }

  static async create(scheduleData) {
    const db = getDB();
    const schedule = new Schedule(scheduleData);

    const stmt = db.prepare(`
      INSERT INTO schedules (id, vehicleId, route, startTime, endTime, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        schedule.id, schedule.vehicleId, schedule.route, schedule.startTime,
        schedule.endTime, schedule.status, schedule.createdAt, schedule.updatedAt
      );
      return schedule;
    } catch (error) {
      throw new Error(`Error creating schedule: ${error.message}`);
    }
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM schedules WHERE id = ?');
    const scheduleData = stmt.get(id);
    return scheduleData ? new Schedule(scheduleData) : null;
  }

  static findAll() {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM schedules ORDER BY startTime DESC');
    const schedules = stmt.all();
    return schedules.map(scheduleData => new Schedule(scheduleData));
  }

  static findByVehicleId(vehicleId) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM schedules WHERE vehicleId = ? ORDER BY startTime DESC');
    const schedules = stmt.all(vehicleId);
    return schedules.map(scheduleData => new Schedule(scheduleData));
  }

  static findByStatus(status) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM schedules WHERE status = ? ORDER BY startTime DESC');
    const schedules = stmt.all(status);
    return schedules.map(scheduleData => new Schedule(scheduleData));
  }

  async save() {
    const db = getDB();
    this.updatedAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE schedules 
      SET vehicleId = ?, route = ?, startTime = ?, endTime = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `);

    try {
      stmt.run(
        this.vehicleId, this.route, this.startTime, this.endTime,
        this.status, this.updatedAt, this.id
      );
      return this;
    } catch (error) {
      throw new Error(`Error updating schedule: ${error.message}`);
    }
  }

  static async delete(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM schedules WHERE id = ?');
    
    try {
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error deleting schedule: ${error.message}`);
    }
  }
}

module.exports = Schedule;