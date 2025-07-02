
# StockInsight Pro Backend

This is the Flask backend for the StockInsight Pro application, providing APIs for stock analysis, news sentiment, and portfolio management.

## Setup Instructions

1. **Install Python 3.8+** (if not already installed)

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up API Keys** (optional but recommended):
   - Get a free API key from [NewsAPI](https://newsapi.org/)
   - Get a free API key from [Finnhub](https://finnhub.io/)
   - Replace the placeholder keys in `app.py`:
     ```python
     NEWS_API_KEY = "your-newsapi-key-here"
     FINNHUB_API_KEY = "your-finnhub-key-here"
     ```

5. **Run the Flask application**:
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### News Analysis
- **POST** `/api/news-analysis`
  - Body: `{"stock_name": "Tesla"}`
  - Returns sentiment analysis of recent news

### Price Analysis
- **POST** `/api/price-analysis`
  - Body: `{"stock_symbol": "TSLA"}`
  - Returns stock price prediction and technical analysis

### Sentiment Analysis
- **POST** `/api/sentiment-analysis`
  - Body: `{"stock_name": "Tesla"}`
  - Returns social media sentiment analysis

### Portfolio Management
- **POST** `/api/portfolio/add-stock`
  - Body: `{"ticker": "AAPL", "quantity": 10}`
  - Returns stock price and total cost

- **GET** `/api/portfolio/get-price/<ticker>`
  - Returns current stock price

### Live News
- **GET** `/api/news/live`
  - Returns latest financial news with sentiment

### Health Check
- **GET** `/api/health`
  - Returns API status

## Features

- **Real-time Stock Data**: Uses yfinance for live stock prices
- **News Sentiment Analysis**: Analyzes financial news sentiment
- **Social Media Sentiment**: Mock social media sentiment analysis
- **Portfolio Simulation**: Virtual portfolio with $10,000 starting cash
- **Historical Analysis**: 5-year historical stock data analysis
- **CORS Enabled**: Ready for frontend integration

## Notes

- The sentiment analysis uses simple keyword-based analysis
- For production, replace with actual AI models (FinBERT, BART)
- Social media analysis is currently mocked - integrate with Reddit/Twitter APIs
- Rate limiting should be implemented for production use
