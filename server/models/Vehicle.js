const { getDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Vehicle {
  constructor(vehicleData) {
    this.id = vehicleData.id || uuidv4();
    this.vehicleNumber = vehicleData.vehicleNumber;
    this.type = vehicleData.type;
    this.capacity = vehicleData.capacity;
    this.status = vehicleData.status || 'available';
    this.driverId = vehicleData.driverId;
    this.currentLocation = vehicleData.currentLocation;
    this.createdAt = vehicleData.createdAt || new Date().toISOString();
    this.updatedAt = vehicleData.updatedAt || new Date().toISOString();
  }

  static async create(vehicleData) {
    const db = getDB();
    const vehicle = new Vehicle(vehicleData);

    const stmt = db.prepare(`
      INSERT INTO vehicles (id, vehicleNumber, type, capacity, status, driverId, currentLocation, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        vehicle.id, vehicle.vehicleNumber, vehicle.type, vehicle.capacity,
        vehicle.status, vehicle.driverId, vehicle.currentLocation,
        vehicle.createdAt, vehicle.updatedAt
      );
      return vehicle;
    } catch (error) {
      throw new Error(`Error creating vehicle: ${error.message}`);
    }
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
    const vehicleData = stmt.get(id);
    return vehicleData ? new Vehicle(vehicleData) : null;
  }

  static findAll() {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM vehicles ORDER BY createdAt DESC');
    const vehicles = stmt.all();
    return vehicles.map(vehicleData => new Vehicle(vehicleData));
  }

  static findByDriverId(driverId) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM vehicles WHERE driverId = ?');
    const vehicleData = stmt.get(driverId);
    return vehicleData ? new Vehicle(vehicleData) : null;
  }

  static findByStatus(status) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM vehicles WHERE status = ? ORDER BY createdAt DESC');
    const vehicles = stmt.all(status);
    return vehicles.map(vehicleData => new Vehicle(vehicleData));
  }

  async save() {
    const db = getDB();
    this.updatedAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE vehicles 
      SET vehicleNumber = ?, type = ?, capacity = ?, status = ?, driverId = ?, 
          currentLocation = ?, updatedAt = ?
      WHERE id = ?
    `);

    try {
      stmt.run(
        this.vehicleNumber, this.type, this.capacity, this.status,
        this.driverId, this.currentLocation, this.updatedAt, this.id
      );
      return this;
    } catch (error) {
      throw new Error(`Error updating vehicle: ${error.message}`);
    }
  }

  static async delete(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
    
    try {
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error deleting vehicle: ${error.message}`);
    }
  }
}

module.exports = Vehicle;