"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { mobileMenuNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Secondary mobile menu (top right) holding the destinations that left the bottom bar. */
export function MobileMenu() {
  const pathname = usePathname();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Closes on navigation: if the route changed since the menu opened, it is no longer open.
  const open = isOpen && openedAt === pathname;

  useEffect(() => {
    if (!open) {
      return;
    }

    firstLinkRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="inline-flex size-9 items-center justify-center rounded-[10px] bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        type="button"
        onClick={() => {
          setOpenedAt(pathname);
          setIsOpen((current) => !current);
        }}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {open ? (
        <ul
          className="absolute right-0 top-11 z-50 w-48 rounded-[10px] border border-slate-100 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
          id={menuId}
        >
          {mobileMenuNavigation.map(({ href, icon: Icon, label }, index) => {
            const active = pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  ref={index === 0 ? firstLinkRef : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold transition",
                    active
                      ? "bg-[var(--color-primary-soft)] text-[#071a3d]"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                  href={href}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                  {active ? <span className="ml-auto text-xs text-slate-500">Atual</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
