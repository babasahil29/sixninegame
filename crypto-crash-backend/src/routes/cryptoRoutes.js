const express = require('express');
const router = express.Router();
const CryptoController = require('../controllers/CryptoController');
const { validateCryptoConversion } = require('../middleware/validation');
const { limiters } = require('../middleware/rateLimiter');

// Get current crypto prices
router.get('/prices', limiters.cryptoPrices, CryptoController.getCurrentPrices);

// Get specific crypto price
router.get('/price/:cryptocurrency', limiters.cryptoPrices, CryptoController.getPrice);

// Convert USD to crypto
router.post('/convert/usd-to-crypto', limiters.general, validateCryptoConversion, CryptoController.convertUsdToCrypto);

// Convert crypto to USD
router.post('/convert/crypto-to-usd', limiters.general, validateCryptoConversion, CryptoController.convertCryptoToUsd);

// Get supported cryptocurrencies
router.get('/supported', limiters.general, CryptoController.getSupportedCryptocurrencies);

// Get cache status (for debugging)
router.get('/cache/status', limiters.general, CryptoController.getCacheStatus);

// Clear cache (for debugging)
router.post('/cache/clear', limiters.strict, CryptoController.clearCache);

module.exports = router;

