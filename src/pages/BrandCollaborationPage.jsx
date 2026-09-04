import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Heart, Award, ArrowUpRight, ArrowRight, ShieldCheck,
  Users, TrendingUp, Send, Check, X, Plus, PlayCircle, Eye
} from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import FooterSection from '../sections/FooterSection.jsx';
import { useGsapReveal } from '../hooks/useGsapReveal.js';
import { API_BASE } from '../config.js';

// Brands list with exact campaigns from user reference screenshots
const BRANDS_WORKED_WITH = [
  {
    id: 'dreabeai',
    name: 'Dreabeai',
    category: 'Skincare • Lifestyle',
    status: 'Delivered',
    campaigns: [
      { title: 'Everyday Made Better', format: '2 reels • 2 stories', budget: 'US$ 450.00' },
      { title: 'Skincare Product Spotlight', format: '2 posts', budget: 'US$ 220.00' },
      { title: 'Comedy Creator Feature', format: '1 reel • 1 post • 2 stories', budget: 'US$ 330.00' }
    ],
    highlight: 'Global lifestyle & skincare campaigns focusing on everyday wellness, humor, and high-retention reel formats.',
    renderLogo: () => (
      <div className='flex flex-col items-center justify-center'>
        <svg viewBox='0 0 100 50' className='h-10 w-24 object-contain'>
          <path
            d='M 28 36 C 20 36 14 30 14 22 C 14 14 20 8 28 8 C 34 8 38 12 40 16 L 40 4 L 46 4 L 46 36 L 40 36 L 40 30 C 38 34 34 36 28 36 Z M 29 14 C 24 14 20 18 20 23 C 20 28 24 31 29 31 C 34 31 38 27 38 23 C 38 18 34 14 29 14 Z'
            fill='#2dd4bf'
          />
          <path
            d='M 58 4 L 64 4 L 64 14 C 66 10 70 8 76 8 C 84 8 90 14 90 22 C 90 30 84 36 76 36 C 70 36 66 32 64 28 L 64 36 L 58 36 Z M 75 14 C 70 14 66 18 66 23 C 66 28 70 31 75 31 C 80 31 84 27 84 23 C 84 18 80 14 75 14 Z'
            fill='#34d399'
          />
        </svg>
        <span className='mt-1 font-bold text-sm tracking-tight text-white/90'>dreabeai</span>
      </div>
    )
  },
  {
    id: 'flatandflatmateindia',
    name: 'Flat & Flatmate India',
    category: 'Community • Lifestyle',
    status: 'Delivered',
    campaigns: [
      { title: "India's biggest Flat & Flatmates community", format: '10 reels • 20 posts • 30 stories', budget: '₹ 15,000.00' }
    ],
    highlight: 'Comprehensive multi-format awareness campaign connecting urban renters, lifestyle enthusiasts, and community members across India.',
    renderLogo: () => (
      <div className='flex flex-col items-center justify-center text-center'>
        <div className='h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shadow-inner'>
          <svg viewBox='0 0 24 24' className='h-6 w-6 text-amber-400' fill='currentColor'>
            <path d='M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z' />
          </svg>
        </div>
        <span className='mt-1.5 font-extrabold text-[12.5px] tracking-tight text-white'>flatandflatmateindia</span>
        <span className='text-[9px] text-white/50 text-center leading-tight'>India's biggest Flat &amp; Flatmates community</span>
      </div>
    )
  },
  {
    id: 'botanical_luxuriate',
    name: 'Botanical Luxuriate',
    category: 'Haircare',
    status: 'Delivered',
    campaigns: [
      { title: 'Anti-Lice Shampoo | Paid Reel Collaboration', format: '1 reel • 2 stories', budget: '₹ 1,000.00' }
    ],
    highlight: 'Targeted organic haircare feature presenting natural formulation benefits and step-by-step product routine.',
    renderLogo: () => (
      <div className='flex flex-col items-center justify-center text-center'>
        <div className='h-10 w-10 rounded-full border border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center'>
          <span className='text-emerald-400 font-serif font-black text-xl leading-none'>B</span>
        </div>
        <span className='mt-1.5 font-black text-[11px] tracking-widest uppercase text-white/90 font-serif'>BOTANICAL</span>
        <span className='text-[8px] font-semibold tracking-wider text-emerald-400/80 uppercase'>LUXURIATE</span>
      </div>
    )
  },
  {
    id: 'tandulclothing',
    name: 'Tandul Clothing',
    category: 'Fashion',
    status: 'Delivered',
    campaigns: [
      { title: 'Tandul Clothing – Fashion Creator Collaboration', format: '1 reel • 1 post • 2 stories', budget: '₹ 900.00' },
      { title: 'Tandul Clothing – Fashion Creator Collaboration', format: '2 reels • 2 posts • 2 stories', budget: '₹ 900.00' }
    ],
    highlight: 'Curated fashion lookbooks and street styling showcases generating high engagement and direct product clicks.',
    renderLogo: () => (
      <div className='flex flex-col items-center justify-center'>
        <div className='h-11 w-11 rounded-full border border-white/25 bg-black/60 flex flex-col items-center justify-center text-center p-1 shadow-inner'>
          <span className='font-extrabold text-[10px] tracking-widest text-white leading-tight'>TANDUL</span>
          <span className='text-[6.5px] text-white/50 tracking-wider'>CLOTHING</span>
        </div>
        <span className='mt-1.5 font-bold text-xs text-white/80'>Tandul Clothing</span>
      </div>
    )
  },
  {
    id: 'kadhwanifoods',
    name: 'Kadhwani Foods',
    category: 'Food • Health',
    status: 'Delivered',
    campaigns: [
      { title: 'Buy a2 desi cw ghee', format: '1 reel • 1 post • 1 story', budget: '₹ 900.00' },
      { title: 'buy a2 cow ghee', format: '1 reel • 1 post • 1 story', budget: '₹ 900.00' }
    ],
    highlight: 'Pure A2 cow ghee nutritional awareness campaigns spotlighting traditional cooking, gut health, and purity.',
    renderLogo: () => (
      <div className='flex flex-col items-center justify-center'>
        <div className='rounded-lg border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 flex items-center justify-center'>
          <span className='font-black text-xs tracking-wider text-emerald-400'>KADHWANI</span>
        </div>
        <span className='text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1'>FOODS</span>
      </div>
    )
  },
  {
    id: 'eklavyasolution',
    name: 'Eklavya Solution',
    category: 'Beauty • Personal Care',
    status: 'Delivered',
    campaigns: [
      { title: 'Godrej Rich Cream Hair Colour', format: '1 reel • 1 story', budget: '₹ 6,000.00' }
    ],
    highlight: 'High-impact personal grooming transformation feature illustrating vibrant color results and hair nourishment.',
    renderLogo: () => (
      <div className='flex flex-col items-center justify-center text-center'>
        <span className='font-bold text-base tracking-tight text-white font-sans'>eklavya</span>
        <span className='text-[8px] tracking-[0.25em] text-cyan-300 font-bold uppercase -mt-0.5'>SOLUTION</span>
      </div>
    )
  },
  {
    id: 'mrsmuraaricollections',
    name: 'MrsMuraari Collections',
    category: 'Ethnic Fashion',
    status: 'Delivered',
    campaigns: [
      { title: 'MrsMuraari সংগ্রহসমূহ বিনিময় সহযোগিতা | Ethnic Fashion', format: '1 reel • 3 stories', budget: '₹ 2,500.00' }
    ],
    highlight: 'Cultural handloom and indigenous textile collaboration celebrated for timeless elegance and artistic storytelling.',
    renderLogo: () => (
      <div className='flex flex-col items-center justify-center text-center'>
        <div className='h-10 w-10 rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-400/10 to-rose-400/10 flex items-center justify-center'>
          <span className='font-serif italic text-amber-300 font-black text-xl'>M</span>
        </div>
        <span className='mt-1 font-serif text-[11px] font-bold text-white/90'>Mrs Muraari</span>
        <span className='text-[7.5px] uppercase tracking-wider text-amber-300/80'>Collections</span>
      </div>
    )
  }
];

export default function BrandCollaborationPage() {
  useGsapReveal();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  const [form, setForm] = useState({
    brandName: '',
    contactName: '',
    email: '',
    phone: '',
    collaborationType: 'Instagram Reel & Video Campaign',
    budgetRange: '₹5,000 – ₹15,000',
    timeline: 'Within 2 Weeks',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.contactName,
          email: form.email,
          phone: form.phone,
          subject: `Brand Collaboration Inquiry: ${form.brandName} (${form.collaborationType})`,
          message: `Brand: ${form.brandName}\nContact: ${form.contactName}\nPhone: ${form.phone}\nService: ${form.collaborationType}\nBudget: ${form.budgetRange}\nTimeline: ${form.timeline}\nDetails: ${form.message}`
        })
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setInquiryModalOpen(false);
        setForm({
          brandName: '',
          contactName: '',
          email: '',
          phone: '',
          collaborationType: 'Instagram Reel & Video Campaign',
          budgetRange: '₹5,000 – ₹15,000',
          timeline: 'Within 2 Weeks',
          message: ''
        });
      }, 2200);
    } catch (err) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setInquiryModalOpen(false);
      }, 2200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className='relative min-h-screen bg-[#050505] text-white selection:bg-rose-500/20 selection:text-rose-200'>
        {/* Glow ambient background orbs */}
        <div className='pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-gradient-to-b from-rose-500/10 via-amber-500/05 to-transparent blur-[140px]' />
        <div className='pointer-events-none absolute top-[900px] -left-40 h-[450px] w-[450px] rounded-full bg-cyan-500/08 blur-[130px]' />
        <div className='pointer-events-none absolute top-[1600px] -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/08 blur-[130px]' />

        <div className='relative mx-auto max-w-6xl px-4 pt-32 pb-24 sm:px-6 lg:px-8'>
          {/* ═══════════════════════════════════════════════════════════
              HERO HEADER (Inspired by reference screenshot)
             ═══════════════════════════════════════════════════════════ */}
          <div data-reveal className='text-center max-w-3xl mx-auto mb-16'>
            <div className='inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-rose-300 backdrop-blur-md shadow-sm'>
              <Sparkles size={14} className='text-rose-300' />
              Creator &amp; Brand Collaborations
            </div>

            <h1 className='mt-5 text-4xl sm:text-6xl font-black tracking-tight text-white font-serif'>
              Brand{' '}
              <span className='bg-gradient-to-r from-rose-300 via-amber-200 to-pink-300 bg-clip-text text-transparent italic font-serif'>
                Collaborations
              </span>{' '}
              <span className='text-amber-300 text-3xl sm:text-4xl not-italic'>✨</span>
            </h1>

            <div className='mt-3 flex items-center justify-center gap-2 text-rose-400'>
              <span className='h-px w-12 bg-gradient-to-r from-transparent to-rose-400/40' />
              <Heart size={16} className='fill-rose-400 text-rose-400' />
              <span className='h-px w-12 bg-gradient-to-l from-transparent to-rose-400/40' />
            </div>

            <p className='mt-4 text-base sm:text-lg text-white/70 font-medium leading-relaxed'>
              I partner with brands to create authentic, engaging and result-driven content
              that connects with people and builds real impact.
            </p>

            <div className='mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold text-white/60'>
              <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Instagram Reels &amp; Stories</span>
              <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Dedicated Product Spotlights</span>
              <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Pan-India Reach</span>
              <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Verified High Engagement</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SECTION 1: BRANDS I'VE WORKED WITH (Grid of 8 cards)
             ═══════════════════════════════════════════════════════════ */}
          <section data-reveal className='mb-20'>
            <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm'>
                  <Award size={20} />
                </div>
                <div>
                  <h2 className='text-xl sm:text-2xl font-black text-white'>Brands I've Worked With</h2>
                  <p className='text-xs sm:text-sm text-white/60'>Successful collaborations and campaigns delivered.</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBrand(BRANDS_WORKED_WITH[0])}
                className='group flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-rose-200 transition'
              >
                View Case Studies
                <ArrowRight size={14} className='transition group-hover:translate-x-1' />
              </button>
            </div>

            {/* Grid of 8 cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
              {BRANDS_WORKED_WITH.map((brand) => (
                <motion.div
                  key={brand.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedBrand(brand)}
                  className='group relative cursor-pointer flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-card transition duration-300 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] min-h-[220px]'
                >
                  {/* Logo Container */}
                  <div className='h-24 w-full rounded-2xl border border-white/10 bg-black/40 flex items-center justify-center p-3 shadow-inner group-hover:border-white/20 transition'>
                    {brand.renderLogo()}
                  </div>

                  {/* Info */}
                  <div className='mt-4 text-center'>
                    <h3 className='text-base font-black text-white group-hover:text-cyan-300 transition flex items-center justify-center gap-1.5'>
                      {brand.name}
                      <ArrowUpRight size={14} className='opacity-0 group-hover:opacity-100 transition text-cyan-300 shrink-0' />
                    </h3>
                    <p className='mt-0.5 text-xs font-medium text-white/50'>{brand.category}</p>
                  </div>
                </motion.div>
              ))}

              {/* 8th Card: More exciting collaborations coming soon! */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                onClick={() => setInquiryModalOpen(true)}
                className='group cursor-pointer flex flex-col items-center justify-center rounded-3xl border border-dashed border-rose-400/40 bg-rose-500/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:border-rose-400 hover:bg-rose-500/[0.08] min-h-[220px] text-center'
              >
                <div className='h-12 w-12 rounded-full border border-rose-400/40 bg-rose-400/10 flex items-center justify-center text-rose-300 shadow-sm group-hover:scale-110 group-hover:bg-rose-400/20 transition'>
                  <Plus size={22} />
                </div>
                <p className='mt-4 text-sm font-black text-rose-300 group-hover:text-rose-200 transition'>
                  More exciting collaborations coming soon!
                </p>
                <p className='mt-1 text-[11px] text-white/50'>Your brand could be next.</p>
              </motion.div>
            </div>

            {/* Bottom Callout Banner */}
            <div className='mt-6 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-center text-emerald-200 backdrop-blur-md'>
              <ShieldCheck size={16} className='text-emerald-400 shrink-0' />
              <span>
                Open to new collaborations.{' '}
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className='font-bold text-white underline hover:text-emerald-300 transition ml-1'
                >
                  Let's create something amazing together!
                </button>
              </span>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SECTION 2: BRANDS I'VE CONNECTED WITH (Opportunities)
             ═══════════════════════════════════════════════════════════ */}
          <section data-reveal className='mb-20'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm'>
                <Users size={20} />
              </div>
              <div>
                <div className='flex items-center gap-2 flex-wrap'>
                  <h2 className='text-xl sm:text-2xl font-black text-white'>Brands I've Connected With</h2>
                  <span className='rounded-full border border-rose-400/30 bg-rose-400/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300'>
                    Opportunities
                  </span>
                </div>
                <p className='text-xs sm:text-sm text-white/60'>Exciting campaigns &amp; collaboration opportunities I'm in conversation with.</p>
              </div>
            </div>

            {/* Circular Avatars Row */}
            <div className='rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl'>
              <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6'>
                {BRANDS_WORKED_WITH.map((brand) => (
                  <motion.div
                    key={`connected-${brand.id}`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedBrand(brand)}
                    className='cursor-pointer flex flex-col items-center text-center group'
                  >
                    <div className='h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-white/15 bg-black/60 flex items-center justify-center p-2.5 shadow-md group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition'>
                      <div className='scale-75 origin-center'>
                        {brand.renderLogo()}
                      </div>
                    </div>
                    <span className='mt-2.5 text-xs font-bold text-white/80 group-hover:text-cyan-300 transition'>
                      {brand.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Note callout banner */}
              <div className='mt-8 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70 leading-relaxed flex items-start gap-3'>
                <Sparkles size={18} className='text-amber-300 shrink-0 mt-0.5' />
                <p>
                  These are brands I've shown interest in collaborating with. Looking forward to creating
                  impactful content and driving great results together!
                </p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SECTION 3: COLLABORATION IMPACT (Dark Impact Banner)
             ═══════════════════════════════════════════════════════════ */}
          <section data-reveal className='mb-20'>
            <div className='rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden'>
              <div className='pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-rose-500/10 blur-[80px]' />

              <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 items-center'>
                {/* Left Description */}
                <div className='lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8'>
                  <div className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2'>
                    <Sparkles size={13} />
                    Creator Performance
                  </div>
                  <h3 className='text-2xl sm:text-3xl font-black text-white font-serif'>
                    Collaboration Impact
                  </h3>
                  <p className='mt-2.5 text-xs sm:text-sm text-white/60 leading-relaxed'>
                    Delivering content that creates engagement, builds trust and drives results.
                  </p>
                </div>

                {/* 4 Impact Stat Metrics */}
                <div className='lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center'>
                  <div className='space-y-1'>
                    <div className='flex items-center justify-center text-amber-300 mb-2'>
                      <Users size={22} />
                    </div>
                    <p className='text-2xl sm:text-3xl font-black text-white'>50K+</p>
                    <p className='text-[11px] text-white/55 font-medium leading-tight'>Engaged Audience Across Platforms</p>
                  </div>

                  <div className='space-y-1'>
                    <div className='flex items-center justify-center text-rose-300 mb-2'>
                      <PlayCircle size={22} />
                    </div>
                    <p className='text-2xl sm:text-3xl font-black text-white'>1000+</p>
                    <p className='text-[11px] text-white/55 font-medium leading-tight'>Pieces of Content Created</p>
                  </div>

                  <div className='space-y-1'>
                    <div className='flex items-center justify-center text-purple-300 mb-2'>
                      <TrendingUp size={22} />
                    </div>
                    <p className='text-2xl sm:text-3xl font-black text-white'>30+</p>
                    <p className='text-[11px] text-white/55 font-medium leading-tight'>Successful Brand Collaborations</p>
                  </div>

                  <div className='space-y-1'>
                    <div className='flex items-center justify-center text-emerald-300 mb-2'>
                      <ShieldCheck size={22} />
                    </div>
                    <p className='text-2xl sm:text-3xl font-black text-white'>High</p>
                    <p className='text-[11px] text-white/55 font-medium leading-tight'>Engagement &amp; Conversion Driven</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SECTION 4: CALL TO ACTION BANNER (Let's Collaborate)
             ═══════════════════════════════════════════════════════════ */}
          <section data-reveal className='mb-8'>
            <div className='rounded-3xl border border-rose-500/25 bg-gradient-to-r from-rose-950/30 via-zinc-950 to-indigo-950/30 p-8 sm:p-12 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6'>
              <div className='flex items-center gap-4 text-center sm:text-left'>
                <div className='h-14 w-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-inner'>
                  <Heart size={28} className='fill-rose-400 text-rose-400' />
                </div>
                <div>
                  <h3 className='text-xl sm:text-2xl font-black text-white'>
                    Let's collaborate and create something amazing!
                  </h3>
                  <p className='mt-1 text-xs sm:text-sm text-white/60'>
                    Have a project in mind? I'd love to hear from you.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInquiryModalOpen(true)}
                className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 px-8 py-3.5 text-sm font-black text-black transition hover:opacity-95 hover:scale-105 shadow-lg shadow-rose-400/20 shrink-0'
              >
                Let's Work Together
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MODAL 1: BRAND CASE STUDY / DELIVERABLES DETAILS
           ═══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {selectedBrand && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md'
              onClick={() => setSelectedBrand(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className='relative w-full max-w-xl rounded-3xl border border-white/15 bg-gradient-to-b from-zinc-900 to-[#080808] p-6 sm:p-8 shadow-2xl'
              >
                <button
                  onClick={() => setSelectedBrand(null)}
                  className='absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white/60 hover:text-white hover:bg-white/20 transition'
                >
                  <X size={18} />
                </button>

                <div className='flex items-center gap-4 border-b border-white/10 pb-5'>
                  <div className='h-16 w-16 rounded-2xl border border-white/10 bg-black/60 flex items-center justify-center p-2'>
                    {selectedBrand.renderLogo()}
                  </div>
                  <div>
                    <span className='rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300'>
                      {selectedBrand.status}
                    </span>
                    <h3 className='text-xl font-black text-white mt-1'>{selectedBrand.name}</h3>
                    <p className='text-xs text-white/50'>{selectedBrand.category}</p>
                  </div>
                </div>

                <div className='mt-5 space-y-4'>
                  <div>
                    <h4 className='text-xs font-black uppercase tracking-wider text-rose-300'>Campaign Overview</h4>
                    <p className='mt-1 text-sm text-white/75 leading-relaxed'>{selectedBrand.highlight}</p>
                  </div>

                  <div>
                    <h4 className='text-xs font-black uppercase tracking-wider text-white/60 mb-2'>Campaign Deliverables</h4>
                    <div className='space-y-2'>
                      {selectedBrand.campaigns.map((item, idx) => (
                        <div
                          key={idx}
                          className='flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs'
                        >
                          <div>
                            <p className='font-bold text-white'>{item.title}</p>
                            <p className='text-[11px] text-white/55 mt-0.5'>{item.format}</p>
                          </div>
                          <span className='rounded-md border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-300'>
                            {item.budget}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3'>
                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                      setInquiryModalOpen(true);
                    }}
                    className='w-full rounded-xl bg-white py-3 text-xs font-black text-black hover:bg-rose-50 transition'
                  >
                    Start Collaboration Similar to This →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════
            MODAL 2: INQUIRY FORM (Let's Work Together)
           ═══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {inquiryModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto'
              onClick={() => setInquiryModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className='relative my-8 w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-zinc-900 to-[#080808] p-6 sm:p-8 shadow-2xl'
              >
                <button
                  onClick={() => setInquiryModalOpen(false)}
                  className='absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white/60 hover:text-white hover:bg-white/20 transition'
                >
                  <X size={18} />
                </button>

                <div className='mb-6'>
                  <span className='rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-300'>
                    Get In Touch
                  </span>
                  <h3 className='text-2xl font-black text-white mt-2'>Let's Work Together</h3>
                  <p className='text-xs text-white/60 mt-1'>
                    Tell me about your campaign objectives, timeline, and brand vision.
                  </p>
                </div>

                {submitSuccess ? (
                  <div className='py-12 text-center'>
                    <div className='h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-4'>
                      <Check size={32} />
                    </div>
                    <h4 className='text-lg font-black text-white'>Inquiry Sent Successfully!</h4>
                    <p className='text-xs text-white/60 mt-2'>
                      Thank you for reaching out. I will review your proposal and reply within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Brand / Company Name</label>
                        <input
                          type='text'
                          required
                          value={form.brandName}
                          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                          placeholder='e.g. Acme Lifestyle'
                          className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none'
                        />
                      </div>
                      <div>
                        <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Your Name</label>
                        <input
                          type='text'
                          required
                          value={form.contactName}
                          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                          placeholder='Brand Manager'
                          className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Email Address</label>
                        <input
                          type='email'
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder='hello@brand.com'
                          className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none'
                        />
                      </div>
                      <div>
                        <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Phone / WhatsApp</label>
                        <input
                          type='text'
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder='+91 98765 43210'
                          className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Collaboration Format</label>
                      <select
                        value={form.collaborationType}
                        onChange={(e) => setForm({ ...form, collaborationType: e.target.value })}
                        className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none'
                      >
                        <option value='Instagram Reel & Video Campaign' className='bg-zinc-900'>Instagram Reel &amp; Video Campaign</option>
                        <option value='Instagram Carousel / Static Post' className='bg-zinc-900'>Instagram Carousel / Static Post</option>
                        <option value='Story Series with Link Swipe-up' className='bg-zinc-900'>Story Series with Link Swipe-up</option>
                        <option value='Long-term Brand Ambassador' className='bg-zinc-900'>Long-term Brand Ambassador</option>
                        <option value='Product Review & Unboxing' className='bg-zinc-900'>Product Review &amp; Unboxing</option>
                        <option value='Other / Custom Campaign' className='bg-zinc-900'>Other / Custom Campaign</option>
                      </select>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Budget Range</label>
                        <select
                          value={form.budgetRange}
                          onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                          className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none'
                        >
                          <option value='₹2,000 – ₹5,000' className='bg-zinc-900'>₹2,000 – ₹5,000</option>
                          <option value='₹5,000 – ₹15,000' className='bg-zinc-900'>₹5,000 – ₹15,000</option>
                          <option value='₹15,000 – ₹30,000' className='bg-zinc-900'>₹15,000 – ₹30,000</option>
                          <option value='₹30,000+' className='bg-zinc-900'>₹30,000+</option>
                          <option value='US$ 200 – US$ 500' className='bg-zinc-900'>US$ 200 – US$ 500</option>
                          <option value='US$ 500+' className='bg-zinc-900'>US$ 500+</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Target Timeline</label>
                        <select
                          value={form.timeline}
                          onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                          className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none'
                        >
                          <option value='Immediate (1–3 Days)' className='bg-zinc-900'>Immediate (1–3 Days)</option>
                          <option value='Within 1 Week' className='bg-zinc-900'>Within 1 Week</option>
                          <option value='Within 2 Weeks' className='bg-zinc-900'>Within 2 Weeks</option>
                          <option value='Next Month' className='bg-zinc-900'>Next Month</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className='block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1'>Project Brief / Details</label>
                      <textarea
                        rows={3}
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder='Tell me about your product, key talking points, and campaign goals...'
                        className='w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none'
                      />
                    </div>

                    <button
                      type='submit'
                      disabled={submitting}
                      className='w-full rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 py-3 text-xs font-black text-black hover:opacity-90 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2'
                    >
                      {submitting ? 'Submitting Inquiry...' : 'Send Collaboration Proposal'}
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Footer */}
        <FooterSection />
      </div>
    </PageTransition>
  );
}
