from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import requests
import json
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Case-insensitive mapping of company names to stock symbols
COMPANY_TO_TICKER = {
    "tesla": "TSLA",
    "apple": "AAPL",
    "microsoft": "MSFT",
    "amazon": "AMZN",
    "google": "GOOGL"
}

# Mock news data (fallback)
def get_mock_news():
    return [
        {"title": "Mock News 1", "description": "Sample news about financial markets.", "url": "http://example.com"},
        {"title": "Mock News 2", "description": "Another sample news about markets.", "url": "http://example.com"},
    ]

# Validate if a stock symbol is valid using yfinance
def is_valid_ticker(symbol):
    try:
        ticker = yf.Ticker(symbol)
        hist_data = ticker.history(period="1d")
        return not hist_data.empty
    except Exception:
        return False

# Analyze historical stock data using yfinance
def analyze_historical_stock_data(stock_symbol):
    try:
        ticker = yf.Ticker(stock_symbol)
        hist_data = ticker.history(period="1mo", interval="1d")
        if hist_data.empty:
            print(f"{stock_symbol}: No data from yfinance")
            return None
        df = hist_data.astype(float)
        df.index = pd.to_datetime(df.index)
        current_price = df["Close"].iloc[-1]
        volatility = df["Close"].pct_change().std() * 100
        latest_timestamp = df.index[-1].strftime("%Y-%m-%d %H:%M:%S")
        change_percent = ((current_price - df["Close"].iloc[-2]) / df["Close"].iloc[-2] * 100) if len(df) > 1 else 0.0
        print(f"Current price for {stock_symbol} at {latest_timestamp}: ${current_price}, Volatility: {volatility:.2f}%")
        return {
            "stock_symbol": stock_symbol,
            "current_price": current_price,
            "change_percent": change_percent,
            "volatility": volatility,
            "timestamp": latest_timestamp
        }
    except Exception as e:
        print(f"Error analyzing {stock_symbol} with yfinance: {e}")
        return None

# Fetch general financial news using NewsAPI
def fetch_general_news():
    try:
        url = "https://newsapi.org/v2/everything?q=finance&apiKey=068e711e98064895a700fc16902005b6"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok" and data.get("articles"):
            news = [{"title": item["title"], "description": item["description"], "url": item["url"]} for item in data["articles"][:5]]
            print(f"Fetched {len(news)} general financial news items")
            return news
        print(f"No general news data: {data}")
        return get_mock_news()
    except requests.exceptions.HTTPError as e:
        print(f"Error fetching general news: {e}")
        return get_mock_news()
    except Exception as e:
        print(f"Error fetching general news: {e}")
        return get_mock_news()

# Fetch stock news using NewsAPI
def fetch_stock_news(stock_symbol, original_input=None):
    try:
        url = f"https://newsapi.org/v2/everything?q={stock_symbol}&apiKey=068e711e98064895a700fc16902005b6"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok" and data.get("articles"):
            news = [{"title": item["title"], "description": item["description"], "url": item["url"]} for item in data["articles"][:5]]
            print(f"Fetched {len(news)} news items for {stock_symbol}")
            return news
        # Fallback to original input if symbol fails and provided
        if original_input and stock_symbol != original_input.upper() and not is_valid_ticker(stock_symbol):
            print(f"Retrying with original input: {original_input}")
            return fetch_stock_news(original_input)
        print(f"No news data for {stock_symbol}: {data}")
        return get_mock_news()
    except requests.exceptions.HTTPError as e:
        print(f"Error fetching news for {stock_symbol}: {e}")
        return get_mock_news()
    except Exception as e:
        print(f"Error fetching news for {stock_symbol}: {e}")
        return get_mock_news()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "StockInsight Pro API is running"})

# News analysis endpoint
@app.route('/api/news-analysis', methods=['POST'])
def news_analysis():
    try:
        data = request.get_json()
        company_name = data.get('company_name', '').strip()
        if not company_name:
            return jsonify({"error": "Company name is required"}), 400
        stock_symbol = COMPANY_TO_TICKER.get(company_name.lower(), company_name.upper())
        print(f"Processing {company_name} as stock_symbol: {stock_symbol}")

        price_data = analyze_historical_stock_data(stock_symbol)
        if not price_data and not is_valid_ticker(stock_symbol):
            print(f"No price data for {stock_symbol}, attempting news with original input")
            news = fetch_stock_news(company_name)
        else:
            news = fetch_stock_news(stock_symbol, company_name)
        return jsonify({
            "stock_name": company_name,
            "current_price": price_data["current_price"] if price_data else None,
            "change_percent": price_data["change_percent"] if price_data else None,
            "volatility": price_data["volatility"] if price_data else None,
            "news": news,
            "timestamp": price_data["timestamp"] if price_data else None
        })
    except Exception as e:
        print(f"Unexpected error in news_analysis: {e}")
        return jsonify({"error": str(e)}), 500

# Price analysis endpoint
@app.route('/api/price-analysis', methods=['POST'])
def price_analysis():
    try:
        data = request.get_json()
        stock_symbol = data.get('stock_symbol', '').strip().upper()
        print(f"Received request for stock_symbol: {stock_symbol}")

        if not stock_symbol:
            return jsonify({"error": "Stock symbol is required"}), 400

        try:
            price_data = analyze_historical_stock_data(stock_symbol)
            if not price_data:
                return jsonify({"error": f"No data found for '{stock_symbol}'. Check the symbol or try again later!"}), 404
            return jsonify(price_data)
        except Exception as e:
            print(f"Error in price analysis data fetch: {e}")
            raise

    except Exception as e:
        print(f"Unexpected error in price_analysis: {e}")
        return jsonify({"error": str(e)}), 500

# News feed endpoint for LiveNewsFeed.tsx
@app.route('/api/news', methods=['GET'])
def get_news():
    try:
        news = fetch_general_news()
        if not news:
            return jsonify({"error": "No news data available"}), 404
        return jsonify({"news": news})
    except Exception as e:
        print(f"Unexpected error in get_news: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

