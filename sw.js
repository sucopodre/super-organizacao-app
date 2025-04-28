const CACHE_NAME = "super-organizacao-cache-v2"; // Atualizado para v2
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css", // Corrigido para 'styles.css' (consistente com seu HTML)
  "/script.js",
  "/manifest.json",
  "/icons/icon-192x192.png", // Mantenha apenas os ícones essenciais
  "/icons/icon-512x512.png"
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Cacheando recursos estáticos");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error("[Service Worker] Falha ao cachear recursos:", err);
      })
  );
});

// Ativação e Limpeza de Cache Antigo
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("[Service Worker] Removendo cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia de Cache (Cache First)
self.addEventListener("fetch", (event) => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retorna do cache se disponível
        if (cachedResponse) {
          return cachedResponse;
        }

        // Busca na rede
        return fetch(event.request)
          .then((response) => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }

            // Faz cache dinâmico da resposta
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback para páginas offline
            if (event.request.headers.get("accept").includes("text/html")) {
              return caches.match("/offline.html");
            }
          });
      })
  );
});

// Push Notifications (Versão Unificada)
self.addEventListener("push", (event) => {
  let notificationData;
  
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: "Nova notificação",
      body: event.data.text() || "Você tem uma nova atualização"
    };
  }

  const options = {
    body: notificationData.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || "Super Organização", 
      options
    )
  );
});