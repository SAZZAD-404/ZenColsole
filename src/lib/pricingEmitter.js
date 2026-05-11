import { EventEmitter } from "events";

// Global singleton — shared across Next.js route modules
if (!global._pricingEmitter) {
  global._pricingEmitter = new EventEmitter();
  global._pricingEmitter.setMaxListeners(50);
}

export const pricingEmitter = global._pricingEmitter;
