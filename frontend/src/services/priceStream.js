// Lightweight Binance combined streams manager.
// Configure base via VITE_BINANCE_WS_BASE (e.g. wss://stream.binancefuture.com/stream)
// or pass a full base URL to setBase.
class PriceStream {
  constructor() {
    this.base = import.meta.env?.VITE_BINANCE_WS_BASE || null;
    this.ws = null;
    this.subscribers = new Map(); // symbol -> Set(callback)
    this.streams = new Set();
    this.reconnectDelay = 1000;
  }

  setBase(url) {
    this.base = url;
    this.restart();
  }

  subscribe(symbol, cb) {
    const s = symbol.toLowerCase();
    if (!this.subscribers.has(s)) this.subscribers.set(s, new Set());
    this.subscribers.get(s).add(cb);
    this.streams.add(`${s}@trade`);
    this.restart();
    return () => this.unsubscribe(symbol, cb);
  }

  unsubscribe(symbol, cb) {
    const s = symbol.toLowerCase();
    const set = this.subscribers.get(s);
    if (set) {
      set.delete(cb);
      if (set.size === 0) {
        this.subscribers.delete(s);
        this.streams.delete(`${s}@trade`);
      }
    }
    this.restart();
  }

  buildUrl() {
    if (!this.base) return null;
    // If base already contains '/stream' and query, return as-is (not ideal)
    // For combined streams, Binance expects: <base>/stream?streams=btcusdt@trade/ethusdt@trade
    const streams = Array.from(this.streams);
    if (streams.length === 0) return null;
    const base = this.base.replace(/\/+$/, '');
    // if base already contains '?streams=' assume user provided full URL
    if (base.includes('?streams=')) return base;
    return `${base}/stream?streams=${streams.join('/')}`;
  }

  restart() {
    const url = this.buildUrl();
    if (!url) {
      this.close();
      return;
    }
    if (this.ws && this.ws.url === url) return; // already connected
    this.close();
    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      console.warn('PriceStream: WS constructor failed', e);
      setTimeout(() => this.restart(), this.reconnectDelay);
      return;
    }

    this.ws.onopen = () => {
      // console.log('PriceStream connected', url);
    };

    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        // combined stream returns { stream, data }
        const data = msg.data || msg;
        const s = (data.s || data.symbol || '').toLowerCase();
        const price = data.p || data.price || data.c || data.p; // p or c field
        if (!s || !price) return;
        const set = this.subscribers.get(s);
        if (!set) return;
        const numeric = Number(price);
        set.forEach(cb => {
          try { cb(numeric, data); } catch (e) { /* ignore */ }
        });
      } catch (e) {
        // ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      // reconnect shortly if we still have streams
      if (this.streams.size > 0) setTimeout(() => this.restart(), this.reconnectDelay);
    };

    this.ws.onerror = () => {
      // error -> close to trigger reconnect
      try { this.ws.close(); } catch (e) {}
    };
  }

  close() {
    if (this.ws) {
      try { this.ws.onopen = this.ws.onmessage = this.ws.onclose = this.ws.onerror = null; this.ws.close(); } catch (e) {}
      this.ws = null;
    }
  }
}

const instance = new PriceStream();
export default instance;
