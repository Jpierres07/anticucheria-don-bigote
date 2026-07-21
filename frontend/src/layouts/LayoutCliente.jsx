import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LayoutCliente = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 container-custom py-6">
        <Outlet />
      </main>
      <footer className="bg-zinc-900/50 border-t border-white/5 py-6 text-center text-xs text-zinc-500">
        <p>© 2026 Anticuchería Don Bigote - Jr. Santa Gadea N° 664, Huaraz</p>
        <p className="mt-1 text-[11px]">Dev: Jean-Pierre Shuan</p>
      </footer>
    </div>
  );
};

export default LayoutCliente;
