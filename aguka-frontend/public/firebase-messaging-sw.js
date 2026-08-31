importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

function getConfigParam(name) {
  const params = new URLSearchParams(self.location.search);
  return params.get(name) || self[name] || "";
}

const firebaseConfig = {
  apiKey: getConfigParam("FIREBASE_API_KEY"),
  authDomain: getConfigParam("FIREBASE_AUTH_DOMAIN"),
  projectId: getConfigParam("FIREBASE_PROJECT_ID"),
  storageBucket: getConfigParam("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getConfigParam("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getConfigParam("FIREBASE_APP_ID"),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { title, body, icon, clickAction } = payload.data || {};
    const notificationTitle = title || "AGUKA Smart Farming";
    const notificationOptions = {
      body: body || "",
      icon: icon || "/imbaraga-logo.png",
      data: payload.data || {},
      requireInteraction: true,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const clickAction = event.notification.data?.clickAction || "/";
    event.waitUntil(clients.openWindow(clickAction));
  });
}
