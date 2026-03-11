import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-dark text-dark-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-black text-primary-foreground">A</span>
              </div>
              <div>
                <h3 className="font-bold">Allah-Hu-Autos</h3>
                <p className="text-xs text-muted-foreground">We Take Pride in Your Ride</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Pakistan's premium destination for automotive accessories. Quality products, expert installation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link to="/booking" className="hover:text-primary transition-colors">Book Installation</Link></li>
              <li><Link to="/search" className="hover:text-primary transition-colors">Search</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/account" className="hover:text-primary transition-colors">My Account</Link></li>
              <li><Link to="/account/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
              <li><Link to="/account/bookings" className="hover:text-primary transition-colors">My Bookings</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 Main Boulevard, Lahore</li>
              <li>📞 +92 300 1234567</li>
              <li>✉️ info@allahhuautos.pk</li>
              <li>🕐 Mon-Sat: 10AM - 9PM</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-muted/20">
        <div className="container flex h-14 items-center justify-between text-xs text-muted-foreground">
          <p>© 2026 Allah-Hu-Autos. All rights reserved.</p>
          <p>Made with ❤️ in Pakistan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
