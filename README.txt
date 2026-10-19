PERSONAL EXPENSE TRACKER & BUDGET PLANNER
==========================================

PROJECT DESCRIPTION
-------------------
Personal Expense Tracker & Budget Planner is a web-based application
that helps users manage their personal income, expenses and monthly
budget in an organized way.

FEATURES
--------
1. User Registration
2. User Login
3. Dashboard
4. Set Monthly Budget
5. Add Income
6. Add Expenses
7. Expense Categories
8. Calculate Total Income
9. Calculate Total Expenses
10. Calculate Remaining Budget
11. Transaction History
12. Search Transactions
13. Delete Transactions
14. Expense Analysis Chart
15. Logout

TECHNOLOGIES USED
-----------------
Frontend: HTML5, CSS3, JavaScript, Chart.js
Backend:  Node.js, Express.js
Database: MySQL
Security: bcrypt (password hashing)

PROJECT FILES
-------------
server.js       - Backend server, API routes and MySQL connection
database.sql    - MySQL script to create the database and tables
index.html      - Login page
login.js        - Login functionality
register.html   - Registration page
register.js     - Registration functionality
dashboard.html  - Main dashboard
dashboard.js    - Budget, income, expense, search, delete and chart
style.css       - Website styling
package.json    - Project dependencies
README.txt      - Project information

REQUIREMENTS
------------
1. Node.js (https://nodejs.org)
2. MySQL Server and MySQL Workbench

HOW TO RUN
----------
1. Open MySQL Workbench and run the database.sql script. This creates
   the expense_tracker database with the users, transactions and
   budgets tables.
2. In server.js, set your MySQL root password in the "password" field.
3. Open Command Prompt in the project folder and run:
   npm install
4. Start the server:
   node server.js
5. You should see: Server is running: http://localhost:3000
6. Open your browser and go to: http://localhost:3000
   (Do not open dashboard.html by double-clicking it.)

HOW TO USE
----------
1. Register a new account.
2. Login using the registered email and password.
3. Set your monthly budget.
4. Add your income details.
5. Add your expenses with category and date.
6. Check total income, total expenses and remaining budget.
7. View transactions and expense analysis.
8. Delete transactions when required.
9. Logout after completing the session.

PROJECT OBJECTIVE
-----------------
The main objective of this project is to provide a simple and
user-friendly system for tracking personal expenses and managing
monthly budgets.

DATA STORAGE
------------
All user, budget, income and expense data is stored in a MySQL
database. The browser's Local Storage is used only to keep the
login session (logged-in status, user ID and email).

NOTE
----
This project is developed for academic/NTCC purposes.