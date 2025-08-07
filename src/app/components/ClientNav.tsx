"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function ClientNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="ml-auto flex items-center relative">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-3">
        <a
          href="https://admin.unlocklive.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative px-4 py-1.5 text-white font-medium rounded-sm bg-gradient-to-r from-blue-500/20 to-blue-700/20 backdrop-blur-sm border border-white/20 text-sm shadow cursor-pointer transition-colors duration-200 hover:bg-blue-500/40 focus:bg-blue-500/40"
        >
          <span className="relative z-10">UnlockLive</span>
        </a>
        <a
          href="https://admin.unlocklive.com/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="relative px-4 py-1.5 text-white font-medium rounded-sm bg-gradient-to-r from-green-500/20 to-green-700/20 backdrop-blur-sm border border-white/20 text-sm shadow cursor-pointer transition-colors duration-200 hover:bg-green-500/40 focus:bg-green-500/40"
        >
          <span className="relative z-10">Admin</span>
        </a>
        <a
          href="https://themeforest.net"
          target="_blank"
          rel="noopener noreferrer"
          className="relative px-4 py-1.5 text-white font-medium rounded-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 text-sm shadow cursor-pointer transition-colors duration-200 hover:bg-purple-500/40 focus:bg-purple-500/40"
        >
          <span className="relative z-10">Themeforest</span>
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 text-gray-300 rounded-sm hover:text-white transition-colors duration-200 cursor-pointer"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full right-4 mt-2 w-52 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl md:hidden z-50">
          <div className="py-3">
            <a
              href="https://admin.unlocklive.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block mx-3 my-2 px-4 py-1.5 text-white font-medium rounded-sm bg-gradient-to-r from-blue-500/20 to-blue-700/20 backdrop-blur-sm border border-white/20 text-sm shadow cursor-pointer transition-colors duration-200 hover:bg-blue-500/40 focus:bg-blue-500/40"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">UnlockLive</span>
            </a>
            <a
              href="https://admin.unlocklive.com/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block mx-3 my-2 px-4 py-1.5 text-white font-medium rounded-sm bg-gradient-to-r from-green-500/20 to-green-700/20 backdrop-blur-sm border border-white/20 text-sm shadow cursor-pointer transition-colors duration-200 hover:bg-green-500/40 focus:bg-green-500/40"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">Admin</span>
            </a>
            <a
              href="https://themeforest.net"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block mx-3 my-2 px-4 py-1.5 text-white font-medium rounded-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 text-sm shadow cursor-pointer transition-colors duration-200 hover:bg-purple-500/40 focus:bg-purple-500/40"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">Themeforest</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
