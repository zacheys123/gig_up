// public/sw.js - UPDATED
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Error parsing push data:', error);
    data = {
      title: 'gigUp',
      body: 'You have a new notification',
      data: { url: '/' }
    };
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image,
    data: data.data || { url: data.url || '/' },
    actions: data.actions || [],
    tag: data.tag || 'gigUp-notification',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'gigUp', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(windowClients) {
        // Check if there's already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription change:', event);
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // You'll need to pass this dynamically
    }).then(function(subscription) {
      // Send new subscription to your server
      return fetch('/api/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
    })
  );
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}