
from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import requests
import re
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# API Keys - Replace with your actual API keys
NEWS_API_KEY = "6d30785b61194e62b036e70d8bae414b"
FINNHUB_API_KEY = "cv1uabhr01qngf0ast30cv1uabhr01qngf0ast3g"

# Company name to ticker mapping
COMPANY_TO_TICKER = {
    "tesla": "TSLA", "apple": "AAPL", "microsoft": "MSFT", "amazon": "AMZN",
    "google": "GOOGL", "alphabet": "GOOGL", "facebook": "META", "meta": "META",
    "nvidia": "NVDA", "netflix": "NFLX", "intel": "INTC", "ibm": "IBM",
    "disney": "DIS", "walmart": "WMT", "johnson": "JNJ", "visa": "V",
    "mastercard": "MA", "coca": "KO", "pepsi": "PEP", "mcdonald": "MCD"
}

# Mock sentiment analysis functions (replace with actual AI models)
def analyze_sentiment_simple(text):
    """Simple sentiment analysis - replace with actual FinBERT model"""
    positive_words = ['good', 'great', 'excellent', 'buy', 'bull', 'up', 'growth', 'strong', 'positive', 'gain']
    negative_words = ['bad', 'terrible', 'sell', 'bear', 'down', 'loss', 'weak', 'negative', 'drop', 'fall']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return "positive", 0.6 + (positive_count - negative_count) * 0.1
    elif negative_count > positive_count:
        return "negative", -0.6 - (negative_count - positive_count) * 0.1
    else:
        return "neutral", 0.0

def summarize_text_simple(text, max_length=150):
    """Simple text summarization - replace with actual BART model"""
    sentences = text.split('. ')
    if len(sentences) <= 2:
        return text
    
    # Take first two sentences as summary
    summary = '. '.join(sentences[:2])
    if len(summary) > max_length:
        summary = summary[:max_length] + "..."
    return summary

# Utility functions
def get_ticker_from_name(company_name):
    company_name = company_name.lower().strip()
    for key, value in COMPANY_TO_TICKER.items():
        if key in company_name:
            return value
    return company_name.upper()

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r"\[\+\d+ chars\]", "", text)
    text = text.strip().rstrip("…")
    return text

def get_stock_price(ticker):
    """Get stock price using yfinance"""
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period="1d")
        if not data.empty:
            return float(data['Close'].iloc[-1])
        return None
    except:
        return None

# News Analysis Routes
def fetch_stock_news(stock_name, limit=5):
    query = f'"{stock_name}" OR "{get_ticker_from_name(stock_name)}"'
    url = f"https://newsapi.org/v2/everything?q={query}&sortBy=publishedAt&language=en&pageSize={limit}&apiKey={NEWS_API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            articles = response.json().get("articles", [])
            filtered_articles = []
            
            for article in articles:
                title = article.get("title", "No Title")
                description = clean_text(article.get("description", ""))
                content = clean_text(article.get("content", ""))
                full_text = f"{description} {content}" if content else description
                
                if len(full_text.split()) >= 10:
                    filtered_articles.append((title, full_text))
            
            return filtered_articles
        return []
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

def summarize_news(news_articles):
    summaries = []
    for title, content in news_articles:
        summary_text = summarize_text_simple(content)
        sentiment, score = analyze_sentiment_simple(summary_text)
        summaries.append({
            "title": title,
            "summary": summary_text,
            "sentiment": sentiment,
            "score": abs(score)
        })
    return summaries

def calculate_overall_sentiment(summaries):
    if not summaries:
        return "Neutral", 0.0
    
    sentiment_mapping = {"positive": 1, "neutral": 0, "negative": -1}
    total_score = sum(sentiment_mapping[item["sentiment"]] * item["score"] for item in summaries)
    avg_score = total_score / len(summaries)
    
    if avg_score > 0.3:
        return "Bullish", round(avg_score, 2)
    elif avg_score < -0.3:
        return "Bearish", round(avg_score, 2)
    return "Neutral", round(avg_score, 2)

def analyze_historical_stock_data(stock_symbol):
    try:
        stock = yf.Ticker(stock_symbol)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=5*365)  # 5 years
        
        df = stock.history(start=start_date, end=end_date)
        if df.empty:
            return None
        
        current_price = df['Close'].iloc[-1]
        previous_price = df['Close'].iloc[-2] if len(df) > 1 else current_price
        change_percent = ((current_price - previous_price) / previous_price) * 100
        
        initial_price = df['Close'].iloc[0]
        percent_growth = ((current_price - initial_price) / initial_price) * 100
        
        # Calculate volatility
        daily_returns = df['Close'].pct_change().dropna()
        volatility = daily_returns.std() * np.sqrt(252) * 100
        
        return {
            "current_price": round(current_price, 2),
            "change_percent": round(change_percent, 2),
            "percent_growth": round(percent_growth, 2),
            "volatility": round(volatility, 2),
            "highest_price": round(df['Close'].max(), 2),
            "lowest_price": round(df['Close'].min(), 2),
            "initial_price": round(initial_price, 2),
            "final_price": round(current_price, 2)
        }
    except Exception as e:
        print(f"Error analyzing historical data: {e}")
        return None

# API Routes
@app.route('/api/news-analysis', methods=['POST'])
def news_analysis():
    try:
        data = request.get_json()
        stock_name = data.get('stock_name', '').strip()
        
        if not stock_name:
            return jsonify({"error": "Stock name is required"}), 400
        
        stock_symbol = get_ticker_from_name(stock_name)
        news_articles = fetch_stock_news(stock_name)
        summaries = summarize_news(news_articles) if news_articles else []
        overall_sentiment, overall_score = calculate_overall_sentiment(summaries)
        historical_data = analyze_historical_stock_data(stock_symbol)
        
        reason = "Market sentiment analysis based on recent news."
        if historical_data and historical_data["change_percent"] < -2:
            reason = "Downtrend observed, possibly due to market corrections."
        elif historical_data and historical_data["change_percent"] > 2:
            reason = "Uptrend observed, possibly due to positive market sentiment."
        
        result = {
            "stock_name": stock_name,
            "stock_symbol": stock_symbol,
            "current_price": historical_data["current_price"] if historical_data else "N/A",
            "change_percent": historical_data["change_percent"] if historical_data else 0.0,
            "trend": overall_sentiment,
            "reason": reason,
            "news_summaries": summaries,
            "historical_data": historical_data or {}
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/price-analysis', methods=['POST'])
def price_analysis():
    try:
        data = request.get_json()
        stock_symbol = data.get('stock_symbol', '').strip().upper()
        
        if not stock_symbol:
            return jsonify({"error": "Stock symbol is required"}), 400
        
        try:
            stock = yf.Ticker(stock_symbol)
            df = stock.history(period="1d")
            
            if df.empty:
                return jsonify({"error": f"No data found for '{stock_symbol}'. Check the symbol!"}), 404
            
            current_price = df['Close'].iloc[-1]
            prev_close = stock.info.get("previousClose", None)
            
            if prev_close:
                percentage_change = ((current_price - prev_close) / prev_close) * 100
            else:
                percentage_change = 0.0
            
            trend = "Bullish" if percentage_change > 1 else "Bearish" if percentage_change < -1 else "Neutral"
            reason = (
                "Strong uptrend due to recent buying pressure." if trend == "Bullish" else
                "Downtrend observed, possibly due to market corrections." if trend == "Bearish" else
                "Market is consolidating, waiting for direction."
            )
            
            # Simple candle pattern detection
            df['Change'] = df['Close'] - df['Open']
            candle_pattern = "Bullish" if df['Change'].iloc[-1] > 0 else "Bearish" if df['Change'].iloc[-1] < 0 else "Doji"
            
            result = {
                "stock": stock_symbol,
                "current_price": round(current_price, 2),
                "percentage_change": round(percentage_change, 2),
                "trend": trend,
                "reason": reason,
                "candle_pattern": candle_pattern,
                "color": "positive" if percentage_change >= 0 else "negative"
            }
            
            return jsonify(result)
        
        except Exception as e:
            return jsonify({"error": f"Error fetching data for {stock_symbol}: {str(e)}"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sentiment-analysis', methods=['POST'])
def sentiment_analysis():
    try:
        data = request.get_json()
        stock_name = data.get('stock_name', '').strip()
        
        if not stock_name:
            return jsonify({"error": "Stock name is required"}), 400
        
        # Mock social media data (replace with actual Reddit/Twitter API calls)
        mock_posts = [
            f"Just bought more {stock_name} shares. This company is solid and has great fundamentals.",
            f"{stock_name} stock looking bearish today. Market volatility is affecting the price.",
            f"{stock_name} announces new product launch. Innovation continues to drive growth.",
            f"Market uncertainty is affecting {stock_name}. Trading sideways for now.",
            f"{stock_name} partnerships with major companies. This could be a game changer."
        ]
        
        # Analyze sentiment for each post
        results = []
        for post in mock_posts:
            sentiment, score = analyze_sentiment_simple(post)
            results.append({
                "text": post,
                "sentiment": sentiment,
                "score": abs(score)
            })
        
        # Calculate overall sentiment
        sentiment_mapping = {"positive": 1, "neutral": 0, "negative": -1}
        total_score = sum(sentiment_mapping[item["sentiment"]] * item["score"] for item in results)
        avg_score = total_score / len(results) if results else 0
        
        overall_sentiment = "Bullish" if avg_score > 0.3 else "Bearish" if avg_score < -0.3 else "Neutral"
        reason = (
            "Positive sentiment observed, possibly due to market optimism." if overall_sentiment == "Bullish" else
            "Negative sentiment observed, possibly due to market concerns." if overall_sentiment == "Bearish" else
            "Market sentiment analysis based on social media posts shows neutral outlook."
        )
        
        result = {
            "stock_name": stock_name,
            "trend": overall_sentiment,
            "reason": reason,
            "overall_score": round(avg_score, 2),
            "results": results
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/portfolio/add-stock', methods=['POST'])
def add_stock():
    try:
        data = request.get_json()
        ticker = data.get('ticker', '').strip().upper()
        quantity = int(data.get('quantity', 0))
        
        if not ticker or quantity <= 0:
            return jsonify({"error": "Valid ticker and quantity required"}), 400
        
        price = get_stock_price(ticker)
        if price is None:
            return jsonify({"error": "Invalid ticker symbol or unable to fetch price"}), 404
        
        return jsonify({
            "success": True,
            "ticker": ticker,
            "price": round(price, 2),
            "quantity": quantity,
            "total_cost": round(price * quantity, 2)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/portfolio/get-price/<ticker>')
def get_price(ticker):
    try:
        price = get_stock_price(ticker.upper())
        if price is None:
            return jsonify({"error": "Unable to fetch price"}), 404
        
        return jsonify({"ticker": ticker.upper(), "price": round(price, 2)})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/news/live')
def live_news():
    try:
        url = f"https://newsapi.org/v2/everything?q=stock%20market&sortBy=publishedAt&language=en&pageSize=10&apiKey={NEWS_API_KEY}"
        response = requests.get(url)
        
        if response.status_code == 200:
            articles = response.json().get("articles", [])
            news_items = []
            
            for article in articles[:5]:
                title = article.get("title", "")
                description = article.get("description", "")
                published_at = article.get("publishedAt", "")
                url = article.get("url", "")
                source = article.get("source", {}).get("name", "Unknown")
                
                # Simple sentiment analysis
                sentiment, _ = analyze_sentiment_simple(f"{title} {description}")
                
                news_items.append({
                    "title": title,
                    "description": description,
                    "publishedAt": published_at,
                    "url": url,
                    "source": source,
                    "sentiment": sentiment
                })
            
            return jsonify({"articles": news_items})
        
        return jsonify({"error": "Failed to fetch news"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "StockInsight Pro API is running"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
