
import React from 'react';

const Footer = () => {
  return (
    <footer className="brand-green text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 brand-gold rounded-full flex items-center justify-center">
                <span className="text-brand-green font-bold text-lg">I</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">ประกันภัยออนไลน์</h3>
                <p className="text-sm opacity-80">Insurance Calculator</p>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed max-w-md">
              บริการคำนวณเบี้ยประกันภัยออนไลน์ที่ใช้งานง่าย รวดเร็ว และแม่นยำ 
              พร้อมให้บริการคำปรึกษาและใบเสนอราคาฟรี
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">เมนูหลัก</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#calculator" className="opacity-80 hover:opacity-100 transition-opacity">คำนวณเบี้ยประกัน</a></li>
              <li><a href="#packages" className="opacity-80 hover:opacity-100 transition-opacity">แผนประกัน</a></li>
              <li><a href="#about" className="opacity-80 hover:opacity-100 transition-opacity">เกี่ยวกับเรา</a></li>
              <li><a href="#contact" className="opacity-80 hover:opacity-100 transition-opacity">ติดต่อเรา</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">ติดต่อเรา</h4>
            <div className="space-y-2 text-sm">
              <p className="opacity-80">📞 02-xxx-xxxx</p>
              <p className="opacity-80">📧 info@insurance.co.th</p>
              <p className="opacity-80">📍 กรุงเทพมหานคร</p>
              <p className="opacity-80">🕒 จันทร์-ศุกร์ 9:00-18:00</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-80">
            © 2024 ประกันภัยออนไลน์. สงวนลิขสิทธิ์.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#privacy" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              นโยบายความเป็นส่วนตัว
            </a>
            <a href="#terms" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              ข้อกำหนดการใช้งาน
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
