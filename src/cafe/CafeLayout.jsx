import { Outlet } from "react-router-dom";
import CafeNavbar from "./CafeNavbar.jsx";

/**
 * CafeLayout — wraps customer-facing /cafe pages.
 * Renders the CafeNavbar at the top.
 */
export default function CafeLayout() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF5EB", color: "#2C1810" }}>
      <CafeNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
