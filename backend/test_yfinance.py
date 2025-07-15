import yfinance as yf

ticker_symbol = "MSFT"
ticker = yf.Ticker(ticker_symbol)

def fetch_stock_data(symbol):
    try:
        # First attempt with 1 day
        latest_data = ticker.history(period="1mo")
        if latest_data.empty:
            print(f"{symbol}: No 1-day data, trying 5 days")
            latest_data = ticker.history(period="5d")
            if latest_data.empty:
                print(f"{symbol}: No data found, symbol may be unavailable or delisted")
                return None
        current_price = latest_data["Close"].iloc[-1]
        timestamp = latest_data.index[-1].strftime("%Y-%m-%d %H:%M:%S")
        return current_price, timestamp
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

result = fetch_stock_data(ticker_symbol)
if result:
    current_price, timestamp = result
    print(f"Stock: {ticker_symbol}")
    print(f"Current Price: ${current_price:.2f}")
    print(f"Timestamp: {timestamp}")
else:
    print(f"Failed to retrieve data for {ticker_symbol}")