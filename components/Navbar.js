'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // Install lucide-react for icons: `yarn add lucide-react`

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-black border-b shadow-sm px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-600">
        <Link href="/">AiForge</Link>
      </div>

      {/* Desktop Links */}
      <div className="space-x-4 hidden md:flex items-center">
        <Link href="/generate" className="text-gray-300 hover:text-blue-600">Generate</Link>
        <Link href="/edit" className="text-gray-300 hover:text-blue-600">Edit</Link>
        <Link href="/articles" className="text-gray-300 hover:text-blue-600">Articles</Link>
        <Link href="/login">
          <button className="px-4 py-2 border rounded-md text-sm font-medium text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Hamburger Icon - mobile only */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black shadow-md px-6 py-4 flex flex-col space-y-3 md:hidden z-50">
          <Link href="/generate" className="text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Generate</Link>
          <Link href="/edit" className="text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Edit</Link>
          <Link href="/articles" className="text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Articles</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <button className="w-full px-4 py-2 border rounded-md text-sm font-medium text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition">
              Login
            </button>
          </Link>
          <Link href="/signup" onClick={() => setMenuOpen(false)}>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition">
              Sign Up
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
