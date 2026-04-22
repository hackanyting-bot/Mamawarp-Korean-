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

// ==========================================
// ส่วนที่ต้องเพิ่มใหม่สำหรับระบบแจ้งเตือนเบื้องหลัง (Background Push)
// ==========================================

// 1. ดักจับเมื่อมีสัญญาณ Push ส่งเข้ามา (ทำงานแม้จอดับ หรือพับแอปทิ้ง)
self.addEventListener('push', function(e) {
    let title = 'MAMA WRAP';
    let options = {
        body: 'มีการอัปเดตออเดอร์ หรือข้อความใหม่จากร้าน!',
        icon: '/icon.png', // แนะนำให้ใส่พาทรูปโลโก้ร้าน (ขนาด 192x192)
        badge: '/badge.png', // ไอคอนเล็กๆ บนแถบแจ้งเตือน (ถ้ามี)
        vibrate: [200, 100, 200, 100, 200], // รูปแบบการสั่น
        data: { url: '/tracking.html' } // หน้าที่จะให้เปิดเมื่อลูกค้ากดแจ้งเตือน
    };

    // ถ้ามีการส่งข้อมูลแบบ JSON พ่วงมากับ Push ให้เอามาแสดงผล
    if (e.data) {
        try {
            const payload = e.data.json();
            title = payload.title || title;
            options.body = payload.body || options.body;
            options.data.url = payload.url || options.data.url;
        } catch (err) {
            options.body = e.data.text(); // เผื่อส่งมาเป็น text ธรรมดา
        }
    }

    // สั่งให้ระบบมือถือเด้ง Notification ทะลุหน้าจอขึ้นมา
    e.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 2. ดักจับเหตุการณ์เมื่อลูกค้า "จิ้ม" ที่การแจ้งเตือน
self.addEventListener('notificationclick', function(e) {
    e.notification.close(); // ปิดป๊อปอัปแจ้งเตือนก่อน

    const targetUrl = e.notification.data.url;

    // เช็คว่าเปิดหน้าเว็บ/แอป tracking ค้างไว้อยู่ไหม ถ้าเปิดอยู่ให้ดึงกลับมาโฟกัส
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes('tracking') && 'focus' in client) {
                    return client.focus();
                }
            }
            // ถ้าแอปปิดสนิทไปแล้ว ให้เปิดหน้าต่างใหม่พาไปที่หน้า url ที่ตั้งไว้
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
