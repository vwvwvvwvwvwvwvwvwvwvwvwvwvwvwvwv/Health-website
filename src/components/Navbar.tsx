'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { name: '🏠 主页', href: '/' },
  { name: '🔥 热量计算器', href: '/calculator' },
  { name: '📊 历史统计', href: '/statistics' },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <div className="bg-white border-b-3 border-black shadow-neo pointer-events-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 0 }}
              className="bg-toon-dark text-toon-yellow px-6 py-3 rounded-neo border-3 border-toon-yellow shadow-neo transform -rotate-2 transition-transform cursor-pointer"
            >
              <h1 className="text-2xl font-black tracking-widest">ToonFit</h1>
            </motion.div>
          </Link>

          <div className="flex gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "px-6 py-3 rounded-neo border-3 border-black font-bold text-base transition-all",
                      isActive 
                        ? "bg-toon-yellow shadow-neo text-black" 
                        : "bg-white shadow-sm hover:shadow-neo hover:bg-toon-yellow/20"
                    )}
                  >
                    {item.name}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
