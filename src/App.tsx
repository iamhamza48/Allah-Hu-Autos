import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";

import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import LoadingState from "./components/LoadingState";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SearchPage = lazy(() => import("./pages/Search"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Booking = lazy(() => import("./pages/Booking"));
const VehicleProducts = lazy(() => import("./pages/VehicleProducts"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"));
const ModificationServices = lazy(() => import("./pages/ModificationServices"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));

// Lazy-loaded Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminInventory = lazy(() => import("./pages/admin/Inventory"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminVehicles = lazy(() => import("./pages/admin/Vehicles"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminImageUploader = lazy(() => import("./pages/admin/Imageuploader"));
const AdminServices = lazy(() => import("./pages/admin/Services"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <Suspense fallback={<LoadingState />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/category/:slug" element={<CategoryDetail />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/car-modification" element={<ModificationServices />} />
                  <Route path="/car-modification/:serviceId" element={<ServiceDetail />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/vehicles/:vehicleId/products" element={<VehicleProducts />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Standalone admin application — intentionally outside the public layout. */}
                <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="vehicles" element={<AdminVehicles />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="images" element={<AdminImageUploader />} />
                  <Route path="services" element={<AdminServices />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
