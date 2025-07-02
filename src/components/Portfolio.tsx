
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, TrendingDown, Plus, Trash2, DollarSign, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stock {
  ticker: string;
  quantity: number;
  price: number;
  totalValue: number;
  change?: number;
}

const Portfolio = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addStock = async () => {
    if (!newTicker.trim() || !newQuantity.trim()) {
      toast({
        title: "Error",
        description: "Please enter both ticker and quantity",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(newQuantity);
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
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
          ticker: newTicker.toUpperCase(),
          quantity: quantity
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

      const newStock: Stock = {
        ticker: data.ticker,
        quantity: data.quantity,
        price: data.price,
        totalValue: data.total_cost,
        change: Math.random() * 10 - 5 // Mock change percentage
      };

      setStocks([...stocks, newStock]);
      setNewTicker("");
      setNewQuantity("");
      
      toast({
        title: "Stock Added",
        description: `Added ${quantity} shares of ${data.ticker} at $${data.price}`,
      });
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

  const removeStock = (ticker: string) => {
    setStocks(stocks.filter(stock => stock.ticker !== ticker));
    toast({
      title: "Stock Removed",
      description: `Removed ${ticker} from portfolio`,
    });
  };

  const totalValue = stocks.reduce((sum, stock) => sum + stock.totalValue, 0);
  const totalChange = stocks.reduce((sum, stock) => sum + (stock.change || 0), 0) / (stocks.length || 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Portfolio Management</h1>
          
          {/* Portfolio Summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-brand-primary" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-brand-accent" />
                  Total Stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stocks.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground flex items-center">
                  {totalChange >= 0 ? <TrendingUp className="w-5 h-5 mr-2 text-green-500" /> : <TrendingDown className="w-5 h-5 mr-2 text-red-500" />}
                  Avg Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Add Stock Section */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-brand-primary flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Stock to Portfolio
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter a stock ticker and quantity to add to your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[150px]">
                  <Input
                    placeholder="Stock ticker (e.g., AAPL)"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <Button 
                  onClick={addStock} 
                  disabled={loading}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Stock
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Your Portfolio</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your stock holdings and track performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stocks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No stocks in your portfolio yet</p>
                  <p className="text-muted-foreground text-sm mt-2">Add some stocks to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Ticker</TableHead>
                        <TableHead className="text-foreground">Quantity</TableHead>
                        <TableHead className="text-foreground">Price</TableHead>
                        <TableHead className="text-foreground">Total Value</TableHead>
                        <TableHead className="text-foreground">Change</TableHead>
                        <TableHead className="text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocks.map((stock, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-foreground">{stock.ticker}</TableCell>
                          <TableCell className="text-foreground">{stock.quantity}</TableCell>
                          <TableCell className="text-foreground">${stock.price.toFixed(2)}</TableCell>
                          <TableCell className="text-foreground">${stock.totalValue.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={stock.change && stock.change >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                              {stock.change && stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeStock(stock.ticker)}
                              className="text-red-500 hover:text-red-700 border-red-500/20 hover:border-red-500/40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
