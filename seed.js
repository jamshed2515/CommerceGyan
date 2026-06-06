const http = require("http");

const API_HOST = "localhost";
const API_PORT = 5000;

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    const req = http.request({ host: API_HOST, port: API_PORT, path, method, headers }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function seed() {
  // 1. Login
  const login = await request("POST", "/api/auth/login", {
    email: "commercegiyan@gmail.com",
    password: "CommerceGiyan@Admin123"
  });
  const token = login.body.token;
  if (!token) { console.log("Login failed:", login.body); process.exit(1); }
  console.log("Logged in OK");

  // 2. Get existing batches
  const existing = await request("GET", "/api/batches", null, token);
  const existingNames = (Array.isArray(existing.body) ? existing.body : []).map(b => b.batchName);

  // 3. Create batches
  const batchDefs = [
    "Class 9", "Class 10", "Class 11", "Class 12", "English Spoken", "Competition Class"
  ];
  const batchMap = {};
  const allBatches = Array.isArray(existing.body) ? existing.body : [];
  allBatches.forEach(b => { batchMap[b.batchName] = b._id; });

  for (const name of batchDefs) {
    if (batchMap[name]) { console.log("Batch exists: " + name); continue; }
    const r = await request("POST", "/api/batches", { batchName: name }, token);
    if (r.status === 201) {
      batchMap[name] = r.body.batch._id;
      console.log("Batch created: " + name);
    } else {
      console.log("Batch failed: " + name, r.body);
    }
  }

  // 4. Get existing schedules to avoid duplicates
  const existingSch = await request("GET", "/api/schedules", null, token);
  const schCount = Array.isArray(existingSch.body) ? existingSch.body.length : 0;
  console.log("Existing schedules: " + schCount);

  // 5. Create schedules
  const schedules = [
    { batchName: "Class 9",           subject: "Science",  dayOfWeek: "Monday",    startTime: "15:30", endTime: "16:30", note: "Sweety Maam" },
    { batchName: "Class 10",          subject: "Maths",    dayOfWeek: "Monday",    startTime: "16:30", endTime: "17:30", note: "Suresh Sir" },
    { batchName: "Class 12",          subject: "Commerce", dayOfWeek: "Tuesday",   startTime: "17:30", endTime: "18:30", note: "Tabarak Sir" },
    { batchName: "Class 11",          subject: "Commerce", dayOfWeek: "Tuesday",   startTime: "18:30", endTime: "19:30", note: "Tabarak Sir" },
    { batchName: "English Spoken",    subject: "English",  dayOfWeek: "Wednesday", startTime: "08:30", endTime: "10:00", note: "Hamza Sir" },
    { batchName: "Competition Class", subject: "General Studies", dayOfWeek: "Wednesday", startTime: "10:00", endTime: "11:30", note: "Sanjay Sir" },
    { batchName: "Class 9",           subject: "Maths",    dayOfWeek: "Thursday",  startTime: "14:00", endTime: "15:00", note: "" },
    { batchName: "Class 10",          subject: "Science",  dayOfWeek: "Friday",    startTime: "15:00", endTime: "16:00", note: "" },
    { batchName: "Class 12",          subject: "Accounts", dayOfWeek: "Saturday",  startTime: "09:00", endTime: "10:30", note: "" },
  ];

  for (const s of schedules) {
    const bId = batchMap[s.batchName];
    if (!bId) { console.log("No batch found for: " + s.batchName); continue; }
    const body = { batch: bId, subject: s.subject, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, note: s.note };
    const r = await request("POST", "/api/schedules", body, token);
    if (r.status === 201) {
      console.log("Schedule created: " + s.dayOfWeek + " | " + s.subject + " | " + s.startTime + " - " + s.endTime);
    } else {
      console.log("Schedule failed: " + s.subject, r.body.message);
    }
  }

  console.log("\nSeed complete!");
}

seed().catch(console.error);
