import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MapPin,
  Send,
  ArrowUpRight,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { API_BASE } from "../config.js";

const social = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/lekhoktripurapublishers",
    icon: (props) => <Facebook {...props} />,
    color: "hover:border-[#1877F2]/50 hover:text-[#1877F2]"
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/lekhok_tripura_publishers/",
    icon: (props) => <Instagram {...props} />,
    color: "hover:border-[#E4405F]/50 hover:text-[#E4405F]"
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@LekhokTripura",
    icon: (props) => <Youtube {...props} />,
    color: "hover:border-[#FF0000]/50 hover:text-[#FF0000]"
  },
  {
    name: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029VbBjHPVLY6d0YBZ74H2N",
    icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.826 0-3.614-.492-5.188-1.424l-.372-.222-3.854 1.01 1.028-3.757-.243-.388c-.998-1.592-1.526-3.433-1.526-5.32 0-5.503 4.478-9.981 9.984-9.981 2.665 0 5.172 1.037 7.054 2.92 1.882 1.883 2.918 4.39 2.917 7.057 0 5.505-4.478 9.983-9.983 9.983m0-21.729C6.273.114.115 6.27.115 13.843c0 2.42.632 4.783 1.83 6.862L0 24l3.418-.897c2.012 1.096 4.28 1.674 6.582 1.674 7.575 0 13.731-6.156 13.732-13.729 0-3.67-1.428-7.117-4.02-9.71-2.59-2.59-6.037-4.019-9.712-4.019"/>
      </svg>
    ),
    color: "hover:border-[#25D366]/50 hover:text-[#25D366]"
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/lekhoktripurapb",
    icon: () => (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: "hover:border-white/50 hover:text-white"
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/lekhok-tripura-publishers/",
    icon: (props) => <Linkedin {...props} />,
    color: "hover:border-[#0A66C2]/50 hover:text-[#0A66C2]"
  },
  {
    name: "Threads",
    href: "https://www.threads.net/@lekhok_tripura_publishers",
    icon: () => (
      <img
        src="/Threads_(app).png"
        alt="Threads"
        className="h-5 w-5 object-contain invert brightness-200"
      />
    ),
    color: "hover:border-white/50 hover:text-white"
  },
  {
    name: "Google Location",
    href: "https://share.google/7vpNUS2mIYyADWZow",
    icon: (props) => <MapPin {...props} />,
    color: "hover:border-[#EA4335]/50 hover:text-[#EA4335]"
  }
];

const partners = [
  {
    name: "Amazon",
    tagline: "Global Store",
    icon: (
      <img
        src="/amazon_logo_icon_134611.webp"
        alt="Amazon"
        className="h-6 w-6 object-contain"
      />
    )
  },
  {
    name: "Kindle",
    tagline: "E-Book Store",
    icon: (
      <img
        src="/images (4).png"
        alt="Kindle"
        className="h-6 w-6 object-contain"
      />
    )
  },
  {
    name: "KUKU FM",
    tagline: "Audiobooks & FM",
    icon: (
      <img
        src="/channels4_profile-4.jpg"
        alt="KUKU FM"
        className="h-6 w-6 object-contain rounded-full"
      />
    )
  },
  {
    name: "Google Play Books",
    tagline: "Digital Books",
    icon: (
      <svg className="h-6 w-6 text-[#0086F4]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 0 1-1.61-.433 1.97 1.97 0 0 1-.58-1.42V3.667c0-.555.207-1.052.58-1.42.373-.368.87-.57 1.42-.433zm11.605 11.604l2.766 2.766-12.87 7.354 10.104-10.12zm0-2.836L5.11 .458l12.87 7.354-2.766 2.766zm1.418 1.418l3.652 2.087c.602.344.975.98.975 1.674 0 .694-.373 1.33-.975 1.674l-3.652 2.087-2.766-2.766 2.766-2.756z"/>
      </svg>
    )
  },
  {
    name: "Flipkart",
    tagline: "Paperback Store",
    icon: (
      <svg className="h-6 w-6 text-[#FFE500]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
      </svg>
    )
  },
  {
    name: "YouTube",
    tagline: "Audio & Media",
    icon: (
      <svg className="h-6 w-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
];

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setEmail("");
        setStatus({ type: "success", text: "Successfully subscribed!" });
      } else {
        setStatus({ type: "error", text: data.message || "Failed to subscribe." });
      }
    } catch {
      setStatus({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10">

      {/* Background Glow */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[150px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[170px]" />

      {/* Huge Background Text */}

      <h1 className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap text-[16vw] font-black uppercase text-white/[0.03]">
        LEKHOK TRIPURA
      </h1>

      <div className="section-shell relative">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16">

          {/* Brand */}

          <div>

            <div className="flex items-center gap-4">

              <img
                src="/logo.png"
                alt="Lekhok"
                className="h-14 w-14"
              />

              <div>

                <h2 className="text-xl font-bold tracking-[0.2em] text-white sm:text-2xl sm:tracking-[0.3em]">
                  LEKHOK TRIPURA
                </h2>

                <p className="text-xs sm:text-sm text-cyan-300/80 font-medium tracking-wide">
                  Publish Books & Read Unlimited Books
                </p>

              </div>

            </div>

            <p className="mt-8 max-w-md text-lg leading-8 text-white/60">
              Discover premium ebooks, purchase securely,
              and enjoy an immersive online reading
              experience designed for lifelong learners.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mt-10 max-w-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:overflow-hidden sm:rounded-full sm:border sm:border-white/10 sm:bg-white/[0.04] sm:backdrop-blur-xl">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-white outline-none placeholder:text-white/40 focus:border-cyan-400/40 sm:flex-1 sm:rounded-none sm:border-none sm:bg-transparent sm:py-3"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-60 sm:m-2 sm:rounded-full sm:py-3 shrink-0"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin text-black" />
                  ) : (
                    <>
                      Subscribe
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
              {status.text && (
                <p className={`mt-3 text-xs pl-4 font-semibold ${
                  status.type === "success" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {status.text}
                </p>
              )}
            </form>

          </div>

          {/* Platform */}

          <div>

            <h3 className="mb-6 text-lg font-semibold text-white">
              Platform
            </h3>

            <div className="space-y-4">

              {[
                { name: "Buy Books", to: "/library" },
                { name: "Read Stories", to: "/short-stories" },
                { name: "Publish with Us", to: "/reader" }
              ].map((item) => (

                <Link
                  key={item.name}
                  to={item.to}
                  className="group flex items-center justify-between text-white/60 transition hover:text-cyan-400"
                >

                  {item.name}

                  <ArrowUpRight
                    size={16}
                    className="opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />

                </Link>

              ))}

            </div>

          </div>

          {/* Resources */}

          <div>

            <h3 className="mb-6 text-lg font-semibold text-white">
              Resources
            </h3>

            <div className="space-y-4">

              {[
                { label: "Help Center", to: "/help" },
                { label: "FAQ", to: "/help" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms", to: "#" },
              ].map((item) => (

                <Link
                  to={item.to}
                  key={item.label}
                  className="group flex items-center justify-between text-white/60 transition hover:text-white"
                >

                  {item.label}

                  <ArrowUpRight
                    size={16}
                    className="opacity-0 transition group-hover:opacity-100"
                  />

                </Link>

              ))}

            </div>

          </div>

          {/* Community & Social */}

          <div>

            <h3 className="mb-6 text-lg font-semibold text-white">
              Connect With Us
            </h3>

            <div className="flex flex-wrap gap-2.5 sm:gap-3">

              {social.map((item, index) => {

                const Icon = item.icon;

                return (

                  <motion.a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.name}
                    aria-label={item.name}
                    whileHover={{
                      scale: 1.1,
                      y: -3,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 backdrop-blur-xl transition-all duration-300 ${item.color}`}
                  >
                    <Icon size={18} />
                  </motion.a>

                );

              })}

            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

              <BookOpen className="text-cyan-300" />

              <h4 className="mt-4 text-xl font-semibold text-white">
                Join 10,000+ Readers
              </h4>

              <p className="mt-3 text-sm leading-7 text-white/55">
                Get notified whenever a new premium
                ebook arrives.
              </p>

            </div>

          </div>

        </div>

        {/* Our Partners Section */}
        <div className="mt-14 pt-10 border-t border-white/10">
          <div className="flex flex-col items-center text-center gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300 bg-cyan-400/10 px-3.5 py-1 rounded-full border border-cyan-400/20">
                Publishing & Distribution Network
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2.5">Our Partners</h3>
              <p className="text-xs text-white/50 mt-1 max-w-lg">Available across leading global reading platforms, bookstores & audio services</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-2">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="group relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 sm:px-5 py-3 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.08] hover:scale-105 shadow-md"
                >
                  <div className="h-6 w-6 grid place-items-center shrink-0">
                    {partner.icon}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black text-white group-hover:text-cyan-300 transition">
                      {partner.name}
                    </span>
                    <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider">
                      {partner.tagline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}

        <div className="my-14 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {/* Bottom */}

        <div className="flex flex-col gap-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 LEKHOK TRIPURA. All rights reserved.
          </p>

          <div className="flex gap-8">

            <Link to="/privacy" className="hover:text-white transition">
              Privacy
            </Link>

            <a href="#">
              Terms
            </a>

            <a href="#">
              Cookies
            </a>

          </div>

          <p>
            Made with ❤️ in Tripura, India
          </p>

        </div>

      </div>

    </footer>
  );
}