const CryptoService = require('../services/CryptoService');

class CryptoController {
  /**
   * Get current prices for all supported cryptocurrencies
   */
  static async getCurrentPrices(req, res) {
    try {
      const cryptoService = new CryptoService();
      const prices = await cryptoService.getCurrentPrices();
      
      res.json({
        success: true,
        data: {
          prices,
          timestamp: new Date().toISOString(),
          cacheDuration: process.env.CACHE_DURATION || 10000
        }
      });
    } catch (error) {
      console.error('Error getting current prices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cryptocurrency prices'
      });
    }
  }

  /**
   * Get price for a specific cryptocurrency
   */
  static async getPrice(req, res) {
    try {
      const { cryptocurrency } = req.params;
      
      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported cryptocurrency. Supported: bitcoin, ethereum'
        });
      }

      const cryptoService = new CryptoService();
      const price = await cryptoService.getCurrentPrice(cryptocurrency);
      
      res.json({
        success: true,
        data: {
          cryptocurrency,
          price,
          currency: 'usd',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting price:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cryptocurrency price'
      });
    }
  }

  /**
   * Convert USD to cryptocurrency
   */
  static async convertUsdToCrypto(req, res) {
    try {
      const { usdAmount, cryptocurrency } = req.body;

      if (!usdAmount || !cryptocurrency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: usdAmount, cryptocurrency'
        });
      }

      if (usdAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'USD amount must be positive'
        });
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported cryptocurrency. Supported: bitcoin, ethereum'
        });
      }

      const cryptoService = new CryptoService();
      const cryptoAmount = await cryptoService.convertUsdToCrypto(usdAmount, cryptocurrency);
      const price = await cryptoService.getCurrentPrice(cryptocurrency);
      
      res.json({
        success: true,
        data: {
          usdAmount,
          cryptoAmount,
          cryptocurrency,
          priceAtTime: price,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error converting USD to crypto:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert USD to cryptocurrency'
      });
    }
  }

  /**
   * Convert cryptocurrency to USD
   */
  static async convertCryptoToUsd(req, res) {
    try {
      const { cryptoAmount, cryptocurrency } = req.body;

      if (!cryptoAmount || !cryptocurrency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: cryptoAmount, cryptocurrency'
        });
      }

      if (cryptoAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Crypto amount must be positive'
        });
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported cryptocurrency. Supported: bitcoin, ethereum'
        });
      }

      const cryptoService = new CryptoService();
      const usdAmount = await cryptoService.convertCryptoToUsd(cryptoAmount, cryptocurrency);
      const price = await cryptoService.getCurrentPrice(cryptocurrency);
      
      res.json({
        success: true,
        data: {
          cryptoAmount,
          usdAmount,
          cryptocurrency,
          priceAtTime: price,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error converting crypto to USD:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert cryptocurrency to USD'
      });
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  static async getSupportedCryptocurrencies(req, res) {
    try {
      const cryptoService = new CryptoService();
      const supported = cryptoService.getSupportedCryptocurrencies();
      
      res.json({
        success: true,
        data: {
          cryptocurrencies: supported,
          count: supported.length
        }
      });
    } catch (error) {
      console.error('Error getting supported cryptocurrencies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get supported cryptocurrencies'
      });
    }
  }

  /**
   * Get cache status
   */
  static async getCacheStatus(req, res) {
    try {
      const cryptoService = new CryptoService();
      const cacheStatus = cryptoService.getCacheStatus();
      
      res.json({
        success: true,
        data: {
          cache: cacheStatus,
          cacheDuration: process.env.CACHE_DURATION || 10000,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting cache status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cache status'
      });
    }
  }

  /**
   * Clear cache
   */
  static async clearCache(req, res) {
    try {
      const cryptoService = new CryptoService();
      cryptoService.clearCache();
      
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      });
    }
  }
}

module.exports = CryptoController;

