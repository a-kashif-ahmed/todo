// src/components/ui/navbar/page.tsx
import { Bell, Zap, Search } from "lucide-react";

export default function Navbar() {
  return (
    <div className="flex  w-full">
      <nav className="w-1/1.5 h-14 bg-surface  text-gray-400 flex items-center px-6 gap-5">
        <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-full px-5 py-2 flex-1 min-w-0">
          <Search size={15} className="flex-shrink-0 text-gray-500" />
          <input
            type="text"
            placeholder="Search resources..."
            className="bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-full"
          />
        </div>
        {/* Logo */}
        {/* <span className="text-white font-semibold tracking-tight whitespace-nowrap">
          FlowLens
        </span> */}

        {/* Nav links */}
        {/* <a href="#" className="text-sm hover:text-white transition-colors whitespace-nowrap">
          Docs
        </a>
        <a href="#" className="text-sm hover:text-white transition-colors whitespace-nowrap">
          Updates
        </a> */}

        {/* Search — bigger capsule */}
        

        {/* Icons */}
        <button className="hover:text-white transition-colors flex-shrink-0">
          <Bell size={17} />
        </button>
        <button className="hover:text-white transition-colors flex-shrink-0">
          <Zap size={17} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-gray-400">U</span>
        </div>

      </nav>
    </div>
  );
}