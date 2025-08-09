/**
 * Validation middleware for API endpoints
 */

/**
 * Validate player ID format
 * @param {string} playerId - Player ID to validate
 * @returns {boolean} True if valid
 */
const isValidPlayerId = (playerId) => {
  return typeof playerId === 'string' && 
         playerId.length >= 3 && 
         playerId.length <= 50 && 
         /^[a-zA-Z0-9_-]+$/.test(playerId);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
const isValidUsername = (username) => {
  return typeof username === 'string' && 
         username.length >= 3 && 
         username.length <= 20 && 
         /^[a-zA-Z0-9_-]+$/.test(username);
};

/**
 * Validate cryptocurrency type
 * @param {string} cryptocurrency - Cryptocurrency to validate
 * @returns {boolean} True if valid
 */
const isValidCryptocurrency = (cryptocurrency) => {
  return ['bitcoin', 'ethereum'].includes(cryptocurrency);
};

/**
 * Validate positive number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid positive number
 */
const isPositiveNumber = (value) => {
  return typeof value === 'number' && value > 0 && !isNaN(value) && isFinite(value);
};

/**
 * Validate non-negative number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid non-negative number
 */
const isNonNegativeNumber = (value) => {
  return typeof value === 'number' && value >= 0 && !isNaN(value) && isFinite(value);
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>\"'&]/g, '');
};

/**
 * Middleware to validate bet placement request
 */
const validateBetRequest = (req, res, next) => {
  const { playerId, usdAmount, cryptocurrency } = req.body;

  const errors = [];

  if (!playerId) {
    errors.push('Player ID is required');
  } else if (!isValidPlayerId(playerId)) {
    errors.push('Player ID must be 3-50 characters long and contain only letters, numbers, underscores, and hyphens');
  }

  if (usdAmount === undefined || usdAmount === null) {
    errors.push('USD amount is required');
  } else if (!isPositiveNumber(usdAmount)) {
    errors.push('USD amount must be a positive number');
  } else if (usdAmount > 10000) {
    errors.push('USD amount cannot exceed $10,000 per bet');
  } else if (usdAmount < 0.01) {
    errors.push('USD amount must be at least $0.01');
  }

  if (!cryptocurrency) {
    errors.push('Cryptocurrency is required');
  } else if (!isValidCryptocurrency(cryptocurrency)) {
    errors.push('Cryptocurrency must be bitcoin or ethereum');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.playerId = sanitizeString(playerId);
  req.body.cryptocurrency = sanitizeString(cryptocurrency);

  next();
};

/**
 * Middleware to validate cashout request
 */
const validateCashoutRequest = (req, res, next) => {
  const { playerId } = req.body;

  const errors = [];

  if (!playerId) {
    errors.push('Player ID is required');
  } else if (!isValidPlayerId(playerId)) {
    errors.push('Player ID must be 3-50 characters long and contain only letters, numbers, underscores, and hyphens');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.playerId = sanitizeString(playerId);

  next();
};

/**
 * Middleware to validate player creation request
 */
const validatePlayerCreation = (req, res, next) => {
  const { playerId, username, initialBalance } = req.body;

  const errors = [];

  if (!playerId) {
    errors.push('Player ID is required');
  } else if (!isValidPlayerId(playerId)) {
    errors.push('Player ID must be 3-50 characters long and contain only letters, numbers, underscores, and hyphens');
  }

  if (!username) {
    errors.push('Username is required');
  } else if (!isValidUsername(username)) {
    errors.push('Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens');
  }

  if (initialBalance) {
    if (initialBalance.bitcoin !== undefined && !isNonNegativeNumber(initialBalance.bitcoin)) {
      errors.push('Initial Bitcoin balance must be a non-negative number');
    }
    if (initialBalance.ethereum !== undefined && !isNonNegativeNumber(initialBalance.ethereum)) {
      errors.push('Initial Ethereum balance must be a non-negative number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.playerId = sanitizeString(playerId);
  req.body.username = sanitizeString(username);

  next();
};

/**
 * Middleware to validate wallet transaction request
 */
const validateWalletTransaction = (req, res, next) => {
  const { playerId, amount, cryptocurrency } = req.body;

  const errors = [];

  if (!playerId) {
    errors.push('Player ID is required');
  } else if (!isValidPlayerId(playerId)) {
    errors.push('Player ID must be 3-50 characters long and contain only letters, numbers, underscores, and hyphens');
  }

  if (amount === undefined || amount === null) {
    errors.push('Amount is required');
  } else if (!isPositiveNumber(amount)) {
    errors.push('Amount must be a positive number');
  } else if (amount > 1000) {
    errors.push('Amount cannot exceed 1000 crypto units per transaction');
  }

  if (!cryptocurrency) {
    errors.push('Cryptocurrency is required');
  } else if (!isValidCryptocurrency(cryptocurrency)) {
    errors.push('Cryptocurrency must be bitcoin or ethereum');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.playerId = sanitizeString(playerId);
  req.body.cryptocurrency = sanitizeString(cryptocurrency);

  next();
};

/**
 * Middleware to validate transfer request
 */
const validateTransferRequest = (req, res, next) => {
  const { fromPlayerId, toPlayerId, amount, cryptocurrency } = req.body;

  const errors = [];

  if (!fromPlayerId) {
    errors.push('From Player ID is required');
  } else if (!isValidPlayerId(fromPlayerId)) {
    errors.push('From Player ID must be 3-50 characters long and contain only letters, numbers, underscores, and hyphens');
  }

  if (!toPlayerId) {
    errors.push('To Player ID is required');
  } else if (!isValidPlayerId(toPlayerId)) {
    errors.push('To Player ID must be 3-50 characters long and contain only letters, numbers, underscores, and hyphens');
  }

  if (fromPlayerId === toPlayerId) {
    errors.push('Cannot transfer to the same player');
  }

  if (amount === undefined || amount === null) {
    errors.push('Amount is required');
  } else if (!isPositiveNumber(amount)) {
    errors.push('Amount must be a positive number');
  } else if (amount > 1000) {
    errors.push('Amount cannot exceed 1000 crypto units per transfer');
  }

  if (!cryptocurrency) {
    errors.push('Cryptocurrency is required');
  } else if (!isValidCryptocurrency(cryptocurrency)) {
    errors.push('Cryptocurrency must be bitcoin or ethereum');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.fromPlayerId = sanitizeString(fromPlayerId);
  req.body.toPlayerId = sanitizeString(toPlayerId);
  req.body.cryptocurrency = sanitizeString(cryptocurrency);

  next();
};

/**
 * Middleware to validate crypto conversion request
 */
const validateCryptoConversion = (req, res, next) => {
  const { usdAmount, cryptoAmount, cryptocurrency } = req.body;

  const errors = [];

  if (usdAmount !== undefined && !isPositiveNumber(usdAmount)) {
    errors.push('USD amount must be a positive number');
  }

  if (cryptoAmount !== undefined && !isPositiveNumber(cryptoAmount)) {
    errors.push('Crypto amount must be a positive number');
  }

  if (!usdAmount && !cryptoAmount) {
    errors.push('Either USD amount or crypto amount is required');
  }

  if (!cryptocurrency) {
    errors.push('Cryptocurrency is required');
  } else if (!isValidCryptocurrency(cryptocurrency)) {
    errors.push('Cryptocurrency must be bitcoin or ethereum');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.cryptocurrency = sanitizeString(cryptocurrency);

  next();
};

/**
 * Middleware to validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }
    req.query.page = pageNum;
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a positive integer between 1 and 100'
      });
    }
    req.query.limit = limitNum;
  }

  next();
};

module.exports = {
  validateBetRequest,
  validateCashoutRequest,
  validatePlayerCreation,
  validateWalletTransaction,
  validateTransferRequest,
  validateCryptoConversion,
  validatePagination,
  isValidPlayerId,
  isValidUsername,
  isValidCryptocurrency,
  isPositiveNumber,
  isNonNegativeNumber,
  sanitizeString
};

