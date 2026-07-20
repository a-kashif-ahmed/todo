"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">

      <nav className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

        {/* Top Row */}

        <div className="flex items-center justify-between px-6 py-4">

          {/* Logo */}

          <a href="#" className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black overflow-hidden">
              <Image
                src="/logo.png"
                alt="Flowlens Logo"
                width={70}
                height={70}
                className="object-contain"
                quality={100}
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              FlowLens
            </h1>

          </a>

          {/* Desktop Menu */}

          <ul className="hidden lg:flex items-center gap-10 text-gray-300">
            <li>
              <a
                href="#problem"
                className="transition hover:text-white"
              >
                Problem
              </a>
            </li>
            <li>
              <a
                href="#solution"
                className="transition hover:text-white"
              >
                Solution
              </a>
            </li>
            <li>
              <a
                href="#whyus"
                className="transition hover:text-white"
              >
                Why Flowlens
              </a>
            </li>

            <li>
              <a
                href="#contact"
                className="transition hover:text-white"
              >

              </a>
            </li>

          </ul>

          {/* Desktop Button */}

          <div className="hidden lg:block">

            <a href="#cta"><button className="rounded-xl bg-gradient-to-br from-emerald-300 to-lime-700 px-8 py-4 font-semibold text-white transition hover:scale-105 ">

              Start Free
            </button></a>

          </div>

          {/* Mobile Button */}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white"
          >

            {isOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}

          </button>

        </div>

        {/* Mobile Menu */}

        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${isOpen ? "max-h-96 border-t border-white/10" : "max-h-0"
            }`}
        >

          <div className="px-6 py-5">

            <ul className="flex flex-col gap-5 text-gray-300">

              <li>

                <a
                  href="#problem"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-white"
                >
                  Problem
                </a>

              </li>
              <li>

                <a
                  href="#solution"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-white"
                >
                  Solution
                </a>

              </li>
              <li>

                <a
                  href="#whyus"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-white"
                >
                  Why Flowlens
                </a>

              </li>

            </ul>
            <br />
            <a href="#cta"><button className="rounded-xl bg-gradient-to-br from-emerald-300 to-lime-700 px-8 py-4 font-semibold text-white transition hover:scale-105 ">

              Start Free
            </button></a>

          </div>

        </div>

      </nav>

    </header>
  );
}