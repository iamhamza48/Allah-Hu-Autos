import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the route changes, instantly jump to X: 0, Y: 0
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component renders nothing to the screen
};

export default ScrollToTop;