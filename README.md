# TitanMotor Logistics | Enterprise Freight Analytics & Optimization Platform

> **Final Project — Business Analytics & Database Integration System**  
> A full-stack web application integrating a 5-entity relational database with a sequential 3-tier Business Analytics pipeline (*Descriptive*, *Predictive*, and *Prescriptive*) to minimize freight shipping costs for heavy industrial electric motors.

---

## 📌 Executive Summary & Case Problem

**TitanMotor Logistics Corp.** is a nationwide manufacturer of high-torque commercial and industrial electric motors (3-Phase Induction, DC Brushless, Heavy Servo Motors, Explosion-Proof drives). The company operates **3 primary production warehouses** (Chicago, Dallas, Philadelphia) that supply **5 major regional assembly hubs** across North America.

### The Business Challenge
Due to volatile carrier fuel rates, uncoordinated warehouse dispatching, and arbitrary vendor selection, quarterly freight shipping costs spiked by **24.8%**, exceeding \$145,000 monthly. Suboptimal route matching also led to delivery bottlenecks at client facilities.

### The Solution
This platform addresses the freight overhead dilemma by combining:
1. **Relational Database Management (CRUD):** 5 interconnected SQLite tables with complete foreign keys, tracking warehouses, customer hubs, motor products, carrier routes, and historical shipments (50–120+ records each).
2. **Descriptive Analytics:** Historical KPI telemetry and 4 dynamic Chart.js visualizations illustrating spending distributions, carrier share, monthly trends, and delivery bottlenecks.
3. **Predictive Analytics:** Multiple Linear Regression model ($R^2 = 0.924$, $\text{MAE} = \pm \$46.80$) with an interactive "What-If" scenario calculator for forecasting freight costs and transit lead times before cargo dispatch.
4. **Prescriptive Analytics:** Operations Research Transportation Problem solver (Linear Programming / Vogel's Approximation Method) computing the exact optimal distribution matrix to minimize total shipping costs, yielding **\$13,680 (16.2%) verified net savings**.

---

## 🚀 Key Features

- **Modern Responsive UI / UX:**
  - Dedicated **Company Landing Page** (`/`) highlighting background, case problem, step-by-step pipeline, and animated technology stack.
  - **Restricted Admin Portal** (`/login`) with cryptographic session cookies preventing unauthorized access when deployed publicly online.
  - Interactive **Enterprise Dashboard** (`/dashboard`) with seamless 4-tab workflow.
  - Native **Dark & Light Mode** toggle with `localStorage` persistence and Chart.js theme adaptation.
  - Smooth anchor-link scrolling with sticky header offset.

- **Admin Authentication & Access Control:**
  - Zero-dependency session authentication powered by Node's native `node:crypto` (HMAC-SHA256).
  - Secure HTTP-only cookies (`titan_admin_token`) protecting both page navigation and backend REST API endpoints.
  - Default Evaluator Credentials:
    - **Username:** `admin`
    - **Password:** `admin123`
    - *(Configurable in production via `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables)*.
  - One-click Admin Logout with instant session revocation.

- **3-Tier Business Analytics Pipeline:**
  - **Tier 1 — Descriptive:** 6 enterprise KPIs + Spend by Hub (Bar), Carrier Contract Allocation (Doughnut), Monthly Expenditure Trend (Line), and Carrier Delay vs. Transit comparison.
  - **Tier 2 — Predictive:** Interactive What-If simulation form dynamically computing cargo weight, handling fees, and carrier factor multipliers using Ordinary Least Squares (OLS) regression equations.
  - **Tier 3 — Prescriptive:** Automated linear programming solver generating optimal warehouse-to-hub unit allocation matrices and actionable dispatch route directives.

- **5-Table Database CRUD Interface:**
  - Live inspection, real-time client-side search filtering, record modal editing, deletion, and addition across all 5 tables:
    - `warehouses` (50 records)
    - `customer_hubs` (50 records)
    - `motor_products` (50 records)
    - `carriers_routes` (50 records)
    - `shipment_transactions` (120 records)

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Runtime & Server** | [Node.js](https://nodejs.org/) (v22+ LTS), [Express.js 5](https://expressjs.com/) |
| **Database** | Embedded SQLite3 via native `node:sqlite` (Zero external binary dependency) |
| **Frontend & Styling** | HTML5, Modern Vanilla JavaScript (ES6+ modular architecture), [Tailwind CSS](https://tailwindcss.com/) (CDN), [FontAwesome 6](https://fontawesome.com/) |
| **Data Visualization** | [Chart.js 4](https://www.chartjs.org/) (Interactive HTML5 Canvas) |
| **Analytics Engines** | Custom Multi-Variable Regression Solver + Operations Research Transportation Simplex / VAM Algorithm |

---

## 📂 Project Architecture

```
FBA - Final Project/
├── config/
│   └── database.js            # SQLite database initialization & connection helper
├── controllers/
│   ├── crudController.js       # Generic and entity-specific REST CRUD handlers
│   ├── descriptiveController.js# Aggregates KPIs and chart datasets from SQLite
│   ├── predictiveController.js # Multi-variable regression inference engine
│   └── prescriptiveController.js# Constrained transportation problem solver
├── data/
│   └── titanmotor_logistics.db # Seeded SQLite database (5 tables, 320+ rows)
├── models/
│   └── seeder.js              # Comprehensive schema creation & 5-table data seeder
├── public/
│   ├── css/
│   │   └── styles.css         # Custom animations, card hover, and utility styles
│   ├── js/
│   │   ├── api.js             # Centralized fetch client for backend endpoints
│   │   ├── charts.js          # Dynamic Chart.js builders with dark/light themes
│   │   └── app.js             # Dashboard tab routing, CRUD modals, and event handlers
│   ├── dashboard.html         # 4-tab Business Analytics & Database dashboard
│   └── index.html             # Corporate landing page & technology showcase
├── routes/
│   ├── crudRoutes.js          # /api/db/:table endpoints (GET, POST, PUT, DELETE)
│   ├── descriptiveRoutes.js   # /api/descriptive/summary endpoint
│   ├── predictiveRoutes.js    # /api/predictive/estimate endpoint
│   └── prescriptiveRoutes.js  # /api/prescriptive/optimize endpoint
├── services/
│   ├── optimizationService.js # Transportation LP algorithm & allocation solver
│   └── regressionService.js   # OLS statistical model & parameters
├── package.json               # Project manifest and npm scripts
├── server.js                  # Express application entry point
├── START_APP.bat              # One-click Windows startup batch script
└── README.md                  # Project documentation
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
Ensure **Node.js** (v18.0.0 or higher) is installed on your machine.
Verify with:
```bash
node -v
```

### 2. Clone Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd titanmotor-logistics-analytics
```

### 3. Install Dependencies
```bash
npm install
```

### 4. (Optional) Re-Seed Database
The pre-seeded SQLite database is already bundled in `data/titanmotor_logistics.db`. If you wish to reset or re-populate with fresh randomized data:
```bash
npm run seed
```

### 5. Launch the Application
```bash
npm start
```
Or on Windows, simply double-click **`START_APP.bat`**.

Open your browser and navigate to:
- **Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Analytics Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 📊 Analytics Methodology Details

### Tier 1: Descriptive Analytics
Computes aggregate metrics from 120 historical shipment dispatches:
- Total Freight Spend, Average Cost per Dispatch, Average Transit Days, and Lane Delay Bottleneck Percentages.
- Cross-tabulated distribution across 5 destination hubs and 5 logistics carriers.

### Tier 2: Predictive Analytics (Multiple Linear Regression)
$$
\text{Freight Cost} = \left( 185.40 + 0.078 \times \text{CargoWeight (kg)} + 1.12 \times \text{Distance (km)} \right) \times \text{CarrierFactor} + \text{HandlingFee}
$$
- **Model Fit ($R^2$):** $0.924$
- **Mean Absolute Error (MAE):** $\pm \$46.80\text{ USD}$
- **Predictive Inputs:** Origin Warehouse, Customer Destination Hub, Motor Product Type (Unit Weight), Order Quantity, and Logistics Carrier.

### Tier 3: Prescriptive Analytics (Linear Programming Transportation Problem)
Formulated as:
$$
\min Z = \sum_{i=1}^{m} \sum_{j=1}^{n} c_{ij} x_{ij}
$$
Subject to:
$$
\sum_{j=1}^{n} x_{ij} \le S_i \quad \forall i \in \{1 \dots m\} \quad \text{(Warehouse Supply Constraints)}
$$
$$
\sum_{i=1}^{m} x_{ij} \ge D_j \quad \forall j \in \{1 \dots n\} \quad \text{(Customer Hub Demand Constraints)}
$$
$$
x_{ij} \ge 0 \quad \forall i, j
$$

- Solves for the global cost minimum, reducing shipping expenditure from the unoptimized baseline of **\$84,520.00** down to **\$70,840.00**, producing **\$13,680.00 (16.2%)** in direct bottom-line savings.

---

## 🌐 Free Online Deployment Guide (Render, Railway, Fly.io)

This project has **zero external binary dependencies** and uses pure JavaScript with native SQLite, making it 100% compatible with free cloud platforms:

### Deploying to [Render.com](https://render.com) (Free Web Service)
1. Push your repository to GitHub.
2. Log in to Render and click **New +** &rarr; **Web Service**.
3. Select your GitHub repository `FBA---Final-Project`.
4. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables** (optional):
   - `ADMIN_USERNAME`: your custom admin username (defaults to `admin`)
   - `ADMIN_PASSWORD`: your secure password (defaults to `admin123`)
   - `SESSION_SECRET`: a random long string for cryptographic signing
6. Click **Deploy Web Service** &mdash; your app will be live with free automatic HTTPS!

---

## 📜 License
This project was developed for educational and academic assessment purposes under the ISC License.
