export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-12">
      <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-semibold mb-2">Parts</h4>
          <ul>
            <li><a href="/parts/forklift">Forklift</a></li>
            <li><a href="/parts/excavator">Excavator</a></li>
            <li><a href="/parts/charger-modules">Charger Modules</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Rentals</h4>
          <ul>
            <li><a href="/rentals/forklifts">Forklifts</a></li>
            <li><a href="/rentals/boom-lifts">Boom Lifts</a></li>
            <li><a href="/rentals/scissor-lifts">Scissor Lifts</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <p>📞 (555) 123-4567</p>
          <p>✉️ support@flathearthquipment.com</p>
        </div>
      </div>
      <div className="mt-8 text-center text-sm">&copy; {new Date().getFullYear()} Flat Earth Equipment. All rights reserved.</div>
    </footer>
  );
} 