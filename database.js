const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(); 
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ Could not connect to MongoDB', error);
    process.exit(1);
  }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
}

module.exports = { connectToDatabase, getDb };