// src/components/storage.js

/**
 * 安全讀取與解析 localStorage 資料
 * @param {string} key - localStorage 的 Key
 * @param {any} fallbackValue - 讀取失敗或格式不符合時的備援預設值
 * @returns {any}
 */
export const getStorageItem = (key, fallbackValue) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return fallbackValue;

    // 若預設值不是字串，嘗試用 JSON 解析
    if (typeof fallbackValue !== 'string') {
      const parsed = JSON.parse(item);

      // 🛡️ 1. 陣列防呆：若預設值為陣列，解析後非陣列則啟動備援
      if (Array.isArray(fallbackValue) && !Array.isArray(parsed)) {
        console.warn(`[Storage Warning] Key "${key}" 格式錯誤 (應為陣列)，已啟動安全備援。`);
        return fallbackValue;
      }

      // 🛡️ 2. 物件防呆：若預設值為純物件，解析後非物件或是陣列/null 則啟動備援
      if (
        typeof fallbackValue === 'object' &&
        fallbackValue !== null &&
        !Array.isArray(fallbackValue)
      ) {
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          console.warn(`[Storage Warning] Key "${key}" 格式錯誤 (應為物件)，已啟動安全備援。`);
          return fallbackValue;
        }
      }

      return parsed;
    }

    return item;
  } catch (error) {
    console.error(`[Storage Error] 解析 key "${key}" 失敗，已啟動安全備援:`, error);
    return fallbackValue;
  }
};

/**
 * 安全寫入 localStorage
 * @param {string} key - localStorage 的 Key
 * @param {any} value - 要寫入的值
 */
export const setStorageItem = (key, value) => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`[Storage Error] 寫入 key "${key}" 失敗:`, error);
  }
};