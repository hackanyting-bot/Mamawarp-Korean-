self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
    // ให้ดึงข้อมูลจากเน็ตเวิร์กปกติ เพื่อไม่ให้ไปกวนการดึงข้อมูลจาก Supabase
    e.respondWith(fetch(e.request).catch(() => {
        return new Response("คุณกำลังออฟไลน์ กรุณาเชื่อมต่ออินเทอร์เน็ต");
    }));
});
