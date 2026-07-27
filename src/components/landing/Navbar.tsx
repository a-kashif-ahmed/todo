"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <nav className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl shadow-2xl">
        {/* Top Row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-surface overflow-hidden">
              <img
                src="/logo.png"
                alt="FlowLens Logo"
                width={70}
                height={70}
              />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-text-primary  ">
              FlowLens
            </h1>
          </a>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-10 text-text-muted">
            <li>
              <a href="#problem" className="transition hover:text-text-primary  ">
                Problem
              </a>
            </li>
            <li>
              <a href="#solution" className="transition hover:text-text-primary  ">
                Solution
              </a>
            </li>
            <li>
              <a href="#whyus" className="transition hover:text-text-primary  ">
                Why Flowlens
              </a>
            </li>
            <li>
                <a
                  href="#feedback"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-text-primary  "
                >
                  Feedback
                </a>
              </li>
          </ul>

          {/* Desktop Button */}
          <div className="hidden lg:block">
            <a href="/login">
                <button
                
                
                className="w-full sm:w-auto rounded-xl bg-brand-orange px-8 py-3 font-semibold text-text-primary transition hover:brightness-110 disabled:opacity-50"
              >
                Get Started
              </button>
              </a>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-text-primary   shrink-0"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${isOpen ? "max-h-96 border-t border-border" : "max-h-0"
            }`}
        >
          <div className="px-6 py-5">
            <ul className="flex flex-col gap-5 text-text-muted">
              <li>
                <a
                  href="#problem"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-text-primary  "
                >
                  Problem
                </a>
              </li>
              <li>
                <a
                  href="#solution"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-text-primary  "
                >
                  Solution
                </a>
              </li>
              <li>
                <a
                  href="#whyus"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-text-primary  "
                >
                  Why Flowlens
                </a>
              </li>
              <li>
                <a
                  href="#feedback"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-text-primary  "
                >
                  Feedback
                </a>
              </li>
            </ul>
            <br />
            <a href="/login">
                <button
                
                
                className="w-full sm:w-auto rounded-xl bg-brand-orange px-8 py-3 font-semibold text-text-primary transition hover:brightness-110 disabled:opacity-50"
              >
                Get Started
              </button>
              </a>
          </div>
        </div>
      </nav>
    </header>
  );
}