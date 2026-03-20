export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-3">FUNDRISE</h3>
            <p className="text-neutral-400 text-sm">
              Empowering ideas through community funding. Start your campaign today.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="/campaigns" className="hover:text-white transition-colors">Browse Campaigns</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Start a Campaign</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="/login" className="hover:text-white transition-colors">Sign In</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Register</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-500 text-sm">
          © {new Date().getFullYear()} FundRise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
