import {
  Facebook,
  Instagram,
  Youtube,
  Send,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const social = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/share/1DLfEnitkJ/",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/lekhok_tripura_publishers?igsh=MTJmMTZjcnVwM3NyeQ==",
  },
  {
    icon: Youtube,
    href: "https://youtube.com/@lekhoktripura?si=1dc97jaclcr8Gzs2",
  },
];

export default function FooterSection() {
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

        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}

          <div>

            <div className="flex items-center gap-4">

              <img
                src="/logo.png"
                alt="Lekhok"
                className="h-14 w-14"
              />

              <div>

                <h2 className="text-2xl font-bold tracking-[0.3em] text-white">
                  LEKHOK TRIPURA
                </h2>

                <p className="text-white/45">
                  Premium eBooks
                </p>

              </div>

            </div>

            <p className="mt-8 max-w-md text-lg leading-8 text-white/60">
              Discover premium ebooks, purchase securely,
              and enjoy an immersive online reading
              experience designed for lifelong learners.
            </p>

            {/* Newsletter */}

            <div className="mt-10 flex overflow-hidden rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl">

              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-6 text-white outline-none placeholder:text-white/40"
              />

              <button className="m-2 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105">

                Subscribe

                <Send size={16} />

              </button>

            </div>

          </div>

          {/* Platform */}

          <div>

            <h3 className="mb-6 text-lg font-semibold text-white">
              Platform
            </h3>

            <div className="space-y-4">

              {[
                { name: "Library", to: "/library" },
                { name: "Publish with Us", to: "/reader" },
                { name: "Admin Dashboard", to: "/admin" }
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
                "Help Center",
                "FAQ",
                "Privacy Policy",
                "Terms",
              ].map((item) => (

                <a
                  href="#"
                  key={item}
                  className="group flex items-center justify-between text-white/60 transition hover:text-white"
                >

                  {item}

                  <ArrowUpRight
                    size={16}
                    className="opacity-0 transition group-hover:opacity-100"
                  />

                </a>

              ))}

            </div>

          </div>

          {/* Community */}

          <div>

            <h3 className="mb-6 text-lg font-semibold text-white">
              Community
            </h3>

            <div className="flex gap-4">

              {social.map((item, index) => {

                const Icon = item.icon;

                return (

                  <motion.a
                    key={index}
                    href={item.href}
                    whileHover={{
                      y: -5,
                    }}
                    className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur-xl transition hover:border-cyan-400/30"
                  >
                    <Icon size={20} />
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

        {/* Divider */}

        <div className="my-14 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {/* Bottom */}

        <div className="flex flex-col gap-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 LEKHOK TRIPURA. All rights reserved.
          </p>

          <div className="flex gap-8">

            <a href="#">
              Privacy
            </a>

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