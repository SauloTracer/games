// stores/isMobile.js
import { defineStore } from 'pinia';

export const useIsMobileStore = defineStore('isMobile', {
  state: () => ({
    isMobile: false
  }),
  actions: {
    setIsMobile(value) {
      this.isMobile = value;
    }
  }
});