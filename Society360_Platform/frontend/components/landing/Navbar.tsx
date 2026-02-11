import Link from 'next/link';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';
import { RiMenu4Line, RiCloseLine } from 'react-icons/ri';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 12);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'About', href: '#about' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-200
                ${scrolled || mobileMenuOpen
                    ? 'bg-[#0b1220]/95 backdrop-blur-lg border-b border-white/10'
                    : 'bg-transparent'
                }`}
        >
            <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight
                               bg-clip-text text-transparent
                               bg-gradient-to-r from-indigo-400 to-cyan-400"
                >
                    Society360
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                        <Link href="/auth/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button size="sm">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-xl text-slate-200 hover:text-white transition"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <RiCloseLine /> : <RiMenu4Line />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0b1220]/98 backdrop-blur-xl border-t border-white/10">
                    <div className="px-6 py-5 flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-300 hover:text-white transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
                            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-center">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
