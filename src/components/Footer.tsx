
import React from 'react';
import { RESTAURANT_NAME, ADDRESS, PHONE } from '../constants/menu';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <h3 className="text-4xl font-serif font-bold mb-6 italic">{RESTAURANT_NAME}</h3>
            <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
              Experience the vibrant spectrum of modern culinary artistry. A destination where local Indian heritage meets global sophistication.
            </p>
            <div className="flex space-x-4">
              {['Instagram', 'Facebook', 'Twitter'].map(social => (
                <a key={social} href="#" className="text-xs uppercase tracking-widest font-bold hover:text-secondary transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-secondary uppercase tracking-widest text-xs font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>{ADDRESS}</li>
              <li className="text-white font-bold">{PHONE}</li>
              <li>info@kalitaspectrum.com</li>
            </ul>
          </div>

          <div>
            <h4 className="text-secondary uppercase tracking-widest text-xs font-bold mb-6">Hours</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>Mon – Fri: 12:00 PM – 11:30 PM</li>
              <li>Sat – Sun: 11:30 AM – 12:00 AM</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} {RESTAURANT_NAME}. All Rights Reserved.
          </p>
          <div className="flex space-x-6 text-[10px] text-white/30 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
