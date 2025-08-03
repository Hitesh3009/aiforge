'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [generateDropdownOpen, setGenerateDropdownOpen] = useState(false);
  const [mobileGenerateOpen, setMobileGenerateOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    let token = localStorage.getItem('token');
    let name = localStorage.getItem('username');
    setIsLogin(!!token);
    setUsername(name);
  },[])

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLogin(false);
  }

  return (
    <nav className="bg-black border-b shadow-sm px-6 py-4 flex justify-between items-center relative">
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-600">
        <Link href="/">AiForge</Link>
      </div>

      {/* Desktop Links */}
      <div className="space-x-4 hidden md:flex items-center relative">

          {/* Generate Dropdown */}
          <div className="relative">
            <button
              onClick={() => setGenerateDropdownOpen(!generateDropdownOpen)}
              className="flex items-center text-gray-300 hover:text-blue-600 gap-1 cursor-pointer"
            >
              Generate <ChevronDown size={16} />
            </button>

            {generateDropdownOpen && (
              <div className="absolute top-8 left-0 bg-white rounded shadow-lg py-2 z-50 w-48">
                <Link
                  href={`${isLogin?'/generate/image':'/login'}`}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  onClick={() => setGenerateDropdownOpen(false)}
                >
                  Image Generation
                </Link>
                <Link
                  href={`${isLogin?'/generate/video':'/login'}`}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  onClick={() => setGenerateDropdownOpen(false)}
                >
                  Video Generation
                </Link>
                <Link
                  href={`${isLogin?'/generate/speech':'/login'}`}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  onClick={() => setGenerateDropdownOpen(false)}
                >
                  Speech Generation
                </Link>
              </div>
            )}
          </div>

          <Link href={`${isLogin?'/edit':'/login'}`} className="text-gray-300 hover:text-blue-600">Edit</Link>
          <Link href={`${isLogin?'/articles':'/login'}`} className="text-gray-300 hover:text-blue-600">Articles</Link>

        {
          !isLogin ? (
            <div className='space-x-3'>
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
          ) : (<Link href="/login">
            <div className='flex justify-evenly items-center space-x-2'>
              <span className='text-purple-500'>Welcome Back, <b>{username}</b></span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition" onClick={handleLogout}>
                Logout
              </button>
            </div>

          </Link>)
        }
      </div>

      {/* Hamburger Icon - mobile only */}
      <div className="md:hidden">
        <div className='flex justify-evenly items-center space-x-2'>
          {isLogin && <span className='text-purple-500'>Welcome Back, <b>{username}</b></span>}
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black shadow-md px-6 py-4 flex flex-col space-y-3 md:hidden z-50">
                {/* Generate Dropdown in Mobile */}
                <div className="space-y-1">
                  <button
                    className="flex items-center justify-between w-full text-gray-300 font-medium"
                    onClick={() => setMobileGenerateOpen(!mobileGenerateOpen)}
                  >
                    <span>Generate</span>
                    <ChevronDown size={16} className={`${mobileGenerateOpen ? 'rotate-180' : ''} transition-transform`} />
                  </button>
                  {mobileGenerateOpen && (
                    <div className="pl-4 space-y-1">
                      <Link href={`${isLogin?'/generate/image':'/login'}`} className="block text-sm text-gray-400" onClick={() => setMenuOpen(false)}>
                        Image Generation
                      </Link>
                      <Link href={`${isLogin?'/generate/video':'/login'}`} className="block text-sm text-gray-400" onClick={() => setMenuOpen(false)}>
                        Video Generation
                      </Link>
                      <Link href={`${isLogin?'/generate/speech':'/login'}`} className="block text-sm text-gray-400" onClick={() => setMenuOpen(false)}>
                        Speech Generation
                      </Link>
                    </div>
                  )}
                </div>

                <Link href={`${isLogin?'/edit':'/login'}`} className="text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Edit</Link>
                <Link href={`${isLogin?'/articles':'/login'}`} className="text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Articles</Link>

          {
            !isLogin ? (
              <div>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 border rounded-md text-sm font-medium text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition">
                    Login
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}>
                  <button className="my-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition">
                    Sign Up
                  </button>
                </Link>
              </div>
            ) : (<Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition" onClick={handleLogout}>
                Logout
              </button>
            </Link>)
          }
        </div>
      )}
    </nav>
  );
};

export default Navbar;
