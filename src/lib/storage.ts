export const storage = {
  get: (key: string): any => {
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (window.storage && window.storage.getItem) {
          // @ts-ignore
          const v = window.storage.getItem(key);
          return v ? JSON.parse(v) : null;
        }
        const lv = localStorage.getItem(key);
        return lv ? JSON.parse(lv) : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  },
  set: (key: string, val: any): void => {
    try {
      if (typeof window !== 'undefined') {
        const s = JSON.stringify(val);
        // @ts-ignore
        if (window.storage && window.storage.setItem) {
          // @ts-ignore
          window.storage.setItem(key, s);
        } else {
          localStorage.setItem(key, s);
        }
      }
    } catch (e) {}
  }
};
