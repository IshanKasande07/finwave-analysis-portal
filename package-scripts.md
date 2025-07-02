
# Running StockInsight Pro

Since I cannot modify the package.json file directly, here's how to run the complete application:

## Option 1: Two Terminal Setup

### Terminal 1 - Frontend (Lovable/Vite)
```bash
npm run dev
```
This starts the React frontend on http://localhost:8080

### Terminal 2 - Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
This starts the Flask backend on http://localhost:5000

## Option 2: Using Concurrently (Recommended)

If you want to run both with one command, you can:

1. Install concurrently globally:
```bash
npm install -g concurrently
```

2. Run both servers:
```bash
concurrently "npm run dev" "cd backend && python app.py"
```

## Frontend Features
- Modern React interface with Tailwind CSS
- Three main analysis tools:
  - News Analysis
  - Price Prediction
  - Sentiment Analysis
- Portfolio Playground
- Live news feed
- Responsive design with dark theme

## Backend Features
- RESTful API with Flask
- Real-time stock data via yfinance
- News sentiment analysis
- Portfolio management
- CORS enabled for frontend integration

## API Integration
The frontend is pre-configured to work with the Flask backend. Simply ensure both servers are running and the application will work seamlessly.

## Production Deployment
- Frontend: Deploy to Vercel, Netlify, or similar
- Backend: Deploy to Heroku, Railway, or similar
- Update API URLs in frontend for production
