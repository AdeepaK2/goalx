import React from "react";

const Footer = () => {
  return (
    <div>
      <footer className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">GoalX</h3>
              <p className="text-blue-200 mt-1">
                Empowering school sports excellence
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-blue-200 hover:text-white">
                Help
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                Support
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-blue-800 pt-4 text-sm text-blue-200 text-center">
            © {new Date().getFullYear()} GoalX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
