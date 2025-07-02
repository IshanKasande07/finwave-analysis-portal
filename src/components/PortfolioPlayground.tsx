
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, DollarSign, PlusCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stock {
  ticker: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  profit_loss?: number;
}

interface PortfolioData {
  [key: string]: Stock;
}

const PortfolioPlayground = () => {
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [portfolio, setPortfolio] = useState<PortfolioData>({});
  const [totalCash, setTotalCash] = useState(10000);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [liveDataLoading, setLiveDataLoading] = useState(false);
  const { toast } = useToast();

  const addStock = async () => {
    if (!ticker.trim() || !quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid ticker symbol and quantity",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/portfolio/add-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ticker: ticker.toUpperCase(), 
          quantity: parseInt(quantity) 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.success && totalCash >= data.total_cost) {
        const newStock: Stock = {
          ticker: data.ticker,
          quantity: data.quantity,
          purchase_price: data.price,
        };
        
        setPortfolio(prev => ({ ...prev, [data.ticker]: newStock }));
        setTotalCash(prev => prev - data.total_cost);
        setTicker("");
        setQuantity("");
        
        toast({
          title: "Stock Added",
          description: `Successfully added ${data.quantity} shares of ${data.ticker}`,
        });
      } else if (totalCash < data.total_cost) {
        toast({
          title: "Insufficient Funds",
          description: `You need $${data.total_cost} but only have $${totalCash.toFixed(2)}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLiveData = async () => {
    if (Object.keys(portfolio).length === 0) return;
    
    setLiveDataLoading(true);
    
    try {
      const updatedPortfolio = { ...portfolio };
      let totalValue = 0;
      
      for (const [ticker, stock] of Object.entries(portfolio)) {
        try {
          const response = await fetch(`http://localhost:5000/api/portfolio/get-price/${ticker}`);
          if (response.ok) {
            const data = await response.json();
            const currentPrice = data.price;
            const profitLoss = (currentPrice - stock.purchase_price) * stock.quantity;
            
            updatedPortfolio[ticker] = {
              ...stock,
              current_price: currentPrice,
              profit_loss: profitLoss,
            };
            
            totalValue += currentPrice * stock.quantity;
          }
        } catch (error) {
          console.error(`Error fetching price for ${ticker}:`, error);
        }
      }
      
      setPortfolio(updatedPortfolio);
      setPortfolioValue(totalValue);
    } catch (error) {
      console.error("Error updating live data:", error);
    } finally {
      setLiveDataLoading(false);
    }
  };

  const resetPortfolio = () => {
    setPortfolio({});
    setTotalCash(10000);
    setPortfolioValue(0);
    toast({
      title: "Portfolio Reset",
      description: "Your portfolio has been reset to $10,000 cash",
    });
  };

  useEffect(() => {
    if (Object.keys(portfolio).length > 0) {
      updateLiveData();
      const interval = setInterval(updateLiveData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [portfolio]);

  const totalPortfolioValue = portfolioValue + totalCash;
  const totalReturn = totalPortfolioValue - 10000;
  const returnPercentage = (totalReturn / 10000) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Portfolio Playground</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-blue-400/20">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Available Cash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">${totalCash.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-green-400/20">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">${totalPortfolioValue.toFixed(2)}</p>
              <p className={`text-sm ${returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}% 
                ({returnPercentage >= 0 ? '+' : ''}${totalReturn.toFixed(2)})
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-purple-400">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{Object.keys(portfolio).length}</p>
              <p className="text-sm text-slate-400">Different stocks</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-blue-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Stock to Portfolio
            </CardTitle>
            <CardDescription className="text-slate-300">
              Start with $10,000 virtual cash to build your investment portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Ticker symbol (e.g., AAPL)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                placeholder="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white w-32"
              />
              <Button 
                onClick={addStock} 
                disabled={loading}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Stock
              </Button>
              <Button 
                onClick={resetPortfolio} 
                variant="outline"
                className="border-red-400/20 text-red-400 hover:bg-red-400/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {Object.keys(portfolio).length > 0 && (
          <Card className="bg-slate-800/50 border-blue-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Your Portfolio
                {liveDataLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
              <CardDescription className="text-slate-300">
                Live prices update every 30 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(portfolio).map(([ticker, stock]) => (
                  <div key={ticker} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-bold text-white">{ticker}</h4>
                      <Badge className={`${(stock.profit_loss || 0) >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {(stock.profit_loss || 0) >= 0 ? '+' : ''}${(stock.profit_loss || 0).toFixed(2)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Quantity</p>
                        <p className="text-white font-semibold">{stock.quantity} shares</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Purchase Price</p>
                        <p className="text-white font-semibold">${stock.purchase_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Current Price</p>
                        <p className="text-white font-semibold">
                          {stock.current_price ? `$${stock.current_price.toFixed(2)}` : 'Loading...'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Value</p>
                        <p className="text-white font-semibold">
                          {stock.current_price ? `$${(stock.current_price * stock.quantity).toFixed(2)}` : 'Loading...'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {Object.keys(portfolio).length === 0 && (
          <Card className="bg-slate-800/50 border-slate-600/20">
            <CardContent className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No stocks in portfolio</h3>
              <p className="text-slate-500">Add your first stock to start building your investment portfolio</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PortfolioPlayground;
