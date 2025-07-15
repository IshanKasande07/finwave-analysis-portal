from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import requests
from flask import Flask, jsonify
import re

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8080"}})

# In-memory portfolio storage
portfolio = {}

# Region to exchange mapping for FMP API
REGION_TO_EXCHANGE = {
    "USA": "XNYS",
    "INDIA": "NSE",
    "EUROPE": "XLON"
}

# Mock news data
def get_mock_news():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return [
        {"title": f"Mock News 1 - {timestamp}", "description": "Sample news about financial markets.", "url": "http://example.com"},
        {"title": f"Mock News 2 - {timestamp}", "description": "Another sample news about markets.", "url": "http://example.com"},
    ]

# Validate if a stock symbol is valid
def is_valid_ticker(symbol):
    try:
        ticker = yf.Ticker(symbol)
        hist_data = ticker.history(period="1d")
        return not hist_data.empty
    except Exception as e:
        print(f"Validation failed for {symbol}: {e}")
        return False

# Mapping of company names to ticker symbols
COMPANY_TO_TICKER = {
    "apple": "AAPL",
    "tesla": "TSLA",
    "microsoft": "MSFT",
    "amazon": "AMZN",
    "google": "GOOGL",  # Alphabet Inc. (Google's parent)
    "facebook": "META",
    "nvidia": "NVDA",
    "intel": "INTC",
    "netflix": "NFLX",
    "adobe": "ADBE"
}

# Analyze historical stock data
def analyze_historical_stock_data(stock_symbol):
    try:
        ticker = yf.Ticker(stock_symbol)
        for period in ["1mo", "1d"]:
            hist_data = ticker.history(period=period, interval="1d")
            if not hist_data.empty:
                break
        if hist_data.empty:
            print(f"{stock_symbol}: No data from yfinance for any period")
            return None
        df = hist_data.astype(float)
        df.index = pd.to_datetime(df.index)
        current_price = df["Close"].iloc[-1]
        volatility = df["Close"].pct_change().std() * 100
        latest_timestamp = df.index[-1].strftime("%Y-%m-%d %H:%M:%S")
        change_percent = ((current_price - df["Close"].iloc[-2]) / df["Close"].iloc[-2] * 100) if len(df) > 1 else 0.0
        market_cap = ticker.info.get("marketCap", None)
        print(f"Current price for {stock_symbol} at {latest_timestamp}: ${current_price}, Volatility: {volatility:.2f}%, Market Cap: {market_cap}")
        trend = df["Close"].tail(7).tolist()
        return {
            "stock_symbol": stock_symbol,
            "current_price": current_price,
            "change_percent": change_percent,
            "volatility": volatility,
            "market_cap": market_cap,
            "timestamp": latest_timestamp,
            "trend": trend
        }
    except Exception as e:
        print(f"Error analyzing {stock_symbol} with yfinance: {e}")
        return None

# Technical analysis with MACD and ATR
def get_macd_atr_signal(ticker, risk_reward_ratio=2.5):
    try:
        df = yf.download(ticker, period='6mo', interval='1d', auto_adjust=False)
        if df.empty:
            raise ValueError(f"No data available for {ticker}")
        df = df.reset_index()
        df['Date'] = pd.to_datetime(df['Date'])
        df.set_index('Date', inplace=True)
        df.dropna(inplace=True)
        if len(df) < 26:
            raise ValueError(f"Insufficient data for {ticker} (less than 26 rows)")
        required_columns = ['Open', 'High', 'Low', 'Close']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"Missing required columns for {ticker}")
        df['EMA12'] = df['Close'].ewm(span=12, adjust=False).mean()
        df['EMA26'] = df['Close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = df['EMA12'] - df['EMA26']
        df['Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
        df['H-L'] = df['High'] - df['Low']
        df['H-PC'] = abs(df['High'] - df['Close'].shift(1))
        df['L-PC'] = abs(df['Low'] - df['Close'].shift(1))
        df['TR'] = df[['H-L', 'H-PC', 'L-PC']].max(axis=1, skipna=True)
        df['ATR'] = df['TR'].rolling(window=14, min_periods=1).mean()
        if pd.isna(df['ATR'].iloc[-1]):
            raise ValueError(f"ATR not calculable for {ticker}")
        if len(df) < 3:
            raise ValueError(f"Insufficient data for crossover comparison in {ticker}")
        latest_macd = df['MACD'].iloc[-1]
        latest_signal = df['Signal'].iloc[-1]
        prev_macd = df['MACD'].iloc[-2]
        prev_signal = df['Signal'].iloc[-2]
        signal = "Hold"
        if prev_macd <= prev_signal and latest_macd > latest_signal:
            signal = "Buy"
        elif prev_macd >= prev_signal and latest_macd < latest_signal:
            signal = "Sell"
        entry_price = float(df['Close'].iloc[-1])
        atr = float(df['ATR'].iloc[-1])
        risk_multiplier = 1.0
        reward_multiplier = max(1.5, min(risk_reward_ratio, 5.0))
        sl = round(entry_price - risk_multiplier * atr, 2) if atr > 0 else None
        target = round(entry_price + reward_multiplier * atr, 2) if atr > 0 else None
        timestamp = df.index[-1].strftime("%Y-%m-%d %H:%M:%S")
        return {
            "ticker": ticker,
            "signal": signal,
            "entry_price": entry_price,
            "stop_loss": sl,
            "target_price": target,
            "atr": atr,
            "timestamp": timestamp
        }
    except Exception as e:
        print(f"Error in technical analysis for {ticker}: {e}")
        return None

# Fetch current price
def get_current_price(symbol):
    try:
        ticker = yf.Ticker(symbol)
        hist_data = ticker.history(period="1d", auto_adjust=False)
        if hist_data.empty:
            print(f"No data for {symbol}")
            return None
        return hist_data["Close"].iloc[-1]
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

# Fetch general financial news
def fetch_general_news():
    try:
        timestamp = datetime.now().timestamp()
        url = f"https://newsapi.org/v2/everything?q=finance&apiKey=068e711e98064895a700fc16902005b6&t={timestamp}"
        response = requests.get(url)
        response.raise_for_status()
        remaining_requests = response.headers.get('X-RateLimit-Remaining')
        reset_time = response.headers.get('X-RateLimit-Reset')
        print(f"NewsAPI Rate Limit: {remaining_requests} requests remaining, resets at {reset_time}")
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
        print(f"Error fetching news: {e}")
        return get_mock_news()

# Fetch stock news
def fetch_stock_news(stock_symbol, original_input=None):
    try:
        timestamp = datetime.now().timestamp()
        url = f"https://newsapi.org/v2/everything?q={stock_symbol}&apiKey=068e711e98064895a700fc16902005b6&t={timestamp}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok" and data.get("articles"):
            news = [{"title": item["title"], "description": item["description"], "url": item["url"]} for item in data["articles"][:5]]
            print(f"Fetched {len(news)} news items for {stock_symbol}")
            return news
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

# Fetch global market indices
def fetch_global_indices(region="all"):
    try:
        indices_data = {}
        region_indices = {
            "all": ["^GSPC", "^NSEI", "^FTSE", "^GDAXI"],
            "usa": ["^GSPC", "^DJI", "^IXIC"],
            "europe/uk": ["^FTSE", "^GDAXI", "^FCHI"],
            "india": ["^NSEI", "^BSESN"],
            "world": ["^GSPC", "^NSEI", "^FTSE", "^GDAXI", "^N225"]
        }.get(region.lower(), ["^GSPC", "^NSEI", "^FTSE", "^GDAXI"])
        for symbol in region_indices:
            ticker = yf.Ticker(symbol)
            hist_data = ticker.history(period="1mo", interval="1d")
            if hist_data.empty:
                continue
            df = hist_data.astype(float)
            current_value = df["Close"].iloc[-1]
            change_percent = ((current_value - df["Close"].iloc[-2]) / df["Close"].iloc[-2] * 100) if len(df) > 1 else 0.0
            trend = df["Close"].tail(7).tolist()
            indices_data[symbol] = {
                "symbol": symbol,
                "current_value": current_value,
                "change_percent": change_percent,
                "trend": trend
            }
        return indices_data
    except Exception as e:
        print(f"Error fetching global indices for region {region}: {e}")
        return {}

# Fetch top active stocks using Financial Modeling Prep API
def fetch_active_stocks(region="USA"):
    try:
        exchange = REGION_TO_EXCHANGE.get(region.upper(), "XNYS")
        api_key = "kjxcZlhYcE62hNlR0r3sXqUrT6lyCGRk"
        url = f"https://financialmodelingprep.com/api/v3/stock_market/actives?exchange={exchange}&apikey={api_key}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        active_stocks = [
            {
                "symbol": stock["symbol"],
                "name": stock["name"] or "Unknown",
                "price": float(stock["price"]) if stock.get("price") else 0.0,
                "change": float(stock["changesPercentage"]) if stock.get("changesPercentage") else 0.0,
                "volume": int(stock["volume"]) if stock.get("volume") and stock["volume"] is not None else 0,
                "exchange": exchange
            }
            for stock in data if stock.get("symbol") and stock.get("name") and stock.get("price") is not None
        ][:10]
        for stock in active_stocks:
            print(f"Stock: {stock['symbol']}, Volume: {stock['volume']}, Exchange: {stock['exchange']}")
        print(f"Fetched {len(active_stocks)} active stocks for exchange {exchange}")
        if not active_stocks:
            print(f"No active stocks fetched for exchange {exchange}. Possible API limitation or off-hours.")
        return active_stocks
    except requests.exceptions.HTTPError as e:
        print(f"Error fetching active stocks for {region}: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error fetching active stocks for {region}: {e}")
        return []
    
# Your Gemini API key
GEMINI_API_KEY = "AIzaSyBBx6tfVrpJru7Pu7HxUJrdQD57QpPi5DA"

def fetch_news_via_gemini(query="finance", limit=5):
    try:
        prompt = (
            f"List the latest {limit} finance news headlines with their summaries and links. "
            "Return JSON array like: [{\"title\": \"...\", \"url\": \"...\", \"summary\": \"...\"}]"
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        content = response.json()["candidates"][0]["content"]["parts"][0]["text"]

        # Use regex to extract JSON array from response
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if not match:
            raise ValueError("No valid JSON array found in Gemini response.")

        json_str = match.group(0)
        news_list = json.loads(json_str)
        return news_list

    except Exception as e:
        print(f"Error using Gemini API: {e}")
        return []


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "StockInsight Pro API is running"})

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
                return jsonify({"error": f"No data found for '{stock_symbol}'. Verify the symbol or try again later."}), 404
            return jsonify(price_data)
        except Exception as e:
            print(f"Error in price analysis data fetch: {e}")
            return jsonify({"error": f"Failed to fetch data for '{stock_symbol}': {str(e)}"}), 500
    except Exception as e:
        print(f"Unexpected error in price_analysis: {e}")
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500

# News analysis endpoint
@app.route('/api/news-analysis', methods=['POST'])
def news_analysis():
    try:
        data = request.get_json()
        company_name = data.get('company_name', '').strip().lower()  # Convert to lowercase for mapping
        if not company_name:
            return jsonify({"error": "Company name is required"}), 400
        print(f"Processing {company_name} as company name")

        # Map company name to ticker symbol
        stock_symbol = COMPANY_TO_TICKER.get(company_name, company_name.upper())
        if stock_symbol == company_name.upper():
            print(f"No mapping found for {company_name}, using {stock_symbol} as ticker")

        price_data = analyze_historical_stock_data(stock_symbol)
        news = fetch_stock_news(stock_symbol, company_name)  # Always fetch news
        if not price_data and not is_valid_ticker(stock_symbol):
            print(f"No price data for {stock_symbol}, returning news with error")
            return jsonify({
                "stock_name": company_name,
                "current_price": None,
                "change_percent": None,
                "volatility": None,
                "market_cap": None,
                "news": news,
                "timestamp": None,
                "error": f"No price data available for {stock_symbol}. Try another company or check the symbol (e.g., use {COMPANY_TO_TICKER.get(company_name, 'a valid ticker')} for {company_name})."
            }), 200
        else:
            return jsonify({
                "stock_name": company_name,
                "current_price": price_data["current_price"] if price_data else None,
                "change_percent": price_data["change_percent"] if price_data else None,
                "volatility": price_data["volatility"] if price_data else None,
                "market_cap": price_data["market_cap"] if price_data else None,
                "news": news,
                "timestamp": price_data["timestamp"] if price_data else None
            }), 200
    except Exception as e:
        print(f"Unexpected error in news_analysis: {e}")
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500

# Technical analysis endpoint
@app.route('/api/technical-analysis', methods=['POST'])
def technical_analysis():
    try:
        data = request.get_json()
        stock_symbol = data.get('stock_symbol', '').strip().upper()
        risk_reward_ratio = data.get('risk_reward_ratio', 2.5)
        print(f"Received request for technical analysis of {stock_symbol} with risk_reward_ratio={risk_reward_ratio}")

        if not stock_symbol:
            return jsonify({"error": "Stock symbol is required"}), 400

        if not is_valid_ticker(stock_symbol):
            return jsonify({"error": f"Invalid stock symbol: {stock_symbol}"}), 404

        analysis = get_macd_atr_signal(stock_symbol, risk_reward_ratio)
        if analysis is None:
            return jsonify({"error": f"Failed to analyze {stock_symbol}. Check symbol or try again later."}), 500

        return jsonify(analysis)
    except Exception as e:
        print(f"Error in technical analysis: {e}")
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500

# Add stock to portfolio
@app.route('/api/portfolio/add-stock', methods=['POST'])
def add_stock_to_portfolio():
    try:
        data = request.get_json()
        stock_symbol = data.get('stock_symbol', '').strip().upper()
        quantity = int(data.get('quantity', 1))
        buy_price = float(data.get('buy_price', 0.0))

        if not stock_symbol or quantity <= 0 or buy_price <= 0:
            return jsonify({"error": "Valid stock symbol, quantity, and buy price are required"}), 400

        if not is_valid_ticker(stock_symbol):
            return jsonify({"error": f"Invalid stock symbol: {stock_symbol}"}), 404

        if stock_symbol not in portfolio:
            portfolio[stock_symbol] = {"quantity": 0, "buy_price": 0.0, "added_at": datetime.now().isoformat()}
        portfolio[stock_symbol]["quantity"] += quantity
        portfolio[stock_symbol]["buy_price"] = ((portfolio[stock_symbol]["buy_price"] * portfolio[stock_symbol]["quantity"]) + (buy_price * quantity)) / (portfolio[stock_symbol]["quantity"] + quantity)

        return jsonify({"message": f"Added {quantity} shares of {stock_symbol} at ${buy_price}", "portfolio": portfolio}), 200
    except Exception as e:
        print(f"Error adding stock to portfolio: {e}")
        return jsonify({"error": f"Failed to add stock: {str(e)}"}), 500

# Get portfolio
@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    try:
        portfolio_data = {}
        total_value = 0.0
        total_invested = 0.0

        for symbol, data in portfolio.items():
            current_price = get_current_price(symbol)
            if current_price is None:
                continue
            invested_value = data["buy_price"] * data["quantity"]
            current_value = current_price * data["quantity"]
            profit_loss = current_value - invested_value
            profit_loss_percent = (profit_loss / invested_value * 100) if invested_value else 0.0

            portfolio_data[symbol] = {
                "quantity": data["quantity"],
                "buy_price": data["buy_price"],
                "current_price": current_price,
                "invested_value": invested_value,
                "current_value": current_value,
                "profit_loss": profit_loss,
                "profit_loss_percent": profit_loss_percent,
                "added_at": data["added_at"]
            }
            total_invested += invested_value
            total_value += current_value

        total_profit_loss = total_value - total_invested
        total_profit_loss_percent = (total_profit_loss / total_invested * 100) if total_invested else 0.0

        return jsonify({
            "portfolio": portfolio_data,
            "total_invested": total_invested,
            "total_value": total_value,
            "total_profit_loss": total_profit_loss,
            "total_profit_loss_percent": total_profit_loss_percent
        }), 200
    except Exception as e:
        print(f"Error fetching portfolio: {e}")
        return jsonify({"error": f"Failed to fetch portfolio: {str(e)}"}), 500

# Global indices endpoint
@app.route('/api/global-indices', methods=['GET'])
def get_global_indices():
    region = request.args.get('region', 'all').lower()
    indices_data = fetch_global_indices(region)
    return jsonify(indices_data)

# Market movers endpoint
@app.route('/api/market-movers', methods=['GET'])
def get_market_movers():
    region = request.args.get('region', 'usa').upper()
    print(f"Received market-movers request with region: {region}")
    active_stocks = fetch_active_stocks(region)
    return jsonify(active_stocks)

# News feed endpoint
@app.route('/api/news', methods=['GET'])
def get_news():
    try:
        news = fetch_news_via_gemini()
        if not news:
            return jsonify({"error": "No news from Gemini"}), 404
        return jsonify({"news": news})
    except Exception as e:
        print(f"Unexpected error in get_news: {e}")
        return jsonify({"error": f"Failed to fetch news: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
