import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const whatsappNumber = "916033550539";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Lekhok Tripura, I would like to inquire about books / publishing.")}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white shadow-[0_6px_30px_rgba(16,185,129,0.6)] backdrop-blur-md transition-all hover:shadow-[0_8px_35px_rgba(16,185,129,0.8)] group select-none border-2 border-emerald-400/40"
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp (+91 60335 50539)"
    >
      <MessageCircle size={32} className="text-white fill-white/20 transition-transform duration-300 group-hover:scale-110 stroke-[2.2]" />
    </motion.a>
  );
}
