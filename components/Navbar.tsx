"use client";

import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="mb-4">
      <a
        className={`mr-4 ${pathname === "/" ? "text-white border-b" : ""}`}
        href="/"
      >
        Home
      </a>
      <a
        className={`mr-4 ${
          pathname === "/evaluate" ? "text-white border-b" : ""
        }`}
        href="/evaluate"
      >
        Evaluate
      </a>
    </nav>
  );
}
