"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useTheme } from "next-themes";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/setup", label: "Setup" },
    { href: "/experiences", label: "Experiences" },
    { href: "/internships", label: "Internships" },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "nav-scrolled py-3" : "py-4 md:py-5 border-b border-[var(--border)]"
                }`}
        >
            <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto">
                <Link href="/" className="flex items-center gap-3 logo-hover">
                    <Logo className="w-8 h-8" />
                    <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">PeakPrep</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    {navLinks.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href === "/interview" && pathname.startsWith("/interview")) ||
                            (link.href === "/enterprise" && pathname.startsWith("/enterprise"));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative group inline-block transition-colors font-mono-accent text-[13px] tracking-widest ${isActive
                                    ? "text-[var(--text-primary)] font-black"
                                    : "text-[var(--text-primary)]/90 font-bold hover:text-[var(--text-primary)]"
                                    }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-1 left-0 h-[2px] bg-[#16a34a] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                                        }`}
                                />
                            </Link>
                        );
                    })}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="relative w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] flex items-center justify-center hover:border-[#16a34a]/40 transition-all"
                        aria-label="Toggle theme"
                    >
                        {mounted && (
                            theme === "dark" ? (
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )
                        )}
                    </button>

                    <div className="flex items-center gap-4 border-l border-[var(--border)] pl-4 ml-2">
                        <Show when="signed-out">
                            <SignInButton forceRedirectUrl="/dashboard">
                                <button className="px-4 py-2 bg-[#16a34a] text-white text-xs font-bold rounded-lg hover:bg-[#15803d] transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </Show>
                        <Show when="signed-in">
                            <UserButton />
                        </Show>
                    </div>
                </div>

                {/* Mobile: Theme + Auth + Hamburger */}
                <div className="flex md:hidden items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] flex items-center justify-center"
                        aria-label="Toggle theme"
                    >
                        {mounted && (
                            theme === "dark" ? (
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )
                        )}
                    </button>

                    <Show when="signed-in">
                        <UserButton />
                    </Show>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] flex items-center justify-center"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? (
                            <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--card-bg)] border-b border-[var(--border)] shadow-lg">
                    <div className="flex flex-col px-4 py-4 space-y-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                                        ? "bg-[#16a34a]/10 text-[#16a34a] font-black tracking-wide"
                                        : "text-[var(--text-primary)]/80 font-bold tracking-wide hover:bg-[#16a34a]/5 hover:text-[var(--text-primary)]"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <Show when="signed-out">
                            <SignInButton forceRedirectUrl="/dashboard">
                                <button className="mt-2 w-full px-4 py-3 bg-[#16a34a] text-white text-sm font-bold rounded-lg hover:bg-[#15803d] transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </Show>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
