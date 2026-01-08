class BinanceService {
  constructor() {
    this.ws = null;
    this.subscriptions = new Map();
    this.priceData = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    try {
      this.ws = new WebSocket('wss://fstream.binance.com/ws');
      
      this.ws.onopen = () => {
        console.log('Binance WebSocket connected');
        this.reconnectAttempts = 0;
        // Resubscribe to all symbols after reconnection
        this.subscriptions.forEach((callback, symbol) => {
          this.subscribe(symbol, callback);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.s && data.p) { // Symbol and price
            this.priceData.set(data.s, {
              symbol: data.s,
              price: parseFloat(data.p),
              priceChange: data.P ? parseFloat(data.P) : 0,
              volume: data.v ? parseFloat(data.v) : 0,
              timestamp: Date.now()
            });
            
            // Notify subscribers
            const callback = this.subscriptions.get(data.s);
            if (callback) {
              callback(this.priceData.get(data.s));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Binance WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to Binance WebSocket:', error);
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribe(symbol, callback) {
    const cleanSymbol = symbol.replace('/', '').toLowerCase();
    this.subscriptions.set(symbol, callback);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        method: 'SUBSCRIBE',
        params: [`${cleanSymbol}@ticker`],
        id: Date.now()
      };
      this.ws.send(JSON.stringify(subscribeMessage));
    }
  }

  unsubscribe(symbol) {
    this.subscriptions.delete(symbol);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const cleanSymbol = symbol.replace('/', '').toLowerCase();
      const unsubscribeMessage = {
        method: 'UNSUBSCRIBE',
        params: [`${cleanSymbol}@ticker`],
        id: Date.now()
      };
      this.ws.send(JSON.stringify(unsubscribeMessage));
    }
  }

  getPrice(symbol) {
    return this.priceData.get(symbol);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.priceData.clear();
  }
}

// Popular trading pairs for futures
export const POPULAR_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'BNBUSDT',
  'XRPUSDT', 'DOTUSDT', 'LTCUSDT', 'AVAXUSDT', 'MATICUSDT',
  'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'FILUSDT', 'ICPUSDT',
  'VETUSDT', 'THETAUSDT', 'FTMUSDT', 'ALGOUSDT', 'AAVEUSDT',
  'MKRUSDT', 'COMPUSDT', 'SUSHIUSDT', 'CRVUSDT', 'YFIUSDT',
  'ENJUSDT', 'MANAUSDT', 'SANDUSDT', 'AXSUSDT', 'GALAUSDT'
];

export default new BinanceService();
