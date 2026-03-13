const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

const DATA_DIR = path.join(__dirname, "data");
const DIST_DIR = path.join(__dirname, "dist");

app.use(express.json());
app.use(cors());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// ------------------------
// In-memory storage
// ------------------------
let latestReading = null;

// ------------------------
// Helpers
// ------------------------
const getTodayFilePath = () => {
  const today = new Date().toISOString().split("T")[0];
  return path.join(DATA_DIR, `${today}.json`);
};

const saveToDailyFile = (entry) => {
  const filePath = getTodayFilePath();
  let history = [];
  if (fs.existsSync(filePath)) history = JSON.parse(fs.readFileSync(filePath));
  history.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
};

// ------------------------
// API Routes
// ------------------------
/**
 * @route POST /ping
 * @description Receives weather data and stores it.
 * @param {Object} req - The request object containing the body with temperature, humidity, no2, pm25, temp2, hPa properties.
 * @returns {Object} - A JSON response indicating success or error.
 */
app.post("/ping", (req, res) => {
  const { temperature, humidity, no2, pm25, temp2, hPa } = req.body;
  if (temperature === undefined || humidity === undefined)
    return res.status(400).json({ error: "Missing temperature or humidity" });

  latestReading = {
    temperature,
    humidity,
    no2,
    pm25,
    temp2,
    hPa: hPa !== undefined ? Math.round(hPa + 22) : undefined,
    timestamp: new Date().toISOString(),
  };

  console.log("New reading:", latestReading);
  res.json({ status: "success" });
});

/**
 * @route GET /latest
 * @description Retrieves the most recent weather data.
 * @returns {Object} - A JSON response containing the latest reading or an error if no data is available.
 */
app.get("/latest", (req, res) => {
  if (!latestReading) return res.status(404).json({ error: "No data yet" });
  res.json(latestReading);
});

/**

 * @route GET /today
 * @description Retrieves historical weather data for today.

 * @returns {Array} - A JSON response containing an array of historical readings for the current day or an empty array if no data is available.
 */

app.get("/today", (req, res) => {
  const filePath = getTodayFilePath();
  if (!fs.existsSync(filePath)) return res.json([]);
  res.json(JSON.parse(fs.readFileSync(filePath)));
});

/**
 * @route GET /history
 * @description Retrieves historical weather data for the entire last week.
 * @returns {Array} - A JSON response containing an array of historical readings from the past 7 days or an empty array if no data is available.
 */
app.get("/history", (req, res) => {
  const today = new Date();
  const history = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i); // Subtract i days from the current day
    const filePath = path.join(DATA_DIR, `${date.toISOString().split("T")[0]}.json`);
    
    if (fs.existsSync(filePath)) {
      history.push(...JSON.parse(fs.readFileSync(filePath)));
    }
  }
  
  res.json(history);
});

// ------------------------
// Periodic snapshot every 10 minutes
// ------------------------
setInterval(() => {
  if (latestReading) {
    console.log("Saving 10-minute snapshot...");
    saveToDailyFile(latestReading);
  }
}, 10 * 60 * 1000);

// ------------------------
// Serve React Frontend
// ------------------------
app.use(express.static(DIST_DIR));

/**
 * @route GET /*
 * @description Fallback route for SPA routing.
 * @returns {Object} - A JSON response containing the index.html file.
 */
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

// ------------------------
// Start server
// ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Weather Station backend running on port ${PORT}`);
});