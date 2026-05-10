import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";

import Layout from "./components/layout/Layout";
import AccountLayout from "./components/layout/AccountLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";

import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import SearchPage from "./pages/Search";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VehicleProducts from "./pages/VehicleProducts";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import AccountDashboard from "./pages/account/Dashboard";
import AccountOrders from "./pages/account/Orders";
import AccountBookings from "./pages/account/Bookings";
import AccountVehicles from "./pages/account/Vehicles";
import AccountAddresses from "./pages/account/Addresses";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminBookings from "./pages/admin/Bookings";
import AdminInventory from "./pages/admin/Inventory";
import AdminCustomers from "./pages/admin/Customers";
import AdminReviews from "./pages/admin/Reviews";
import AdminVehicles from "./pages/admin/Vehicles";
import AdminSettings from "./pages/admin/Settings";
import AdminImageUploader from "./pages/admin/Imageuploader";


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
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/vehicles/:vehicleId/products" element={<VehicleProducts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Account */}
              <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                <Route index element={<AccountDashboard />} />
                <Route path="orders" element={<AccountOrders />} />
                <Route path="bookings" element={<AccountBookings />} />
                <Route path="vehicles" element={<AccountVehicles />} />
                <Route path="addresses" element={<AccountAddresses />} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="vehicles" element={<AdminVehicles />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="images" element={<AdminImageUploader />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;