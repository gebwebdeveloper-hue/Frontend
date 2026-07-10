import {
  BadgeCheck,
  Bookmark,
  CreditCard,
  Moon,
  MonitorSmartphone,
  RadioTower,
  ShieldCheck
} from "lucide-react";

export const features = [
  { title: "Lifetime Access", icon: BadgeCheck, copy: "Purchased books stay ready whenever readers return." },
  { title: "Secure Payments", icon: ShieldCheck, copy: "Checkout flows are designed for trust and clarity." },
  { title: "Instant Reading", icon: RadioTower, copy: "Buy once, open the PDF reader immediately." },
  { title: "Bookmark Progress", icon: Bookmark, copy: "Readers can continue without hunting for the last page." },
  { title: "Dark Mode", icon: Moon, copy: "A calm, cinematic interface for long sessions." },
  { title: "Responsive", icon: MonitorSmartphone, copy: "Optimized layouts across laptop, tablet, and phone." },
  { title: "Offline Sync", icon: CreditCard, copy: "A coming-soon capability for supported plans." }
];
