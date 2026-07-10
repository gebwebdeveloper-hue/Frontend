import PageTransition from "../components/PageTransition.jsx";
import HeroSection from "../sections/HeroSection.jsx";
import FeaturedBooksSection from "../sections/FeaturedBooksSection.jsx";
import CategoriesSection from "../sections/CategoriesSection.jsx";
import WhyChooseUsSection from "../sections/WhyChooseUsSection.jsx";
import ReadingExperienceSection from "../sections/ReadingExperienceSection.jsx";
import BestsellerShowcaseSection from "../sections/BestsellerShowcaseSection.jsx";
import ReadingDevicesSection from "../sections/ReadingDevicesSection.jsx";
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
      <WhyChooseUsSection />
      <ReadingExperienceSection />
      <BestsellerShowcaseSection />
      <ReadingDevicesSection />
      <TestimonialsSection />
      <div id="faq"><FaqSection /></div>
      <CtaSection />
      <FooterSection />
    </PageTransition>
  );
}
