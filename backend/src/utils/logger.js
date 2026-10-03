function maskSensitive(data) {
  if (typeof data !== 'string') return data;
  let masked = data.replace(/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)/g, (match, user, domain) => {
    return `${user[0]}***@${domain}`;
  });
  masked = masked.replace(/(\+?\d{2,3})?\d{6}(\d{4})/g, (match, prefix, suffix) => {
    return `${prefix || ''}******${suffix}`;
  });
  return masked;
}

export const logger = {
  info: (msg, ...args) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${maskSensitive(msg)}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${maskSensitive(msg)}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${maskSensitive(msg)}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${maskSensitive(msg)}`, ...args);
    }
  },
};
