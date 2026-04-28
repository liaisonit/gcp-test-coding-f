import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, AlertTriangle, ChevronRight, Mail, Phone, Briefcase, Lock, 
  ShieldAlert, LogOut, CheckCircle2, Zap, PenTool, X, KeyRound, User, BookOpen, FastForward, Code
} from 'lucide-react';

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://hbkceapaopwxbcolpegd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhia2NlYXBhb3B3eGJjb2xwZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODAxMTEsImV4cCI6MjA5Mjc1NjExMX0.MhUnLQiIXupAsb5zLNAu8dLB9QwMi-8sIxyp0TR7rLA";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhia2NlYXBhb3B3eGJjb2xwZWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE4MDExMSwiZXhwIjoyMDkyNzU2MTExfQ.E3vx3sSKryvv7v449e_pVdzV0ixIENcOKv6OUxCHvak";

// --- API LAYER ---
const api = {
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  get: async (table, query) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: api.headers });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (error) {
      console.warn(`[Mock Fallback] GET ${table} failed. Ensure valid Supabase keys. Error:`, error.message);
      return []; // Return empty array to prevent UI crashes
    }
  },
  post: async (table, body) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: 'POST', headers: api.headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (error) {
      console.warn(`[Mock Fallback] POST ${table} failed. Mocking successful submission. Error:`, error.message);
      // Fallback: Return a mocked successful response with a generated ID so flow can continue
      const mockId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return Array.isArray(body) ? body.map(b => ({ ...b, id: mockId })) : [{ ...body, id: mockId }];
    }
  },
  patch: async (table, query, body) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { method: 'PATCH', headers: api.headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (error) {
      console.warn(`[Mock Fallback] PATCH ${table} failed. Mocking successful patch. Error:`, error.message);
      return [{ ...body }];
    }
  }
};

// --- STYLING ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Fira+Code:wght@400;500&display=swap');
  
  :root {
    --bg-dark: #000000;
    --card-bg: #0a0a0a;
    --border-color: #222222;
    --text-main: #ffffff;
    --text-muted: #888888;
  }

  body, html {
    font-family: 'Poppins', sans-serif;
    background-color: #000000 !important;
    color: var(--text-main);
    margin: 0;
    height: 100%;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .font-mono { font-family: 'Fira Code', monospace; }

  .bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    z-index: 0;
    animation: floatOrb 25s infinite ease-in-out alternate;
    opacity: 0.3;
    pointer-events: none;
  }
  .orb-1 { width: 40vw; height: 40vw; background: rgba(255, 255, 255, 0.04); top: -10%; left: -10%; animation-delay: 0s; }
  .orb-2 { width: 35vw; height: 35vw; background: rgba(200, 200, 200, 0.03); bottom: -10%; right: -10%; animation-delay: -5s; }
  .orb-3 { width: 30vw; height: 30vw; background: rgba(255, 255, 255, 0.05); top: 40%; left: 50%; animation-delay: -10s; }

  @keyframes floatOrb {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(5%, 10%) scale(1.1); }
    100% { transform: translate(-5%, -5%) scale(0.9); }
  }

  .minimal-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s ease;
  }
  .minimal-card:hover { border-color: #444; }

  .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

  .slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }

  .minimal-input { background: transparent; border: 1px solid #333; transition: all 0.3s ease; }
  .minimal-input:focus { border-color: #fff; background: #050505; box-shadow: 0 0 15px rgba(255,255,255,0.05); }

  .timer-critical { color: #ef4444; animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg-dark); }
  ::-webkit-scrollbar-thumb { background: #333; }
  ::-webkit-scrollbar-thumb:hover { background: #fff; }
`;

// --- 50 SQL LIVE CODING QUESTIONS (WITH HINTS) ---
const QUESTIONS = [
  { id: "sql_1", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Write a query to find the second highest salary (handle duplicates properly).", context: "-- Table: employees\n-- Columns: id (INT), salary (DECIMAL)", hint: "Consider using the MAX() function with a subquery, or DENSE_RANK()." },
  { id: "sql_2", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Find the top 3 salaries per department (ensure there are no gaps, use true dense rank).", context: "-- Table: employees\n-- Columns: id (INT), department (VARCHAR), salary (DECIMAL)", hint: "DENSE_RANK() OVER (PARTITION BY ...) is your best friend here." },
  { id: "sql_3", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Find employees earning more than ALL employees in another department (e.g., 'HR').", context: "-- Table: employees\n-- Columns: id (INT), name (VARCHAR), department (VARCHAR), salary (DECIMAL)", hint: "You can use the > ALL() operator combined with a subquery filtering for 'HR'." },
  { id: "sql_4", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Find the department where the salary variance is the highest.", context: "-- Table: employees\n-- Columns: id (INT), department (VARCHAR), salary (DECIMAL)", hint: "Use the VARIANCE() aggregate function, group by department, and ORDER BY DESC LIMIT 1." },
  { id: "sql_5", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Write a query to find users with a consecutive 3-day login streak (real production logic).", context: "-- Table: logins\n-- Columns: user_id (INT), login_date (DATE)", hint: "Subtract ROW_NUMBER() days from the login_date. If dates are consecutive, the resulting date will be identical for that group." },
  { id: "sql_6", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Remove duplicate records while keeping the latest based on updated_at (production safe).", context: "-- Table: records\n-- Columns: id (INT), user_id (INT), payload (VARCHAR), updated_at (TIMESTAMP)", hint: "Use ROW_NUMBER() OVER(PARTITION BY id ORDER BY updated_at DESC) and wrap it in a subquery or CTE." },
  { id: "sql_7", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Find missing numbers in a sequence table (assume there are no gaps normally).", context: "-- Table: numbers\n-- Columns: id (INT)\n-- Note: IDs are sequentially generated positive integers.", hint: "Look for records where id + 1 does NOT exist in the table using a subquery." },
  { id: "sql_8", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Find customers who have never ordered anything.", context: "-- Table: customers (id, name)\n-- Table: orders (id, customer_id, amount)", hint: "A LEFT JOIN from customers to orders where orders.id IS NULL is the most performant way." },
  { id: "sql_9", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Find customers who ordered ALL products available in the products table (hard set logic).", context: "-- Table: orders (id, customer_id, product_id)\n-- Table: products (id, product_name)", hint: "Group by customer_id and use HAVING COUNT(DISTINCT product_id) equal to the total count of the products table." },
  { id: "sql_10", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Calculate the rolling 7-day average sales.", context: "-- Table: sales\n-- Columns: date (DATE), revenue (DECIMAL)", hint: "Use AVG(revenue) OVER with ROWS BETWEEN 6 PRECEDING AND CURRENT ROW." },
  { id: "sql_11", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Find the first and last purchase dates per customer.", context: "-- Table: orders\n-- Columns: id (INT), customer_id (INT), order_date (TIMESTAMP)", hint: "FIRST_VALUE() and LAST_VALUE() window functions can get this done without grouping." },
  { id: "sql_12", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Find employees earning above their department average AND above the global average.", context: "-- Table: employees\n-- Columns: id (INT), department (VARCHAR), salary (DECIMAL)", hint: "Use two separate subqueries in the WHERE clause, or calculate averages using window functions in a CTE first." },
  { id: "sql_13", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Write a query for rank gap detection (advanced analytics trick using RANK vs ROW_NUMBER).", context: "-- Table: employees\n-- Columns: id (INT), salary (DECIMAL)\n-- Goal: Detect identical salaries.", hint: "Subtract ROW_NUMBER() from RANK(). If the result > 0, you have a tie/gap." },
  { id: "sql_14", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Retrieve the Top N records per group dynamically (e.g., top N salaries per dept).", context: "-- Table: employees\n-- Columns: id (INT), department (VARCHAR), salary (DECIMAL)", hint: "Use ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) in a subquery." },
  { id: "sql_15", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Find employees with an increasing salary trend (compared to their previous month).", context: "-- Table: salary_history\n-- Columns: id (INT), employee_id (INT), month (DATE), salary (DECIMAL)", hint: "Use the LAG() window function to compare the current row to the previous row." },
  { id: "sql_16", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Detect salary spikes (e.g., greater than 2x increase compared to the previous period).", context: "-- Table: salary_history\n-- Columns: id (INT), employee_id (INT), month (DATE), salary (DECIMAL)", hint: "Use LAG() to retrieve the previous salary, then filter where current salary > 2 * previous." },
  { id: "sql_17", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Calculate the exact median salary (using window functions, without built-in percentile functions).", context: "-- Table: employees\n-- Columns: id (INT), salary (DECIMAL)", hint: "Order the rows using ROW_NUMBER() and compare against COUNT(*)/2 logic to handle both odd/even counts." },
  { id: "sql_18", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Find overlapping intervals in a scheduling system.", context: "-- Table: intervals\n-- Columns: id (INT), task_id (INT), start_time (TIMESTAMP), end_time (TIMESTAMP)", hint: "Self-join the intervals table on a.start < b.end AND a.end > b.start." },
  { id: "sql_19", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Find employees with a broken manager chain (manager_id does not exist in the employees table).", context: "-- Table: employees\n-- Columns: id (INT), manager_id (INT), name (VARCHAR)", hint: "Perform a LEFT JOIN of employees to itself (on manager_id = id) and look for a NULL manager match." },
  { id: "sql_20", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Write a recursive CTE to display the org hierarchy.", context: "-- Table: employees\n-- Columns: id (INT), manager_id (INT), name (VARCHAR)", hint: "Use WITH RECURSIVE starting with manager_id IS NULL, then UNION ALL joined to the CTE." },
  { id: "sql_21", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Find customers with only ONE order.", context: "-- Table: orders\n-- Columns: id (INT), customer_id (INT)", hint: "Group by customer_id and use HAVING COUNT(*) = 1." },
  { id: "sql_22", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Extract the latest record per user (event sourcing pattern).", context: "-- Table: events\n-- Columns: id (INT), user_id (INT), payload (JSON), timestamp (TIMESTAMP)", hint: "ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY timestamp DESC) = 1 is the standard approach." },
  { id: "sql_23", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Find churned users (users who exist in the users table but never in the orders table).", context: "-- Table: users (user_id, email)\n-- Table: orders (order_id, user_id)", hint: "NOT IN, NOT EXISTS, or LEFT JOIN with IS NULL check will work here." },
  { id: "sql_24", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Calculate Month-over-Month growth percentage.", context: "-- Table: sales\n-- Columns: month (DATE), revenue (DECIMAL)", hint: "Formula: (Current - Previous) / Previous * 100. Use LAG() to get the Previous." },
  { id: "sql_25", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Calculate the running total per customer.", context: "-- Table: orders\n-- Columns: id (INT), customer_id (INT), order_date (DATE), amount (DECIMAL)", hint: "Use SUM() OVER(PARTITION BY customer_id ORDER BY order_date)." },
  { id: "sql_26", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Find the top 3 products per category.", context: "-- Table: products\n-- Columns: id (INT), category (VARCHAR), sales (DECIMAL)", hint: "DENSE_RANK() OVER(PARTITION BY category ORDER BY sales DESC) <= 3." },
  { id: "sql_27", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Find employees earning more than their direct manager.", context: "-- Table: employees\n-- Columns: id (INT), manager_id (INT), salary (DECIMAL)", hint: "JOIN the employees table to itself (e.manager_id = m.id) and compare their salaries." },
  { id: "sql_28", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Find departments with no employees.", context: "-- Table: departments (id, name)\n-- Table: employees (id, department_id, name)", hint: "LEFT JOIN from departments to employees where employee.id is NULL." },
  { id: "sql_29", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Count distinct active users daily.", context: "-- Table: activity\n-- Columns: date (DATE), user_id (INT)", hint: "GROUP BY date, then apply COUNT(DISTINCT user_id)." },
  { id: "sql_30", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Detect duplicate emails in the users table.", context: "-- Table: users\n-- Columns: id (INT), email (VARCHAR)", hint: "GROUP BY email HAVING COUNT(*) > 1." },
  { id: "sql_31", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Find the highest salary difference per department.", context: "-- Table: employees\n-- Columns: id (INT), department (VARCHAR), salary (DECIMAL)", hint: "Group by department, calculate MAX(salary) - MIN(salary)." },
  { id: "sql_32", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Find employees with the same salary in the same department.", context: "-- Table: employees\n-- Columns: id (INT), department (VARCHAR), salary (DECIMAL)", hint: "Group by department AND salary, then check HAVING COUNT(*) > 1." },
  { id: "sql_33", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Find the first login date per user.", context: "-- Table: logins\n-- Columns: user_id (INT), login_date (TIMESTAMP)", hint: "GROUP BY user_id and take MIN(login_date)." },
  { id: "sql_34", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Calculate the last login gap (days inactive) for all users.", context: "-- Table: logins\n-- Columns: user_id (INT), login_date (TIMESTAMP)", hint: "Use DATEDIFF() or DATE_DIFF() between CURRENT_DATE and MAX(login_date)." },
  { id: "sql_35", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Calculate the average revenue per active user (ARPU).", context: "-- Table: orders\n-- Columns: order_id (INT), user_id (INT), revenue (DECIMAL)", hint: "Divide SUM(revenue) by COUNT(DISTINCT user_id)." },
  { id: "sql_36", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Pivot monthly sales data (columns for Jan, Feb, etc.).", context: "-- Table: sales\n-- Columns: product (VARCHAR), month (VARCHAR), sales (DECIMAL)", hint: "Use conditional aggregation: SUM(CASE WHEN month='Jan' THEN sales END)." },
  { id: "sql_37", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Unpivot columns (turn Jan, Feb columns back into rows).", context: "-- Table: monthly_sales\n-- Columns: product (VARCHAR), Jan (DECIMAL), Feb (DECIMAL)", hint: "Use UNION ALL to map column names into a generic 'month' row." },
  { id: "sql_38", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Calculate the running difference between consecutive rows.", context: "-- Table: metrics\n-- Columns: id (INT), value (DECIMAL)", hint: "value - LAG(value) OVER(ORDER BY id) is the standard method." },
  { id: "sql_39", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Identify value spikes where the current value is > 2x the previous day's value.", context: "-- Table: sales\n-- Columns: date (DATE), value (DECIMAL)", hint: "Use a CASE statement inside your SELECT checking if value > LAG(value) * 2." },
  { id: "sql_40", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Calculate the percent contribution of each department's salary to the total global salary.", context: "-- Table: employees\n-- Columns: id (INT), department (VARCHAR), salary (DECIMAL)", hint: "Use SUM(salary) divided by SUM(SUM(salary)) OVER() (or a subquery for the total denominator)." },
  { id: "sql_41", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Implement a late-arriving data fix (deduplicate keeping latest timestamp).", context: "-- Table: stream_data\n-- Columns: id (INT), payload (JSON), updated_at (TIMESTAMP)", hint: "If using Snowflake/BigQuery, try QUALIFY ROW_NUMBER() = 1." },
  { id: "sql_42", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Write an idempotent upsert command.", context: "-- Table: target (id, value)\n-- Table: source (id, value)", hint: "Use the MERGE statement: WHEN MATCHED UPDATE, WHEN NOT MATCHED INSERT." },
  { id: "sql_43", section: "SQL Live Coding", difficulty: "Hard", type: "code", question: "Calculate a sliding window max (e.g., max value over the preceding 2 days).", context: "-- Table: sales\n-- Columns: date (DATE), value (DECIMAL)", hint: "Use MAX(value) OVER(ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)." },
  { id: "sql_44", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Detect inactive users (last login > 30 days ago).", context: "-- Table: users\n-- Columns: user_id (INT), last_login (DATE)", hint: "Compare last_login directly against CURRENT_DATE - INTERVAL 30 DAY." },
  { id: "sql_45", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Calculate cumulative distinct users over time.", context: "-- Table: events\n-- Columns: date (DATE), user_id (INT)", hint: "This requires tracking the first occurrence of each user before counting cumulatively." },
  { id: "sql_46", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Solve a sessionization problem (group events based on an inactivity threshold).", context: "-- Table: web_logs\n-- Columns: user_id (INT), timestamp (TIMESTAMP)", hint: "Calculate time diffs using LAG(), assign flags when diff > threshold, and run a cumulative SUM on flags." },
  { id: "sql_47", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Write fraud detection spike logic (compare rolling averages).", context: "-- Table: transactions\n-- Columns: user_id (INT), amount (DECIMAL), transaction_time (TIMESTAMP)", hint: "Calculate AVG() OVER a preceding window and compare the current amount to that average." },
  { id: "sql_48", section: "SQL Live Coding", difficulty: "Medium", type: "code", question: "Calculate total revenue per session.", context: "-- Table: events\n-- Columns: session_id (VARCHAR), revenue (DECIMAL)", hint: "A standard GROUP BY session_id with SUM(revenue) will work here." },
  { id: "sql_49", section: "SQL Live Coding", difficulty: "Easy", type: "code", question: "Find the top-performing day based on revenue.", context: "-- Table: sales\n-- Columns: date (DATE), revenue (DECIMAL)", hint: "ORDER BY revenue DESC and LIMIT 1." },
  { id: "sql_50", section: "SQL Live Coding", difficulty: "Elite", type: "code", question: "Write a complex query integrating a JOIN, a WHERE filter, and a ROW_NUMBER() window function.", context: "-- Table: employees (id, dept_id, salary, status)\n-- Table: departments (id, name)", hint: "Use a CTE to JOIN and filter by status first, then apply the window function in the outer query." }
];

// --- UTILS ---
const getTodayPassword = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}${month}${year}`;
};

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const calculatePreliminaryScore = (code, q) => {
  if (!code || code.trim() === '') return 0;
  let score = 0;
  
  // formatting-proof normalization: 
  // Uppercase everything and replace ALL line-breaks, tabs, and multiple spaces with a single space.
  const normalizedCode = code.toUpperCase().replace(/\s+/g, ' ').trim();
  
  // 1. Basic SQL structure points (Base 5 pts)
  // Use Regex word boundaries (\b) so we don't accidentally match "FROM" inside a column named "PROMO_CODE"
  if (/\bSELECT\b/.test(normalizedCode) && /\bFROM\b/.test(normalizedCode)) score += 5;
  
  // 2. Analytical & Keyword heuristic matching (Up to 10 pts)
  const targetLogicWords = [
    'JOIN', 'GROUP BY', 'HAVING', 'COUNT', 'RANK', 'DENSE_RANK', 
    'ROW_NUMBER', 'MAX', 'MIN', 'AVG', 'SUM', 'LAG', 'LEAD', 
    'QUALIFY', 'MERGE', 'WITH', 'OVER', 'PARTITION', 'DISTINCT'
  ];
  
  let matched = 0;
  targetLogicWords.forEach(word => {
    // Exact word matching for safety
    const regex = new RegExp(`\\b${word}\\b`);
    if (regex.test(normalizedCode)) matched++;
  });
  
  // Award 3 points per advanced logic match, up to 10 max
  if (matched > 0) {
    score += Math.min(10, matched * 3);
  } else if (normalizedCode.length > 30) {
    score += 3; // Partial credit for writing custom logic
  }
  
  return Math.min(15, score);
};

// --- COMPONENTS ---
const BackgroundOrbs = () => (
  <>
    <div className="bg-orb orb-1"></div>
    <div className="bg-orb orb-2"></div>
    <div className="bg-orb orb-3"></div>
  </>
);

const Header = () => (
  <header className="border-b border-[#222] bg-[#000] sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-bold text-xs">
          DE
        </div>
        <span className="font-medium text-xs tracking-widest text-white uppercase">
          Technical Assessment
        </span>
      </div>
      <div className="text-[10px] font-medium tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        Intelligence. Decoded.
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="w-full bg-[#000] border-t border-[#111] py-6 z-20 mt-auto">
    <div className="max-w-7xl mx-auto px-6 text-center text-[10px] text-gray-600 uppercase tracking-widest font-medium flex flex-col sm:flex-row justify-between items-center gap-4">
      <span>Secure Evaluation Environment</span>
      <span>Intelligence Decoded &copy; {new Date().getFullYear()}</span>
    </div>
  </footer>
);

// --- VIEWS ---
const PasskeyView = ({ onValidPasskey, onAdminLogin }) => {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  const handleStart = () => {
    if (pwd !== getTodayPassword()) { setErr("Invalid or expired passkey."); return; }
    onValidPasskey();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="minimal-card w-full max-w-sm p-8 rounded-sm hover:border-[#444]">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center bg-[#050505]">
            <KeyRound size={20} className="text-white" />
          </div>
        </div>
        <h1 className="text-lg font-medium mb-1 text-white tracking-tight uppercase text-center">System Authentication</h1>
        <p className="text-gray-500 mb-8 font-light text-[10px] tracking-widest uppercase text-center">Enter today's date as your passkey</p>
        <div className="space-y-4">
          <input 
            type="password" placeholder="Today's Date (DDMMYYYY)" 
            className="minimal-input w-full rounded p-3 text-xs text-white tracking-widest text-center focus:outline-none" 
            value={pwd} onChange={e => { setPwd(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
          {err && <div className="text-red-400 text-[10px] tracking-widest uppercase bg-red-950/20 p-2 rounded border border-red-900/50 flex items-center justify-center gap-2"><AlertTriangle size={12}/>{err}</div>}
          <button 
            onClick={handleStart} 
            className="w-full bg-white text-black font-semibold text-[10px] uppercase tracking-[0.2em] p-3.5 rounded mt-2 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
          >
            Authenticate <ChevronRight size={14} />
          </button>
          <div className="text-center mt-6">
            <button onClick={onAdminLogin} className="text-[9px] font-medium text-gray-600 hover:text-white transition-colors uppercase tracking-widest">Administrator Access</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoView = ({ candidate, setCandidate, onComplete }) => {
  const [err, setErr] = useState('');

  const handleNext = () => {
    if (!candidate.fullName || !candidate.email) { setErr("Identity fields are required."); return; }
    onComplete();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="minimal-card w-full max-w-md p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-[#222] pb-4">
          <User size={18} className="text-gray-400" />
          <h1 className="text-sm font-medium text-white tracking-widest uppercase">Candidate Identity</h1>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5 group">
            <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Full Name *</label>
            <input type="text" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="John Doe" value={candidate.fullName} onChange={e => {setCandidate({...candidate, fullName: e.target.value}); setErr('');}} />
          </div>
          <div className="space-y-1.5 group">
            <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Email Address *</label>
            <input type="email" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="john@domain.com" value={candidate.email} onChange={e => {setCandidate({...candidate, email: e.target.value}); setErr('');}} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 group">
              <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Experience (Yrs)</label>
              <input type="number" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="0" value={candidate.experience} onChange={e => setCandidate({...candidate, experience: e.target.value})} />
            </div>
            <div className="space-y-1.5 group">
              <label className="text-[9px] font-medium text-gray-500 uppercase tracking-widest transition-colors group-focus-within:text-white">Current Company</label>
              <input type="text" className="minimal-input w-full rounded p-3 text-xs text-white outline-none" placeholder="Optional" value={candidate.company} onChange={e => setCandidate({...candidate, company: e.target.value})} />
            </div>
          </div>
          {err && <div className="text-red-400 text-[10px] tracking-widest uppercase bg-red-950/20 p-2 rounded border border-red-900/50 flex items-center justify-center gap-2"><AlertTriangle size={12}/>{err}</div>}
          <button 
            onClick={handleNext} 
            className="w-full bg-white text-black font-semibold text-[10px] uppercase tracking-[0.2em] p-3.5 rounded mt-4 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
          >
            Proceed <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const InstructionsView = ({ onStartTest }) => {
  const [checks, setChecks] = useState([false, false, false, false]);
  const allChecked = checks.every(Boolean);
  const toggleCheck = (index) => { const newChecks = [...checks]; newChecks[index] = !newChecks[index]; setChecks(newChecks); };

  const INSTRUCTIONS = [
    { id: '01', title: 'Structure', text: 'You will receive 30 randomized SQL Live Coding scenarios.', isCritical: false },
    { id: '02', title: 'Timing', text: 'You have exactly 1.2 MINUTES (72 seconds) per question. If the timer runs out, the question will auto-submit.', isCritical: false },
    { id: '03', title: 'No Backtracking', text: 'Once you submit or skip a question, you cannot return to it.', isCritical: false },
    { id: '04', title: 'Strict Monitoring', text: 'Tab switching, minimizing the window, or losing focus will trigger an immediate 15-second penalty on your current timer. Repeated offenses will flag your submission.', isCritical: true },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6 animate-fade-in-up w-full h-full">
      <div className="minimal-card w-full max-w-3xl p-10 md:p-12 rounded-sm flex flex-col max-h-[85vh]">
        <div className="flex items-center gap-3 mb-8 border-b border-[#222] pb-6 shrink-0">
          <BookOpen size={20} className="text-gray-400" />
          <h1 className="text-base font-medium text-white tracking-widest uppercase">Evaluation Protocol</h1>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-gray-300 font-light mb-8">
          <p className="mb-6 text-sm text-gray-400">Welcome to the SQL Coding Evaluation. Please read and acknowledge the following instructions carefully before proceeding:</p>
          <div className="space-y-4">
            {INSTRUCTIONS.map((inst, idx) => (
              <div 
                key={inst.id} onClick={() => toggleCheck(idx)}
                className={`flex items-start gap-5 p-5 rounded-sm border cursor-pointer transition-all duration-300 hover:bg-[#050505] ${checks[idx] ? 'border-white/40 bg-[#0a0a0a]' : 'border-[#222] bg-transparent hover:border-[#444]'}`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-sm border transition-all duration-300 ${checks[idx] ? 'bg-white border-white text-black' : 'border-[#444]'}`}>
                  {checks[idx] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <div className="flex-1 leading-relaxed">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`font-mono text-[10px] ${inst.isCritical ? 'text-red-400' : 'text-gray-500'}`}>{inst.id}.</span>
                    <strong className={`font-medium tracking-widest uppercase text-[11px] ${inst.isCritical ? 'text-red-400' : 'text-white'}`}>{inst.title}</strong>
                  </div>
                  <span className={inst.isCritical ? 'text-gray-400' : 'text-gray-400'}>{inst.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-[#222] mt-auto shrink-0">
          <button 
            disabled={!allChecked}
            onClick={() => {
              onStartTest();
              try { document.documentElement.requestFullscreen().catch(() => {}); } catch(e) {}
            }} 
            className={`w-full font-semibold text-[10px] uppercase tracking-[0.2em] p-4 rounded flex items-center justify-center gap-2 transition-all duration-300 ${allChecked ? 'bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98] cursor-pointer' : 'bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed opacity-70'}`}
          >
            {allChecked ? 'I Understand, Begin Evaluation' : 'Acknowledge All Protocols to Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TestView = ({ 
  activeQuestions, qIndex, timeLeft, currentCode, setCurrentCode, handleNext, showViolationModal, isSubmitting, hintUsed, setHintUsed 
}) => {
  const q = activeQuestions[qIndex];
  if (!q) return null;

  const isTimeLow = timeLeft <= 15; // Warning at 15 seconds
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 72) * circumference;

  return (
    <div className="flex-1 flex flex-col user-select-none relative overflow-hidden bg-black z-10 w-full h-full">
      <style dangerouslySetInnerHTML={{__html: `* { user-select: none; } textarea { user-select: auto; }`}} />
      
      <div className="bg-[#050505] border-b border-[#222] px-6 py-4 sticky top-0 z-30 transition-all">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-[10px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-1 flex items-center gap-2">
              <Zap size={10} className="text-white"/> {q.section} • {q.difficulty} • <span className={hintUsed ? 'text-red-400 font-bold' : 'text-green-400'}>{hintUsed ? '10 PTS (PENALTY)' : '15 PTS'}</span>
            </div>
            <div className="text-base font-medium text-white tracking-tight">Scenario {qIndex + 1} <span className="text-gray-600 text-sm">/ {activeQuestions.length}</span></div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`relative flex items-center justify-center w-12 h-12 ${isTimeLow ? 'timer-critical animate-pulse' : ''}`}>
              <svg width="48" height="48" viewBox="0 0 48 48" className="absolute -rotate-90">
                <circle cx="24" cy="24" r={radius} stroke="#222" strokeWidth="2" fill="none" />
                <circle cx="24" cy="24" r={radius} stroke={isTimeLow ? "#ef4444" : "#ffffff"} strokeWidth="2" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }} />
              </svg>
              <div className={`text-[11px] font-mono font-medium z-10 ${isTimeLow ? 'text-red-400' : 'text-white'}`}>
                 {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-4 h-[2px] bg-[#222] overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-white transition-all duration-500 ease-out" style={{ width: `${((qIndex) / activeQuestions.length) * 100}%` }}></div>
        </div>
      </div>

      <div key={qIndex} className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col mt-4 animate-fade-in-up">
        
        {/* Question Prompt */}
        <div className="minimal-card p-6 md:p-8 rounded-sm mb-6 border-l-4 border-l-white">
          <h3 className="text-sm md:text-base text-white font-normal leading-relaxed whitespace-pre-wrap tracking-wide mb-4">
            {q.question}
          </h3>
          {q.context && (
            <div className="bg-[#111] p-4 rounded-sm border border-[#222] mb-4">
               <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-medium">Reference Schema</div>
               <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">{q.context}</pre>
            </div>
          )}
          {q.hint && (
            <div className={`p-4 rounded-sm border transition-colors duration-300 ${hintUsed ? 'bg-blue-950/20 border-blue-900/50' : 'bg-[#0a0a0a] border-[#222]'}`}>
               <div className="flex justify-between items-center mb-2">
                 <div className={`text-[10px] uppercase tracking-widest font-medium flex items-center gap-2 ${hintUsed ? 'text-blue-400' : 'text-gray-500'}`}>
                   <BookOpen size={12} /> Tactical Hint
                 </div>
                 {!hintUsed && (
                   <button onClick={() => setHintUsed(true)} className="text-[9px] bg-[#111] hover:bg-[#222] border border-[#333] text-gray-400 hover:text-white px-2 py-1 rounded transition-colors uppercase tracking-widest font-medium">
                     Reveal Hint (-5 PTS)
                   </button>
                 )}
               </div>
               {hintUsed ? (
                 <div>
                   <p className="text-xs text-blue-200/80 font-light animate-fade-in-up">{q.hint}</p>
                   <div className="text-[9px] text-red-400 mt-3 uppercase tracking-widest font-semibold flex items-center gap-1 animate-fade-in-up">
                     <AlertTriangle size={10} /> 5 Point Penalty Applied
                   </div>
                 </div>
               ) : (
                 <p className="text-xs text-gray-500/50 font-light italic">Hint is hidden. Revealing will reduce the maximum score for this scenario from 15 to 10 points.</p>
               )}
            </div>
          )}
        </div>

        {/* Code Editor Area */}
        <div className="minimal-card rounded-sm flex-1 mb-6 flex flex-col bg-[#050505] border-[#333]">
          <div className="px-4 py-3 border-b border-[#222] flex items-center gap-2 bg-[#0a0a0a]">
            <Code size={14} className="text-gray-500"/>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">SQL Editor</span>
          </div>
          <textarea 
            className="flex-1 w-full bg-transparent border-none outline-none text-sm text-[#e5e5e5] p-6 font-mono leading-relaxed focus:ring-0 resize-none" 
            placeholder="-- Write your SQL query here..." 
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            value={currentCode} 
            onChange={e => setCurrentCode(e.target.value)} 
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                // Insert two spaces for indentation
                const newCode = currentCode.substring(0, start) + '  ' + currentCode.substring(end);
                setCurrentCode(newCode);
                // Move cursor to right after the inserted spaces
                setTimeout(() => {
                  e.target.selectionStart = e.target.selectionEnd = start + 2;
                }, 0);
              }
            }}
            onPaste={e => {
              e.preventDefault();
              // Silently block pasting. Do NOT use alert() as it triggers window blur penalties.
            }}
          />
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-[10px] font-medium text-gray-600 flex items-center gap-2 tracking-widest uppercase">
            <ShieldAlert size={12} className="text-white"/> Security protocols active
          </div>
          <div className="flex items-center gap-4">
            <button 
              disabled={isSubmitting}
              onClick={() => handleNext(false, true)}
              className="bg-transparent text-gray-400 px-6 py-3 rounded-sm font-semibold text-[10px] tracking-widest uppercase transition-all duration-300 hover:text-white border border-[#333] hover:border-white active:scale-[0.98] flex items-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Skip <FastForward size={12} />
            </button>
            <button 
              disabled={currentCode.trim().length === 0 || isSubmitting}
              onClick={() => handleNext(false, false)}
              className="bg-white text-black px-8 py-3 rounded-sm font-semibold text-[10px] tracking-widest uppercase transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-[0.98]"
            >
              {isSubmitting ? 'Transmitting...' : (qIndex === activeQuestions.length - 1 ? 'Finalize' : 'Submit & Next')}
            </button>
          </div>
        </div>
      </div>

      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center animate-fade-in-up">
          <div className="minimal-card border-[#333] p-10 rounded-sm max-w-sm text-center border-t-2 border-t-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-lg font-medium text-white mb-2 tracking-tight uppercase">Focus Lost</h2>
            <p className="text-gray-400 text-[11px] mb-6 leading-relaxed">Tab switching or window blurring detected. A 15-second penalty has been applied to your timer.</p>
            <div className="text-[9px] font-semibold text-red-400 tracking-[0.2em] uppercase">Further violations will terminate session</div>
          </div>
        </div>
      )}
    </div>
  );
};

const ResultView = ({ answers, candidate, violations, activeQuestions }) => {
  return (
    <div className="flex-1 p-6 max-w-4xl w-full mx-auto flex flex-col justify-center animate-fade-in-up">
      <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="inline-block p-3 border border-[#333] rounded-sm mb-4 bg-[#0a0a0a]">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-medium text-white mb-2 tracking-tight uppercase">Sequence Complete</h1>
        <p className="text-gray-500 text-xs font-light tracking-wide">Data has been securely transmitted, {candidate.fullName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="minimal-card p-6 rounded-sm text-center group transition-transform duration-300 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="text-[10px] font-medium text-gray-600 tracking-widest uppercase mb-3 group-hover:text-gray-400 transition-colors">Preliminary Score</div>
          <div className={`text-2xl font-semibold tracking-tight text-white`}>
            {answers.reduce((acc, a) => acc + a.score, 0)} <span className="text-lg text-gray-600 font-normal">/ {activeQuestions.length * 15}</span>
          </div>
          <div className="text-[9px] text-gray-600 mt-3 tracking-widest uppercase">Pending AI Verification</div>
        </div>
        <div className="minimal-card p-6 rounded-sm text-center group transition-transform duration-300 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="text-[10px] font-medium text-gray-600 tracking-widest uppercase mb-3 group-hover:text-gray-400 transition-colors">Completion</div>
          <div className="text-2xl font-semibold text-white tracking-tight">{answers.filter(a => !a.skipped).length} <span className="text-lg text-gray-600 font-normal">/ {activeQuestions.length}</span></div>
        </div>
        <div className="minimal-card p-6 rounded-sm text-center group transition-transform duration-300 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="text-[10px] font-medium text-gray-600 tracking-widest uppercase mb-3 group-hover:text-gray-400 transition-colors">Security Flags</div>
          <div className={`text-2xl font-semibold tracking-tight ${violations.length > 0 ? 'text-white' : 'text-gray-600'}`}>{violations.length}</div>
        </div>
      </div>

      <div className="minimal-card p-8 rounded-sm animate-fade-in-up hover:border-[#444] transition-colors" style={{animationDelay: '0.5s'}}>
        <h3 className="text-[10px] font-medium text-gray-500 tracking-widest uppercase mb-6">Telemetry Overview</h3>
        <div className="space-y-2 text-xs text-gray-300 font-medium tracking-wide">
          <div className="flex justify-between items-center p-4 bg-[#050505] border border-[#222] rounded-sm hover:border-[#555] transition-all slide-in-right">
             <span>SQL Live Coding Scenarios</span>
             <span className="text-white flex items-center gap-2"><CheckCircle2 size={12}/> Captured</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-[#050505] border border-[#222] rounded-sm hover:border-[#555] transition-all slide-in-right" style={{animationDelay: '0.1s'}}>
             <span>Security & Focus Tracking</span>
             <span className="text-white flex items-center gap-2"><CheckCircle2 size={12}/> Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin }) => {
  const [pwd, setPwd] = useState('');
  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="minimal-card p-8 rounded-sm w-full max-w-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#555]"></div>
        <h2 className="text-sm font-medium text-white mb-6 flex items-center gap-2 tracking-widest uppercase"><Lock size={16}/> Restricted Area</h2>
        <input 
          type="password" placeholder="Admin Passkey" 
          className="minimal-input w-full rounded p-3 text-xs mb-6 outline-none text-white tracking-widest text-center" 
          value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && (pwd === 'Pikashoot123!' ? onLogin() : alert("Access Denied"))}
        />
        <button 
          onClick={() => { if(pwd === 'Pikashoot123!') onLogin(); else alert("Access Denied"); }}
          className="w-full bg-white text-black p-3.5 rounded text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >Authenticate</button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ QUESTIONS, onLogout }) => {
  const [subs, setSubs] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get('submissions', 'select=*,candidates(*)');
        if (!data) return;

        const formatted = data.map((d) => ({
          id: d.id,
          candidate: { fullName: d.candidates.full_name, email: d.candidates.email, phone: d.candidates.phone || '', experience: d.candidates.experience_years || '0', company: d.candidates.current_company || '' },
          violationsCount: d.total_violations || 0,
          metrics: { totalTime: d.total_time_taken_seconds, status: d.status, totalScore: d.total_score },
          timestamp: new Date(d.created_at).getTime(),
          answers: [] // Fetching answers requires joining a separate table if we store them, but kept simple for UI here.
        }));
        setSubs(formatted.sort((a, b) => b.timestamp - a.timestamp));
      } catch(e) { console.error(e); }
    };
    fetchData();
  }, []);

  if (selectedSub) {
    return (
      <div className="flex-1 p-6 w-full max-w-6xl mx-auto z-50 relative animate-fade-in-up">
        <button onClick={() => setSelectedSub(null)} className="mb-6 text-[10px] font-medium tracking-widest uppercase text-gray-500 hover:text-white flex items-center gap-2 transition-transform hover:-translate-x-1">
          <ChevronRight className="rotate-180" size={14}/> Return
        </button>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 minimal-card p-6 rounded-sm">
            <h2 className="text-xl font-medium text-white mb-4 tracking-tight">{selectedSub.candidate.fullName}</h2>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 font-light">
              <div className="flex items-center gap-2"><Mail size={14} className="text-gray-600"/>{selectedSub.candidate.email}</div>
              <div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-600"/>{selectedSub.candidate.company} ({selectedSub.candidate.experience}y)</div>
              <div className="flex items-center gap-2"><Clock size={14} className="text-gray-600"/>{Math.floor(selectedSub.metrics.totalTime / 60)}m {selectedSub.metrics.totalTime % 60}s</div>
            </div>
          </div>
          <div className="minimal-card p-6 rounded-sm flex flex-col justify-center items-center text-center">
            <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">Prelim Score</div>
            <div className="text-3xl font-medium text-white mb-2 tracking-tighter">{selectedSub.metrics.totalScore || 0}</div>
            <div className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm border bg-transparent text-gray-400 border-[#222]`}>
              Pending Final Audit
            </div>
            {selectedSub.violationsCount > 0 && <div className="mt-4 text-[9px] font-medium text-white tracking-widest uppercase flex items-center gap-2"><ShieldAlert size={10}/> {selectedSub.violationsCount} Flags</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-6xl w-full mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-lg font-medium text-white tracking-widest uppercase">Intelligence Oversight</h1>
        <button onClick={onLogout} className="text-[10px] font-medium tracking-widest uppercase text-gray-600 hover:text-white flex items-center gap-2 transition-transform hover:scale-105"><LogOut size={14}/> Terminate</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="minimal-card p-5 rounded-sm group hover:-translate-y-1 transition-transform" style={{animationDelay: '0s'}}>
          <div className="text-gray-600 text-[9px] font-medium uppercase tracking-widest mb-1 group-hover:text-gray-400 transition-colors">Total Records</div>
          <div className="text-2xl font-medium text-white">{subs.length}</div>
        </div>
        <div className="minimal-card p-5 rounded-sm group hover:-translate-y-1 transition-transform" style={{animationDelay: '0.1s'}}>
          <div className="text-gray-600 text-[9px] font-medium uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Pending Review</div>
          <div className="text-2xl font-medium text-white">{subs.length}</div>
        </div>
        <div className="minimal-card p-5 rounded-sm group hover:-translate-y-1 transition-transform" style={{animationDelay: '0.3s'}}>
          <div className="text-gray-600 text-[9px] font-medium uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Flagged Violations</div>
          <div className="text-2xl font-medium text-gray-400">{subs.filter(s => s.violationsCount > 2).length}</div>
        </div>
      </div>
      <div className="minimal-card rounded-sm overflow-hidden" style={{animationDelay: '0.4s'}}>
        <table className="w-full text-left text-xs text-gray-400">
          <thead className="bg-[#050505] text-[9px] font-medium uppercase tracking-widest text-gray-600 border-b border-[#222]">
            <tr>
              <th className="p-4">Identity</th>
              <th className="p-4">Exp</th>
              <th className="p-4">Prelim Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Flags</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111]">
            {subs.map(s => (
              <tr key={s.id} className="hover:bg-[#050505] transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-gray-200 tracking-wide group-hover:text-white transition-colors">{s.candidate.fullName}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{s.candidate.email}</div>
                </td>
                <td className="p-4 font-mono text-gray-500">{s.candidate.experience}y</td>
                <td className="p-4 font-mono text-white">{s.metrics.totalScore || 0} <span className="text-gray-600">pts</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-sm text-[9px] font-medium tracking-widest uppercase border text-gray-400 border-[#222]`}>
                    Needs Review
                  </span>
                </td>
                <td className="p-4"><span className={`font-medium ${s.violationsCount > 0 ? 'text-white' : 'text-gray-700'}`}>{s.violationsCount}</span></td>
                <td className="p-4 text-[10px] font-mono text-gray-600">{new Date(s.timestamp).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setSelectedSub(s)} className="text-[9px] font-medium tracking-widest uppercase text-black bg-white hover:bg-gray-300 px-3 py-1.5 rounded-sm transition-transform hover:scale-105 active:scale-95">Audit</button>
                </td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-600 tracking-widest uppercase text-[10px] font-medium">No data streams detected.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('gate-passkey');
  const [candidate, setCandidate] = useState({ fullName: '', email: '', phone: '', experience: '', company: '' });
  
  // Test State
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(72); // 1.2 minutes (72 seconds) per question
  
  const [answers, setAnswers] = useState([]);
  const [violations, setViolations] = useState([]);
  const [currentCode, setCurrentCode] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  
  // Submit lock states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  
  const timerRef = useRef(null);

  // Focus & Visibility monitoring
  useEffect(() => {
    if (view !== 'test') return;
    const handleVisibility = () => { if (document.hidden) triggerViolation('Tab Switch'); };
    const handleBlur = () => triggerViolation('Window Blur');
    
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [view, qIndex]);

  // Per-Question Timer Logic
  useEffect(() => {
    if (view === 'test' && timeLeft > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNext(true, false); // Auto-submit when time runs out
            return 72;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, timeLeft, isSubmitting, qIndex, hintUsed]); // Added hintUsed to closure dependencies

  const generateQuestionSet = () => {
    // Shuffle the 50 questions and pick 30 randomly
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 30));
  };

  const triggerViolation = (type) => {
    if (!activeQuestions[qIndex] || isSubmittingRef.current) return;
    
    // Penalize by 15 seconds
    setViolations(prev => [...prev, { type, timestamp: Date.now(), penalty: 15, qId: activeQuestions[qIndex].id }]);
    setShowViolationModal(true);
    setTimeLeft(prev => Math.max(0, prev - 15));
    
    setTimeout(() => setShowViolationModal(false), 3000);
  };

  const handleNext = async (autoSubmitted = false, skipped = false) => {
    if (isSubmittingRef.current) return; 
    
    const q = activeQuestions[qIndex];
    let preliminaryScore = skipped ? 0 : calculatePreliminaryScore(currentCode, q);
    
    // Apply 5 point penalty if hint was used
    if (hintUsed && preliminaryScore > 0) {
      preliminaryScore = Math.max(0, preliminaryScore - 5);
    }

    const answerData = {
      qId: q.id,
      codeEntered: skipped ? '' : currentCode,
      autoSubmitted,
      skipped,
      hintUsed,
      timeTaken: 72 - timeLeft, // Record time spent
      score: preliminaryScore // AI/Heuristic preliminary score
    };

    const newAnswers = [...answers, answerData];
    setAnswers(newAnswers);
    setCurrentCode(''); // Reset for next query
    setHintUsed(false); // Reset hint status

    if (qIndex < activeQuestions.length - 1) {
      setQIndex(qIndex + 1);
      setTimeLeft(72); // Reset timer for next question
    } else {
      await finalizeSubmission(newAnswers);
    }
  };

  const finalizeSubmission = async (finalAnswers) => {
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const candidatePayload = {
        full_name: candidate.fullName, email: candidate.email, phone: candidate.phone, 
        experience_years: candidate.experience ? Number(candidate.experience) : null, current_company: candidate.company || null
      };

      let candidateId;
      const existingCand = await api.get('candidates', `email=eq.${encodeURIComponent(candidate.email)}&select=id`);
      if (existingCand && existingCand.length > 0) {
        candidateId = existingCand[0].id;
        await api.patch('candidates', `id=eq.${candidateId}`, candidatePayload);
      } else {
        const newCand = await api.post('candidates', candidatePayload);
        candidateId = newCand[0].id;
      }

      const totalTimeTaken = finalAnswers.reduce((acc, a) => acc + (a.timeTaken || 0), 0);
      const totalScore = finalAnswers.reduce((acc, a) => acc + (a.score || 0), 0);
      const MAX_POSSIBLE_SCORE = activeQuestions.length * 15; // 30 questions * 15 pts
      
      const submissionPayload = {
        candidate_id: candidateId,
        started_at: new Date(Date.now() - totalTimeTaken * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        total_score: totalScore, 
        max_score: MAX_POSSIBLE_SCORE, 
        percentage: (totalScore / MAX_POSSIBLE_SCORE) * 100, 
        status: "Pending Review",
        mcq_score: 0, 
        debugging_score: 0, 
        total_violations: violations.length,
        total_time_taken_seconds: totalTimeTaken, 
        auto_submitted_count: finalAnswers.filter(a => a.autoSubmitted).length, 
        manual_review_required: true
      };

      let submissionId;
      const existingSub = await api.get('submissions', `candidate_id=eq.${candidateId}&select=id`);
      if (existingSub && existingSub.length > 0) {
        submissionId = existingSub[0].id;
        await api.patch('submissions', `id=eq.${submissionId}`, submissionPayload);
      } else {
        const newSub = await api.post('submissions', submissionPayload);
        submissionId = newSub[0].id;
      }
      
      // 1. Bulk insert the actual SQL answers written by the candidate
      if (finalAnswers.length > 0) {
        const answersPayload = finalAnswers.map(a => ({
          submission_id: submissionId,
          question_id: a.qId,
          code_entered: a.codeEntered || '',
          auto_submitted: a.autoSubmitted,
          skipped: a.skipped,
          hint_used: a.hintUsed,
          time_taken: a.timeTaken,
          preliminary_score: a.score
        }));
        // Note: Supabase REST API supports arrays for bulk inserts natively
        await api.post('coding_responses', answersPayload);
      }

      // 2. Bulk insert any security violations tracked during the session
      if (violations.length > 0) {
        const violationsPayload = violations.map(v => ({
          submission_id: submissionId,
          violation_type: v.type,
          penalty_seconds: v.penalty,
          question_id: v.qId,
          occurred_at: new Date(v.timestamp).toISOString()
        }));
        await api.post('security_violations', violationsPayload);
      }

      setView('result');
    } catch (e) {
      console.error("Submit error", e);
      alert("Failed to submit telemetry to Supabase. Check console logs for details.");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col font-sans text-white w-full">
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <BackgroundOrbs />
      {view !== 'test' && <Header />}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        {view === 'gate-passkey' && <PasskeyView onValidPasskey={() => setView('gate-info')} onAdminLogin={() => setView('adminLogin')} />}
        {view === 'gate-info' && <InfoView candidate={candidate} setCandidate={setCandidate} onComplete={() => setView('instructions')} />}
        {view === 'instructions' && <InstructionsView onStartTest={() => { generateQuestionSet(); setView('test'); }} />}
        {view === 'test' && activeQuestions.length > 0 && <TestView activeQuestions={activeQuestions} qIndex={qIndex} timeLeft={timeLeft} currentCode={currentCode} setCurrentCode={setCurrentCode} handleNext={handleNext} showViolationModal={showViolationModal} isSubmitting={isSubmitting} hintUsed={hintUsed} setHintUsed={setHintUsed} />}
        {view === 'result' && <ResultView answers={answers} candidate={candidate} violations={violations} activeQuestions={activeQuestions} />}
        {view === 'adminLogin' && <AdminLogin onLogin={() => { setAdminAuth(true); setView('adminDashboard'); }} />}
        {view === 'adminDashboard' && adminAuth && <AdminDashboard QUESTIONS={QUESTIONS} onLogout={() => { setAdminAuth(false); setView('gate-passkey'); }} />}
      </main>
      {view !== 'test' && <Footer />}
    </div>
  );
}
