/**
 * PDF Settings Service
 * Manages retrieval and caching of PDF settings
 */

import { http } from './httpClient';
import logger from './logger';

class PDFSettingsService {
  constructor() {
    this.cachedSettings = null;
    this.cacheExpiry = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Default settings
    this.defaultSettings = {
      companyName: 'GREEN MOOLAA BRAMPTON',
      address1: '263 QUEEN ST. E. UNIT 4',
      address2: 'BRAMPTON ON L6W 4K6',
      phone: '(905) 796-7777',
      legalTerm1: 'I, the undersigned (herein \'the seller\'), do hereby loan the item(s) above to the customer amount, the receipt of which is acknowledge by the undersigned (herein \'the Seller\'), said Seller does sell, transfer, and assign all rights, title and interest in the described property to GRN. The seller declares that the above is their own personal property free and clear of all claims and liens whatsoever and that they have the full power to sell, transfer and deliver said property as provided herein.',
      legalTerm2: 'Seller is hereby granted a customer option by GRN to repurchase the described property from GRN at a mutually agreeable price, which is set forth on this contract. The seller has (30) days from the date of this agreement to exercise this option. The seller is not obligated to exercise this option and will forfeit this option (1) days from the agreement date.',
      documentCode: 'Pawn-GR-02-CAN',
      minPaymentPercentage: 10,
      categoryDefaultText: 'Collateral',
      itemDescriptionTemplate: 'Pawn Loan Agreement'
    };
  }

  /**
   * Get PDF settings from cache or API
   * @returns {Object} PDF settings
   */
  async getSettings() {
    // Check if cache is still valid
    if (this.cachedSettings && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      logger.debug('Returning cached PDF settings');
      return this.cachedSettings;
    }

    try {
      const response = await http.get('/admin/pdf-settings');
      if (response.data && response.data.settings) {
        this.cachedSettings = response.data.settings;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        logger.debug('Fetched PDF settings from API', { settings: this.cachedSettings });
        return this.cachedSettings;
      }
    } catch (error) {
      logger.warn('Failed to fetch PDF settings, using defaults', { error: error.message });
    }

    // Return defaults if API fails
    return this.defaultSettings;
  }

  /**
   * Get a specific setting
   * @param {string} key - Setting key
   * @returns {any} Setting value
   */
  async getSetting(key) {
    const settings = await this.getSettings();
    return settings[key] !== undefined ? settings[key] : this.defaultSettings[key];
  }

  /**
   * Clear cache (useful after settings update)
   */
  clearCache() {
    this.cachedSettings = null;
    this.cacheExpiry = null;
    logger.debug('PDF settings cache cleared');
  }

  /**
   * Get all settings synchronously (if cached)
   * @returns {Object} Cached settings or defaults
   */
  getSettingsSync() {
    return this.cachedSettings || this.defaultSettings;
  }

  /**
   * Preload settings
   */
  async preload() {
    try {
      await this.getSettings();
      logger.debug('PDF settings preloaded');
    } catch (error) {
      logger.warn('Failed to preload PDF settings', { error: error.message });
    }
  }
}

export default new PDFSettingsService();
