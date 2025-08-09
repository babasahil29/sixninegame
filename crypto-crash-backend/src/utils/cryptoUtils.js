const crypto = require('crypto');

class CryptoUtils {
  /**
   * Generate a provably fair crash point using seed and round number
   * @param {string} seed - Random seed for the round
   * @param {number} roundNumber - Round number
   * @returns {number} Crash point between 1.00 and MAX_CRASH_MULTIPLIER
   */
  static generateCrashPoint(seed, roundNumber) {
    const maxCrash = parseFloat(process.env.MAX_CRASH_MULTIPLIER) || 120;
    
    // Create hash from seed + round number
    const hash = crypto.createHash('sha256')
      .update(seed + roundNumber.toString())
      .digest('hex');
    
    // Convert first 8 characters of hash to integer
    const hashInt = parseInt(hash.substring(0, 8), 16);
    
    // Generate crash point using exponential distribution
    // This creates a realistic crash distribution where lower multipliers are more common
    const random = hashInt / 0xffffffff; // Normalize to 0-1
    
    // Use exponential distribution for realistic crash points
    // Most crashes happen between 1x-3x, with decreasing probability for higher multipliers
    const crashPoint = Math.max(1, Math.min(maxCrash, 1 / (1 - random * 0.99)));
    
    return Math.round(crashPoint * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate a random seed for a game round
   * @returns {string} Random seed
   */
  static generateSeed() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate hash from seed and round number for verification
   * @param {string} seed - Random seed
   * @param {number} roundNumber - Round number
   * @returns {string} SHA256 hash
   */
  static generateHash(seed, roundNumber) {
    return crypto.createHash('sha256')
      .update(seed + roundNumber.toString())
      .digest('hex');
  }

  /**
   * Generate a mock transaction hash
   * @returns {string} Mock transaction hash
   */
  static generateTransactionHash() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify crash point using seed and round number
   * @param {string} seed - Original seed
   * @param {number} roundNumber - Round number
   * @param {number} crashPoint - Claimed crash point
   * @returns {boolean} True if crash point is valid
   */
  static verifyCrashPoint(seed, roundNumber, crashPoint) {
    const calculatedCrashPoint = this.generateCrashPoint(seed, roundNumber);
    return Math.abs(calculatedCrashPoint - crashPoint) < 0.01; // Allow small floating point differences
  }
}

module.exports = CryptoUtils;

