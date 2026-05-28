const KEY = "aguka.session";

export const tabSession = {
  get: () => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (data: object) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(KEY, JSON.stringify(data));
  },
  clear: () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(KEY);
  },
  getRole: () => tabSession.get()?.role ?? null,
  getToken: () => tabSession.get()?.token ?? null,
  getRefreshToken: () => tabSession.get()?.refreshToken ?? null,
};
