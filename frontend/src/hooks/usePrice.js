import { useEffect, useState, useRef } from 'react';
import priceStream from '../services/priceStream';

export default function usePrice(symbol) {
  const [price, setPrice] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!symbol) return;
    const unsub = priceStream.subscribe(symbol, (p) => {
      if (!mounted.current) return;
      setPrice(p);
    });
    return () => { mounted.current = false; unsub(); };
  }, [symbol]);

  return price;
}
