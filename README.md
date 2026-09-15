Voyage 🌍✈️

Voyage is a modern, intuitive travel companion application designed to simplify itinerary planning, budget tracking, and real-time destination discovery for travelers worldwide.

Features ✨

Interactive Itinerary Builder: Create, organize, and drag-and-drop daily travel plans seamlessly.

Smart Expense Tracker: Split bills, set daily budgets, and track spending across multiple currencies.

Destination Guides: Discover curated local spots, top attractions, and hidden gems.

Offline Mode: Access saved itineraries, documents, and maps without an active internet connection.

Real-time Collaboration: Invite travel partners to plan trips together in real time.

Tech Stack 🛠️

Category	Technology
Frontend	React / React Native, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB
APIs	Google Maps API, OpenExchangeRates API
Authentication	JWT, OAuth 2.0
Getting Started 🚀

Follow these steps to set up Voyage locally on your machine.

Prerequisites

Node.js (v18.0 or higher)

npm or yarn

MongoDB running locally or a MongoDB Atlas URI

Installation Steps

Clone the repository:
git clone https://github.com/your-username/voyage.git
cd voyage

Install dependencies:
cd client
npm install
cd ../server
npm install

Environment Setup:
Create a .env file in the server directory and add:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_MAPS_API_KEY=your_api_key

Run the Application:
In the server folder, run: npm run dev
In a new terminal, in the client folder, run: npm start

Usage 📱

Sign Up / Log In: Create an account or sign in with Google.

Create a Trip: Set your destination, travel dates, and initial budget.

Build Itinerary: Add activities, reservation details, and locations to your daily view.

Track Spending: Log expenses during your trip to stay within budget.

Project Roadmap 🗺️

[x] Basic trip creation and itinerary management

[x] Currency conversion and expense logging

[ ] Push notifications for flight status updates

[ ] AI-driven personalized destination recommendations

Contact 📧

Project Maintainer: @yourusername (email@example.com)

Project Link: https://github.com/your-username/voyage
