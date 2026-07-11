import PageTransition from "../components/PageTransition.jsx";
import HeroSection from "../sections/HeroSection.jsx";
import FeaturedBooksSection from "../sections/FeaturedBooksSection.jsx";
import CategoriesSection from "../sections/CategoriesSection.jsx";
import BestsellingBooksSection from "../sections/BestsellingBooksSection.jsx";
import TestimonialsSection from "../sections/TestimonialsSection.jsx";
import FaqSection from "../sections/FaqSection.jsx";
import CtaSection from "../sections/CtaSection.jsx";
import FooterSection from "../sections/FooterSection.jsx";

export default function HomePage() {
  return (
    <PageTransition>
      <HeroSection />
      <FeaturedBooksSection />
      <CategoriesSection />
      <BestsellingBooksSection />
      <TestimonialsSection />
      <div id="faq"><FaqSection /></div>
      <CtaSection />
      <FooterSection />
    </PageTransition>
  );
}
