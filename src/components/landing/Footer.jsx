export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-20" id="footer">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-1 gap-10">

          <div>

            <h2 className="text-2xl font-bold">

              Flowlens

            </h2>

            <p className="mt-5 text-gray-400 leading-7">

              Automation Easy to handle

            </p>

          </div>

          <div>

            <h3 className="font-semibold mb-6">

              Join Waitlist Now

            </h3>

            {/* <ul className="space-y-4 text-gray-400">

              <li>Features</li>
              <li>Pricing</li>
              <li>Integrations</li>
              <li>Security</li>

            </ul> */}

          </div>

          {/* <div>

            <h3 className="font-semibold mb-6">

              Resources

            </h3>

            <ul className="space-y-4 text-gray-400">

              <li>Docs</li>
              <li>API</li>
              <li>Blog</li>
              <li>Community</li>

            </ul>

          </div>

          <div>

            <h3 className="font-semibold mb-6">

              Company

            </h3>

            <ul className="space-y-4 text-gray-400">

              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
              <li>Privacy</li>

            </ul>

          </div> */}

        </div>

        <div className="mt-20 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">

          <p className="text-gray-500">

            © 2025 Flowlens. All rights reserved.

          </p>

          {/* <div className="flex gap-6 mt-5 md:mt-0 text-gray-500">

            <span>Twitter</span>
            <span>GitHub</span>
            <span>Discord</span>

          </div> */}

        </div>

      </div>

    </footer>
  );
}