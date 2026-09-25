# 🩸 BloodConnect | Emergency Transfusion & Compatibility Network

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://bloodconnect-client.vercel.app)
[![Render Backend](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render)](https://bloodconnectbackend-api.onrender.com)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://aiven.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Live Demo:** [bloodconnect-client.vercel.app](https://bloodconnect-client.vercel.app)  
> **Backend API Base:** `https://bloodconnectbackend-api.onrender.com/api`

---

## 📌 Overview

**BloodConnect** is a full-stack, emergency blood donation dispatch and biological compatibility platform designed to bridge the gap between critical hospital wards and available registered donors. 

Unlike probabilistic matchmaking systems, BloodConnect utilizes a **deterministic ABO/Rh clinical compatibility engine** executed on an indexed MySQL database. When an emergency SOS is broadcast, the system computes verified compatible blood phenotypes and returns localized, actionable donor contact records in sub-second latency.

---

## ⚡ Key Features

- **Gated Authentication Portal:** Session-persisted user registration and login supporting operators, hospitals, and volunteers.
- **Deterministic ABO/Rh Matching Engine:** Evaluates clinical red blood cell compatibility rules directly against relational donor registries (eliminating stochastic matching delays or AI hallucinations).
- **Emergency SOS Dispatcher:** Real-time form logging patient vitals, hospital location, required units, and urgency level with instant donor query triggers.
- **Direct Donor Dialing:** Dynamic donor cards featuring single-touch phone dispatching for rapid response coordination.
- **Active Volunteer Registry:** Self-serve onboarding pipeline for blood donors with live status toggling.
- **Operational Dashboard Metrics:** Sub-second metric aggregation for total active donors, open emergency dispatches, and system latency.

---

## 🧬 Transfusion Compatibility Logic

The core matching engine implements standard serological compatibility across eight principal red blood cell phenotypes:

| Recipient Type | Safe Biological Donor Phenotypes |
|---|---|
| **O−** | O− (Universal Erythrocyte Donor) |
| **O+** | O−, O+ |
| **A−** | O−, A− |
| **A+** | O−, O+, A−, A+ |
| **B−** | O−, B− |
| **B+** | O−, O+, B−, B+ |
| **AB−** | O−, A−, B−, AB− |
| **AB+** | Universal Recipient (O−, O+, A−, A+, B−, B+, AB−, AB+) |

---

## 🛠️ Architecture & Tech Stack
bloodconnect/
├── bloodconnect-app/
│   ├── client/          # React 19 + Vite + Tailwind CSS v4 (Hosted on Vercel)
│   └── server/          # Node.js + Express API + mysql2 (Hosted on Render)
└── README.md
### **Frontend**
- **Framework:** React 19 (Vite SPA)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Axios (configured with environment variable base routing)
- **Deployment:** Vercel

### **Backend**
- **Runtime:** Node.js
- **Server Framework:** Express.js
- **Driver:** `mysql2/promise` (connection pooling with automated keep-alive)
- **Environment Management:** `dotenv`
- **Deployment:** Render (Web Service)

### **Database**
- **Engine:** MySQL 8.0 (Aiven Cloud Managed Service)
- **Design:** Relational schema with indexed ENUM columns for phenotypic blood groups and urgency levels.

---

## 🗄️ Database Schema

```sql
-- 1. Authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'HOSPITAL', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Registered Donors
CREATE TABLE donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120),
  last_donated_date DATE NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Emergency SOS Requests
CREATE TABLE emergency_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  hospital_name VARCHAR(150) NOT NULL,
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  units_needed INT NOT NULL DEFAULT 1,
  city VARCHAR(100) NOT NULL,
  urgency_level ENUM('CRITICAL', 'URGENT', 'STANDARD') DEFAULT 'URGENT',
  contact_number VARCHAR(20) NOT NULL,
  status ENUM('OPEN', 'FULFILLED', 'CANCELLED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
🚀 API EndpointsMethodEndpointDescriptionPOST/api/auth/registerRegister a new user sessionPOST/api/auth/loginAuthenticate existing credentialsGET/api/statsRetrieve real-time donor and SOS request countsGET/api/donorsQuery active donors (supports ?city= & ?blood_group=)POST/api/donorsOnboard a new volunteer donor into the databasePOST/api/requestsBroadcast SOS & trigger ABO/Rh compatibility donor matching💻 Local Development SetupPrerequisitesNode.js (v18+)MySQL (v8.0+) or Cloud Database Connection URI1. Clone the RepositoryBashgit clone [https://github.com/nushka08/bloodconnect.git](https://github.com/nushka08/bloodconnect.git)
cd bloodconnect/bloodconnect-app
2. Configure BackendBashcd server
npm install
Create a .env file inside server/:Code snippetPORT=5000
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=bloodconnect_db
Start the API server:Bashnode server.js
3. Configure Frontend
Open a new terminal:

Bash
cd ../client
npm install
Create a .env file inside client/:

Code snippet
VITE_API_BASE_URL=http://localhost:5000/api
Start Vite dev server:

Bash
npm run dev
Visit http://localhost:5173 to test the application locally.

📄 License
This project is open-source and available under the MIT License.
**AUTHOR**
Anushka Mishra
GitHub:github.com/nushk08
LinkedIN:https://linkedin.com/anushka-mishra-