'use client';

import { useEffect } from 'react';

/**
 * Mendukung akses `suarautara.vercel.app/#admin`:
 * begitu hash #admin terdeteksi, pengunjung diarahkan ke halaman admin sungguhan.
 */
export default function AdminHashRedirect() {
  useEffect(() => {
    const goToAdmin = () => {
      if (window.location.hash === '#admin') {
        window.location.replace('/admin');
      }
    };
    goToAdmin();
    window.addEventListener('hashchange', goToAdmin);
    return () => window.removeEventListener('hashchange', goToAdmin);
  }, []);

  return null;
}
