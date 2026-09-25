const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Exact medical compatibility chart (no AI hallucination/rate limits)
const COMPATIBILITY_CHART = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

// 1. Dashboard summary counters
app.get('/api/stats', async (req, res) => {
  try {
    const [[{ totalDonors }]] = await db.query('SELECT COUNT(*) AS totalDonors FROM donors WHERE is_available = true');
    const [[{ openRequests }]] = await db.query("SELECT COUNT(*) AS openRequests FROM emergency_requests WHERE status = 'OPEN'");
    res.json({ totalDonors, openRequests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch all donors (optional city filter)
app.get('/api/donors', async (req, res) => {
  try {
    const { city, blood_group } = req.query;
    let query = 'SELECT id, name, blood_group, city, phone, is_available FROM donors WHERE is_available = true';
    const params = [];

    if (city) {
      query += ' AND LOWER(city) = LOWER(?)';
      params.push(city);
    }
    if (blood_group) {
      query += ' AND blood_group = ?';
      params.push(blood_group);
    }
    query += ' ORDER BY id DESC';

    const [donors] = await db.query(query, params);
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Register a new donor
app.post('/api/donors', async (req, res) => {
  try {
    const { name, blood_group, city, phone, email } = req.body;
    if (!name || !blood_group || !city || !phone) {
      return res.status(400).json({ error: 'Name, blood group, city, and phone are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO donors (name, blood_group, city, phone, email) VALUES (?, ?, ?, ?, ?)',
      [name, blood_group, city, phone, email || null]
    );
    res.status(201).json({ success: true, donorId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create an Emergency Request + Deterministic Matchmaking
app.post('/api/requests', async (req, res) => {
  try {
    const { patient_name, hospital_name, blood_group, units_needed, city, urgency_level, contact_number } = req.body;

    if (!patient_name || !hospital_name || !blood_group || !city || !contact_number) {
      return res.status(400).json({ error: 'Missing required emergency fields.' });
    }

    // Save request to database
    const [insertResult] = await db.query(
      `INSERT INTO emergency_requests 
       (patient_name, hospital_name, blood_group, units_needed, city, urgency_level, contact_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_name, hospital_name, blood_group, units_needed || 1, city, urgency_level || 'CRITICAL', contact_number]
    );

    // Look up compatible donor blood groups
    const compatibleGroups = COMPATIBILITY_CHART[blood_group] || [blood_group];

    // Find all matching donors in the target city
    const [matchedDonors] = await db.query(
      `SELECT id, name, blood_group, city, phone 
       FROM donors 
       WHERE LOWER(city) = LOWER(?) 
         AND is_available = true 
         AND blood_group IN (?)
       ORDER BY (blood_group = ?) DESC, id ASC`,
      [city, compatibleGroups, blood_group]
    );

    res.status(201).json({
      success: true,
      requestId: insertResult.insertId,
      compatibleGroups,
      matchedCount: matchedDonors.length,
      matchedDonors,
    });
  } catch (err) {
    console.error('Request error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 BloodConnect Backend running on http://localhost:${PORT}`));