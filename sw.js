// ดึงระบบเบื้องหลังของ OneSignal มาทำงาน (แทนโค้ด push ยาวๆ ของเดิม)
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

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
