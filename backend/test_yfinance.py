import yfinance as yf

ticker_symbol = "AAPL"
ticker = yf.Ticker(ticker_symbol)

try:
    latest_data = ticker.history(period="1d")  # Changed to 1 month
    current_price = latest_data["Close"].iloc[-1]
    timestamp = latest_data.index[-1].strftime("%Y-%m-%d %H:%M:%S")
    print(f"Stock: {ticker_symbol}")
    print(f"Current Price: ${current_price:.2f}")
    print(f"Timestamp: {timestamp}")
except Exception as e:
    print(f"Error fetching data: {e}")