import { Link } from "react-router-dom";
import {
  Coffee, MapPin, Phone, Mail, Clock, ArrowUpRight,
  Instagram, Facebook, Youtube, Sparkles, BookOpen, Feather, Palette, ExternalLink
} from "lucide-react";

export default function CafeFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[#D4A85A]/25 bg-[#0D0502] text-[#FAF5EB] pt-16 pb-12">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#D4A85A]/5 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#A0522D]/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 pb-12 border-b border-[#D4A85A]/15">

          {/* Column 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/cafe" className="inline-flex items-center gap-3 group">
              <img
                src="/Cafe_Logo.jpeg"
                alt="Lekhok Tripura Library Cafe Logo"
                className="h-11 w-11 shrink-0 rounded-xl object-contain bg-white p-1 border border-[#D4A85A]/50 shadow-lg group-hover:scale-105 transition duration-300"
              />
              <div>
                <span className="block text-lg font-black tracking-wider uppercase text-[#FAF5EB] leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Lekhok Tripura
                </span>
                <span className="block text-[10px] font-black tracking-[0.3em] uppercase text-[#D4A85A] mt-1">
                  Library Cafe &amp; Studio
                </span>
              </div>
            </Link>

            <p className="text-xs text-white/65 leading-relaxed max-w-sm">
              A cozy literary haven crafted for readers, writers, artists, and coffee enthusiasts in Tripura. Enjoy freshly brewed artisan coffee, delicious snacks, and a noise-controlled creative space.
            </p>

            {/* Social Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              {[
                { name: "Instagram", href: "https://www.instagram.com/lekhok_tripura_publishers/", icon: Instagram },
                { name: "Facebook", href: "https://www.facebook.com/lekhoktripurapublishers", icon: Facebook },
                { name: "YouTube", href: "https://www.youtube.com/@LekhokTripura", icon: Youtube },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4A85A]/30 bg-[#1A0C06] text-[#D4A85A] hover:bg-[#D4A85A] hover:text-[#140803] hover:scale-110 transition duration-300 shadow-md"
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Cafe Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A85A] mb-4">
              Explore Cafe
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link to="/cafe" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <Coffee size={12} className="text-[#D4A85A]" /> Cafe Home
                </Link>
              </li>
              <li>
                <Link to="/cafe/menu" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#D4A85A]" /> Full Menu &amp; Ordering
                </Link>
              </li>
              <li>
                <Link to="/cafe/reserve" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <BookOpen size={12} className="text-[#D4A85A]" /> Reserve Creative Space
                </Link>
              </li>
              <li>
                <Link to="/cafe/books" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <BookOpen size={12} className="text-[#D4A85A]" /> Books in Cafe
                </Link>
              </li>
              <li>
                <Link to="/cafe/updates" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <Feather size={12} className="text-[#D4A85A]" /> Updates &amp; Spotlight
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Main Site Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A85A] mb-4">
              Publishing &amp; Library
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link to="/" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <ExternalLink size={12} className="text-[#D4A85A]" /> Main Bookstore
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <BookOpen size={12} className="text-[#D4A85A]" /> E-Book Library
                </Link>
              </li>
              <li>
                <Link to="/rentals" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#D4A85A]" /> Book Rental Club
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <Feather size={12} className="text-[#D4A85A]" /> News &amp; Articles
                </Link>
              </li>
              <li>
                <Link to="/publishing" className="hover:text-[#D4A85A] transition flex items-center gap-1.5">
                  <ExternalLink size={12} className="text-[#D4A85A]" /> Book Publishing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A85A] mb-4">
              Visit &amp; Contact
            </h4>
            
            <div className="flex items-start gap-2.5 text-xs text-white/75">
              <MapPin size={15} className="text-[#D4A85A] shrink-0 mt-0.5" />
              <span>Lekhok Tripura Publishers &amp; Cafe, Agartala, Tripura, India</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/75">
              <Phone size={14} className="text-[#D4A85A] shrink-0" />
              <a href="tel:+916033550539" className="hover:text-[#D4A85A] transition hover:underline">+91 60335 50539</a>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/75">
              <Mail size={14} className="text-[#D4A85A] shrink-0" />
              <a href="mailto:lekhok.tripura@gmail.com" className="hover:text-[#D4A85A] transition hover:underline">lekhok.tripura@gmail.com</a>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/75">
              <Clock size={14} className="text-[#D4A85A] shrink-0" />
              <span>Mon – Sun | 8:00 AM – 9:00 PM</span>
            </div>

            <a
              href="https://share.google/7vpNUS2mIYyADWZow"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-[#D4A85A]/40 bg-[#1A0C06] px-3.5 py-1.5 text-[11px] font-bold text-[#D4A85A] hover:bg-[#D4A85A] hover:text-[#140803] transition duration-300"
            >
              Open in Google Maps <ArrowUpRight size={13} />
            </a>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <p>© 2026 LEKHOK TRIPURA CAFE. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#D4A85A] transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#D4A85A] transition">Terms &amp; Conditions</Link>
            <Link to="/" className="text-[#D4A85A] font-bold hover:underline flex items-center gap-1">
              ← Main Site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
