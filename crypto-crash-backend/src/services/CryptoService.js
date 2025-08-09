const axios = require('axios');

class CryptoService {
  constructor() {
    this.baseURL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
    this.cache = new Map();
    this.cacheDuration = parseInt(process.env.CACHE_DURATION) || 10000; // 10 seconds
  }

  /**
   * Get current price for a cryptocurrency
   * @param {string} cryptocurrency - 'bitcoin' or 'ethereum'
   * @returns {Promise<number>} Price in USD
   */
  async getCurrentPrice(cryptocurrency) {
    try {
      // Check cache first
      const cacheKey = `price_${cryptocurrency}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log(`Using cached price for ${cryptocurrency}: $${cached.price}`);
        return cached.price;
      }

      // Fetch from API
      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params: {
          ids: cryptocurrency,
          vs_currencies: 'usd',
          include_last_updated_at: true
        },
        timeout: 5000
      });

      if (!response.data[cryptocurrency] || !response.data[cryptocurrency].usd) {
        throw new Error(`Price not found for ${cryptocurrency}`);
      }

      const price = response.data[cryptocurrency].usd;
      const lastUpdated = response.data[cryptocurrency].last_updated_at;

      // Cache the result
      this.cache.set(cacheKey, {
        price,
        timestamp: Date.now(),
        lastUpdated: lastUpdated * 1000 // Convert to milliseconds
      });

      console.log(`Fetched fresh price for ${cryptocurrency}: $${price}`);
      return price;

    } catch (error) {
      console.error(`Error fetching price for ${cryptocurrency}:`, error.message);
      
      // Return cached price if available, even if expired
      const cacheKey = `price_${cryptocurrency}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`Using expired cached price for ${cryptocurrency}: $${cached.price}`);
        return cached.price;
      }

      // Fallback prices if API is completely unavailable
      const fallbackPrices = {
        bitcoin: 67000,
        ethereum: 3500
      };

      console.log(`Using fallback price for ${cryptocurrency}: $${fallbackPrices[cryptocurrency]}`);
      return fallbackPrices[cryptocurrency] || 1;
    }
  }

  /**
   * Get current prices for multiple cryptocurrencies
   * @param {string[]} cryptocurrencies - Array of cryptocurrency names
   * @returns {Promise<Object>} Object with prices
   */
  async getCurrentPrices(cryptocurrencies = ['bitcoin', 'ethereum']) {
    try {
      const prices = {};
      
      // Check cache for all cryptocurrencies
      const uncachedCryptos = [];
      for (const crypto of cryptocurrencies) {
        const cacheKey = `price_${crypto}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
          prices[crypto] = cached.price;
        } else {
          uncachedCryptos.push(crypto);
        }
      }

      // Fetch uncached prices
      if (uncachedCryptos.length > 0) {
        const response = await axios.get(`${this.baseURL}/simple/price`, {
          params: {
            ids: uncachedCryptos.join(','),
            vs_currencies: 'usd',
            include_last_updated_at: true
          },
          timeout: 5000
        });

        for (const crypto of uncachedCryptos) {
          if (response.data[crypto] && response.data[crypto].usd) {
            const price = response.data[crypto].usd;
            const lastUpdated = response.data[crypto].last_updated_at;

            prices[crypto] = price;

            // Cache the result
            this.cache.set(`price_${crypto}`, {
              price,
              timestamp: Date.now(),
              lastUpdated: lastUpdated * 1000
            });
          }
        }
      }

      console.log('Current crypto prices:', prices);
      return prices;

    } catch (error) {
      console.error('Error fetching crypto prices:', error.message);
      
      // Return cached or fallback prices
      const fallbackPrices = {
        bitcoin: 67000,
        ethereum: 3500
      };

      const result = {};
      for (const crypto of cryptocurrencies) {
        const cacheKey = `price_${crypto}`;
        const cached = this.cache.get(cacheKey);
        result[crypto] = cached ? cached.price : fallbackPrices[crypto] || 1;
      }

      return result;
    }
  }

  /**
   * Convert USD to cryptocurrency
   * @param {number} usdAmount - Amount in USD
   * @param {string} cryptocurrency - Target cryptocurrency
   * @returns {Promise<number>} Amount in cryptocurrency
   */
  async convertUsdToCrypto(usdAmount, cryptocurrency) {
    const price = await this.getCurrentPrice(cryptocurrency);
    return usdAmount / price;
  }

  /**
   * Convert cryptocurrency to USD
   * @param {number} cryptoAmount - Amount in cryptocurrency
   * @param {string} cryptocurrency - Source cryptocurrency
   * @returns {Promise<number>} Amount in USD
   */
  async convertCryptoToUsd(cryptoAmount, cryptocurrency) {
    const price = await this.getCurrentPrice(cryptocurrency);
    return cryptoAmount * price;
  }

  /**
   * Get supported cryptocurrencies
   * @returns {string[]} Array of supported cryptocurrency names
   */
  getSupportedCryptocurrencies() {
    return ['bitcoin', 'ethereum'];
  }

  /**
   * Clear price cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Price cache cleared');
  }

  /**
   * Get cache status
   * @returns {Object} Cache information
   */
  getCacheStatus() {
    const cacheInfo = {};
    for (const [key, value] of this.cache.entries()) {
      const age = Date.now() - value.timestamp;
      const isExpired = age > this.cacheDuration;
      cacheInfo[key] = {
        price: value.price,
        age: Math.round(age / 1000), // seconds
        expired: isExpired,
        lastUpdated: new Date(value.lastUpdated).toISOString()
      };
    }
    return cacheInfo;
  }
}

module.exports = CryptoService;

