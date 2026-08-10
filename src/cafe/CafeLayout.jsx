import { Outlet } from "react-router-dom";
import CafeNavbar from "./CafeNavbar.jsx";

/**
 * CafeLayout — wraps customer-facing /cafe pages.
 * Theme: Dark Espresso Brown background with warm white & gold text.
 */
export default function CafeLayout() {
  return (
    <div className="min-h-screen text-[#FAF5EB]" style={{ background: "#140803" }}>
      <CafeNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
