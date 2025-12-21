# EventTicketing
Sambhav Event Ticketing System
This is a full-stack web application designed for the Sambhav youth community to manage event registrations, payment processing, and digital ticket validation for their flagship event, InspireX.

🚀 Features
Public Landing Page: A responsive event website featuring an interactive countdown timer, event details, and social media integration.

Secure Ticketing: Individual ticket generation with unique IDs for every attendee.

Payment Integration: Seamless payment processing using the Razorpay API, supporting both paid and free event tiers.

Automated Emailing: Automatic delivery of digital tickets to attendees upon successful payment verification.

Admin Dashboard: A protected area for organizers to view all bookings and manage event logistics.

Two-Day Check-in System: A validation API that allows staff to check in attendees separately for Day 1 and Day 2 of the event.

Database Management: Robust data storage using MongoDB for transactions and ticket records.

🛠️ Tech Stack
Backend: Node.js with Express.js

Frontend: HTML5, CSS3, JavaScript (Vanilla), and Particles.js for visual effects

Database: MongoDB

Payments: Razorpay SDK

Email: SendGrid (via @sendgrid/mail)

Security: express-session for admin authentication and crypto for payment signature verification

Utilities: uuid for unique identifiers, qrcode for ticket validation, and pdf-lib for document generation

📂 Project Structure
server.js: The main entry point containing API routes for login, order creation, payment verification, and ticket validation.

database.js: Handles the connection logic and initialization for MongoDB.

email.js: Contains the logic for sending automated ticket emails to users.

/public: Contains the frontend assets, including:

index.html: The main landing page for InspireX.

login.html & register.html: User and admin authentication pages.

admin.html: The dashboard for event administrators.

/js & /css: Client-side logic and styling.

⚙️ Setup and Installation
Clone the repository

Install dependencies:

Bash

npm install
Environment Variables: Create a .env file in the root directory with the following keys:

PORT: Port number for the server.

MONGODB_URI: Your MongoDB connection string.

RAZORPAY_KEY_ID: Your Razorpay API Key.

RAZORPAY_KEY_SECRET: Your Razorpay Secret.

SESSION_SECRET: A secret string for session encryption.

Start the server:

Bash

npm start
🔒 Admin Access
The system includes pre-defined admin credentials for authorized team members (e.g., Shiva, Vikram, Sanika, etc.) to access the /admin dashboard and validate tickets.

📄 License
© 2025 SAMBHAV. All Rights Reserved.
