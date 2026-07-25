export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    PROFILE: "/auth/profile",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },
  CUSTOMERS: {
    LIST: "/customers",
    CREATE: "/customers",
    UPDATE: (id) => `/customers/${id}`,
    DELETE: (id) => `/customers/${id}`,
  },
  PACKAGES: {
    LIST: "/packages",
    CREATE: "/packages",
    UPDATE: (id) => `/packages/${id}`,
    DELETE: (id) => `/packages/${id}`,
  },
  TRANSACTIONS: {
    LIST: "/transactions",
    CREATE: "/transactions",
  },
  SOUVENIRS: {
    LIST: "/souvenirs",
    CREATE: "/souvenirs",
    UPDATE: (id) => `/souvenirs/${id}`,
    DELETE: (id) => `/souvenirs/${id}`,
    REDEEM: "/souvenirs/redeem",
    REDEMPTIONS_LIST: "/souvenirs/redemptions",
    UPDATE_REDEMPTION_STATUS: (id) => `/souvenirs/redemptions/${id}/status`,
  },
  CUSTOMER: {
    LOGIN: "/customer/login",
    PROFILE: "/customer/profile",
    HISTORY: "/customer/history",
    REDEEM: "/customer/redeem",
  },
  ATTENDANCE: {
    LIST: "/attendance",
    CREATE: "/attendance",
    UPDATE: (id) => `/attendance/${id}`,
    DELETE: (id) => `/attendance/${id}`,
    CHECK_IN: "/attendance/check-in",
    CHECK_OUT: "/attendance/check-out",
  },
  EXPENSES: {
    LIST: "/expenses",
    CREATE: "/expenses",
    DELETE: (id) => `/expenses/${id}`,
  },
  REPORTS: {
    VISITORS: "/reports/visitors",
    ATTENDANCE: "/reports/attendance",
    FINANCE: "/reports/finance",
  },
};
