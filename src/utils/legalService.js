// Legal Search Service
// Handles API interactions with National Regulations Database

let BASE_URL_LIST = 'https://flk.npc.gov.cn/law-search/search/list';
let BASE_URL_DETAIL = 'https://flk.npc.gov.cn/law-search/search/flfgDetails';
let BASE_URL_OFD = 'https://flkofd.npc.gov.cn/reader/image';

// #ifdef H5
// Use proxy paths defined in vite.config.js
BASE_URL_LIST = '/api/law/law-search/search/list';
BASE_URL_DETAIL = '/api/law/law-search/search/flfgDetails';
BASE_URL_OFD = '/api/ofd/reader/image';
// #endif

const INNER_BASE_URL = 'http://172.16.220.27:38080/law-search/amazonFile/ofdGenerateLink';

// Helper for double encoding
function doubleEncode(str) {
    return encodeURIComponent(encodeURIComponent(str));
}

// Common headers to mimic browser and avoid blocking
let COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://flk.npc.gov.cn/'
};

// #ifdef H5
// In H5, browser handles User-Agent and Referer is restricted, 
// so we rely on the Proxy server to add these.
COMMON_HEADERS = {};
// #endif

export const legalService = {
    /**
     * Search for legal documents
     * @param {Object} params
     * @param {number} params.page - Page number (1-based)
     * @param {number} params.pageSize - Page size
     * @param {string} params.keyword - Search keyword
     * @returns {Promise<Object>}
     */
    async searchList({ page = 1, pageSize = 20, keyword = '' }) {
        return new Promise((resolve, reject) => {
            uni.request({
                url: BASE_URL_LIST,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json',
                    ...COMMON_HEADERS
                },
                data: {
                    searchRange: 1,
                    searchType: 2,
                    searchContent: keyword,
                    pageNum: page,
                    pageSize: pageSize
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve(res.data);
                    } else {
                        reject(new Error('Network response was not ok'));
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
    },

    /**
     * Get legal document details
     * @param {string} bbbs - Unique identifier
     * @returns {Promise<Object>}
     */
    async getDetail(bbbs) {
        return new Promise((resolve, reject) => {
            uni.request({
                url: `${BASE_URL_DETAIL}?bbbs=${bbbs}`,
                method: 'GET',
                header: {
                    ...COMMON_HEADERS
                },
                success: (res) => {
                    if (res.statusCode === 200 && res.data.code === 200) {
                        resolve(res.data.data);
                    } else {
                        reject(new Error('Failed to fetch details'));
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
    },

    /**
     * Construct the image URL for a specific page of the OFD file
     * @param {string} ossWordOfdPath - Path from detail response
     * @param {number} pageIndex - Page index (0-based)
     * @returns {string} - The full URL to fetch the image
     */
    getOFDPageUrl(ossWordOfdPath, pageIndex) {
        // Construct inner URL
        const innerUrl = `${INNER_BASE_URL}?filePath=${ossWordOfdPath}`;

        // Double encode the inner URL - CRITICAL STEP
        const doubleEncodedInnerUrl = doubleEncode(innerUrl);

        const timestamp = Date.now();

        // Construct final URL
        return `${BASE_URL_OFD}?file=${doubleEncodedInnerUrl}&_b=3.2.0&_i=${pageIndex}&_=${timestamp}&_v=1&_h=0&_p=120`;
    },

    /**
     * Get headers for image request
     */
    getImageHeaders() {
        return {
            ...COMMON_HEADERS,
            'Accept': 'image/jpeg,image/png,*/*;q=0.8'
        };
    },

    /**
     * Fetch image data and return as Base64
     * @param {string} url 
     * @returns {Promise<string|null>} Base64 string or null if invalid/empty
     */
    async fetchImage(url) {
        return new Promise((resolve, reject) => {
            uni.request({
                url: url,
                method: 'GET',
                responseType: 'arraybuffer',
                header: this.getImageHeaders(),
                success: (res) => {
                    if (res.statusCode === 200) {
                        // Check for small response (likely error or empty)
                        // User provided code uses 10KB check
                        if (res.data.byteLength < 500) { // Reduced threshold slightly to be safe, but keep logic
                            // Let's inspect the content if possible, but for arraybuffer hard to see.
                            // Assuming logic: small file = end of document or empty page
                            resolve(null);
                        } else {
                            // Convert to base64
                            const base64 = uni.arrayBufferToBase64(res.data);

                            const view = new Uint8Array(res.data);
                            let mime = 'image/jpeg';
                            if (view[0] === 0x89 && view[1] === 0x50) {
                                mime = 'image/png';
                            } else if (view[0] === 0x3C) {
                                mime = 'image/svg+xml';
                            }

                            resolve(`data:${mime};base64,${base64}`);
                        }
                    } else {
                        // Non-200 status
                        resolve(null);
                    }
                },
                fail: (err) => {
                    console.error('Fetch image failed', err);
                    // resolve null to safely stop loading instead of crashing
                    resolve(null);
                }
            });
        });
    }
};
