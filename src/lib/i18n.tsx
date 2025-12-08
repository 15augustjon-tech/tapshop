'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'th' | 'en'

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navbar
    'nav.createShop': 'เปิดร้านเลย',

    // Hero
    'hero.title1': 'ร้านออนไลน์ของคุณ',
    'hero.title2': '',
    'hero.subtitle': 'สร้างร้าน รับออเดอร์ จัดส่ง — จบในลิงก์เดียว',
    'hero.cta': 'เปิดร้านเลย',

    // Value Props
    'value.setup.title': 'พร้อมขายใน 5 นาที',
    'value.setup.desc': 'เพิ่มสินค้า ตั้งราคา เริ่มขายได้เลย',
    'value.order.title': 'ลูกค้าสั่งซื้อเอง',
    'value.order.desc': 'ไม่ต้องตอบแชท ไม่ต้องจดออเดอร์',
    'value.delivery.title': 'เราจัดส่งให้',
    'value.delivery.desc': 'รับของถึงหน้าบ้าน ส่งถึงมือลูกค้า',

    // How it works
    'how.title': 'วิธีใช้งาน',
    'how.step1.title': 'สร้างร้าน',
    'how.step1.desc': 'เพิ่มสินค้า ตั้งราคา รับลิงก์ร้านของคุณ',
    'how.step2.title': 'แชร์ลิงก์',
    'how.step2.desc': 'โพสต์ใน Instagram, Facebook, LINE ได้ทุกที่',
    'how.step3.title': 'เราจัดส่ง',
    'how.step3.desc': 'ไรเดอร์รับของจากคุณ ส่งถึงลูกค้า เก็บเงินให้',

    // Features
    'features.title': 'ออกแบบมาเพื่อคนขายของ',
    'features.noDM': 'ลูกค้าสั่งซื้อเอง',
    'features.noDMDesc': 'เลือกสินค้า กรอกที่อยู่ เสร็จ',
    'features.noAddress': 'ไม่ต้องจดที่อยู่',
    'features.noAddressDesc': 'ระบบบันทึกให้อัตโนมัติ',
    'features.noGrab': 'เราจัดส่งให้',
    'features.noGrabDesc': 'ไรเดอร์รับ-ส่งของทุกวัน',
    'features.cod': 'เก็บเงินปลายทาง',
    'features.codDesc': 'ลูกค้าจ่ายเงินให้ไรเดอร์ คุณได้รับเงินหลังส่งสำเร็จ',

    // Pricing
    'pricing.title': 'ค่าใช้จ่าย',
    'pricing.free': 'ไม่มีค่ารายเดือน',
    'pricing.noFees': 'จ่ายค่าส่งเมื่อมีออเดอร์',
    'pricing.payWhen': 'ค่าส่งคิดตามระยะทาง',
    'pricing.perOrder': 'เก็บเงินปลายทางรวมแล้ว',
    'pricing.auto': '',
    'pricing.cta': 'เปิดร้านเลย',

    // FAQ
    'faq.title': 'คำถามที่พบบ่อย',
    'faq.q1': 'TapShop คืออะไร?',
    'faq.a1': 'TapShop คือร้านออนไลน์พร้อมระบบจัดส่งในตัว คุณสร้างร้าน เพิ่มสินค้า แชร์ลิงก์ ลูกค้าสั่งซื้อเอง เราจัดส่งและเก็บเงินให้',
    'faq.q2': 'ค่าใช้จ่ายเท่าไหร่?',
    'faq.a2': 'สร้างร้านฟรี ไม่มีค่ารายเดือน จ่ายแค่ค่าส่งเมื่อมีออเดอร์',
    'faq.q3': 'จัดส่งพื้นที่ไหนบ้าง?',
    'faq.a3': 'กรุงเทพและปริมณฑล',
    'faq.q4': 'ลูกค้าจ่ายเงินยังไง?',
    'faq.a4': 'เก็บเงินปลายทาง ไรเดอร์เก็บเงินตอนส่งของ คุณได้รับเงินภายใน 2 วัน',
    'faq.q5': 'มีปัญหาติดต่อยังไง?',
    'faq.a5': 'LINE @tapshop หรือ support@tapshop.me ทีมงานพร้อมช่วยเหลือทุกวัน 9:00-21:00',

    // CTA
    'cta.title': 'พร้อมเริ่มขาย?',
    'cta.subtitle': 'สร้างร้านได้ใน 5 นาที',
    'cta.button': 'เปิดร้านเลย',

    // Footer
    'footer.tagline': 'ร้านออนไลน์พร้อมจัดส่ง',
    'footer.links': 'ลิงก์',
    'footer.about': 'เกี่ยวกับเรา',
    'footer.security': 'ความปลอดภัย',
    'footer.contact': 'ติดต่อเรา',
    'footer.forSellers': 'สำหรับผู้ขาย',
    'footer.createShop': 'สร้างร้าน',
    'footer.login': 'เข้าสู่ระบบ',
    'footer.contactUs': 'ติดต่อ',
    'footer.home': 'หน้าแรก',

    // Security Page
    'secure.heroTitle': 'ความปลอดภัยของคุณ',
    'secure.heroSubtitle': 'TapShop ให้ความสำคัญกับความปลอดภัยของผู้ขายและผู้ซื้อเป็นอันดับหนึ่ง',
    'secure.howWeProtect': 'เราปกป้องคุณอย่างไร',
    'secure.forSellers': 'สำหรับผู้ขาย',
    'secure.forBuyers': 'สำหรับผู้ซื้อ',
    'secure.cod': 'เก็บเงินปลายทาง (COD)',
    'secure.codDesc': 'ไรเดอร์เก็บเงินจากลูกค้า ลดความเสี่ยงไม่ได้รับเงิน',
    'secure.fastTransfer': 'โอนเงินรวดเร็ว',
    'secure.fastTransferDesc': 'เงินจากออเดอร์โอนเข้าบัญชีภายใน 1-2 วันทำการ',
    'secure.realtime': 'ติดตามสถานะแบบเรียลไทม์',
    'secure.realtimeDesc': 'ดูสถานะการจัดส่งทุกออเดอร์ได้ตลอดเวลา',
    'secure.lineNotify': 'แจ้งเตือนทาง LINE',
    'secure.lineNotifyDesc': 'รับแจ้งเตือนออเดอร์ใหม่และสถานะการจัดส่งทันที',
    'secure.payAfter': 'จ่ายเงินหลังได้รับของ',
    'secure.payAfterDesc': 'ตรวจสอบสินค้าก่อนจ่ายเงินให้ไรเดอร์',
    'secure.proRider': 'ไรเดอร์มืออาชีพ',
    'secure.proRiderDesc': 'ใช้บริการ Lalamove ที่มีประกันสินค้า',
    'secure.trackRider': 'ติดตามไรเดอร์',
    'secure.trackRiderDesc': 'ดูตำแหน่งไรเดอร์แบบเรียลไทม์',
    'secure.verified': 'ร้านค้าตรวจสอบแล้ว',
    'secure.verifiedDesc': 'ผู้ขายทุกรายยืนยันตัวตนผ่านเบอร์โทรศัพท์',
    'secure.measures': 'มาตรการความปลอดภัย',
    'secure.otp': 'รหัส OTP',
    'secure.otpDesc': 'ยืนยันตัวตนทุกครั้งด้วยรหัส OTP ทาง SMS',
    'secure.ssl': 'SSL Encryption',
    'secure.sslDesc': 'ข้อมูลทุกอย่างเข้ารหัส HTTPS ปลอดภัย',
    'secure.registered': 'บริษัทจดทะเบียน',
    'secure.registeredDesc': 'TapShop เป็นบริษัทจดทะเบียนถูกต้องตามกฎหมาย',
    'secure.faqTitle': 'คำถามเกี่ยวกับความปลอดภัย',
    'secure.faq1q': 'ถ้าสินค้าเสียหายระหว่างจัดส่งจะทำอย่างไร?',
    'secure.faq1a': 'Lalamove มีประกันสินค้าสูงสุด 2,000 บาทต่อออเดอร์ หากสินค้าเสียหายระหว่างจัดส่ง สามารถติดต่อทีมงานเพื่อเคลมได้',
    'secure.faq2q': 'ถ้าลูกค้าไม่รับของจะเป็นอย่างไร?',
    'secure.faq2a': 'ไรเดอร์จะนำสินค้ากลับมาส่งคืนที่ร้าน',
    'secure.faq3q': 'ข้อมูลส่วนตัวจะถูกเก็บรักษาอย่างไร?',
    'secure.faq3a': 'เราเก็บข้อมูลเฉพาะที่จำเป็นต่อการให้บริการ และไม่แชร์ข้อมูลกับบุคคลภายนอก ยกเว้นไรเดอร์ที่ต้องใช้ที่อยู่จัดส่ง',
    'secure.faq4q': 'ผู้ขายต้องมีใบอนุญาตค้าขายไหม?',
    'secure.faq4a': 'ไม่จำเป็น TapShop เหมาะสำหรับผู้ขายรายย่อยที่ขายของออนไลน์ แต่ผู้ขายต้องรับผิดชอบต่อภาษีของตัวเอง',
    'secure.contactTitle': 'ติดต่อเรา',
    'secure.contactSubtitle': 'มีคำถามเพิ่มเติม? ทีมงานพร้อมช่วยเหลือ',
    'secure.teamHours': 'ทีมงานพร้อมให้บริการทุกวัน 9:00 - 21:00',
    'secure.ctaTitle': 'พร้อมเริ่มขายกับ TapShop?',
    'secure.ctaSubtitle': 'สร้างร้าน ไม่มีค่าใช้จ่ายรายเดือน',
  },
  en: {
    // Navbar
    'nav.createShop': 'Create Shop',

    // Hero
    'hero.title1': 'Sell Online',
    'hero.title2': 'Deliver to Door',
    'hero.subtitle': 'Create shop, receive orders easily, auto delivery',
    'hero.cta': 'Create Shop',

    // Value Props
    'value.setup.title': 'Setup in 5 mins',
    'value.setup.desc': 'Add info, add products, ready to sell',
    'value.order.title': 'Customers order themselves',
    'value.order.desc': 'No chat replies, no address notes',
    'value.delivery.title': 'We deliver',
    'value.delivery.desc': 'Rider picks up and delivers to customer',

    // How it works
    'how.title': 'How it works',
    'how.step1.title': 'Create Shop',
    'how.step1.desc': 'Add shop info, product photos, set prices in 5 mins',
    'how.step2.title': 'Share Link',
    'how.step2.desc': 'Send shop link to customers via IG, Facebook, LINE',
    'how.step3.title': 'We Deliver',
    'how.step3.desc': 'Rider picks up from your home, delivers, collects payment',

    // Features
    'features.title': 'Built for sellers',
    'features.noDM': 'Customers order themselves',
    'features.noDMDesc': 'Pick items, enter address, done',
    'features.noAddress': 'No address notes',
    'features.noAddressDesc': 'System saves automatically',
    'features.noGrab': 'We deliver for you',
    'features.noGrabDesc': 'Riders pick up and deliver daily',
    'features.cod': 'Cash on delivery',
    'features.codDesc': 'Customer pays rider, you get paid after delivery',

    // Pricing
    'pricing.title': 'Pricing',
    'pricing.free': 'Free',
    'pricing.noFees': 'No signup fee, no monthly fee',
    'pricing.payWhen': 'We handle delivery',
    'pricing.perOrder': 'You sell, we deliver',
    'pricing.auto': '',
    'pricing.cta': 'Create Shop',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'What is TapShop?',
    'faq.a1': 'TapShop is a platform for selling online that helps you create a shop, receive orders, and deliver products to customers easily without replying to DMs or calling riders yourself.',
    'faq.q2': 'How much does it cost?',
    'faq.a2': 'Free to use. No monthly fees. You only pay for delivery when you have orders — we handle everything.',
    'faq.q3': 'What areas do you deliver?',
    'faq.a3': 'All of Bangkok and surrounding areas. Delivery daily.',
    'faq.q4': 'How do customers pay?',
    'faq.a4': 'Customers pay cash to rider on delivery (COD). We transfer money to you after successful delivery.',
    'faq.q5': 'How to contact support?',
    'faq.a5': 'Add LINE @tapshop or email support@tapshop.me. Team available daily 9:00-21:00',

    // CTA
    'cta.title': 'Ready to sell?',
    'cta.subtitle': 'Create your shop now, no fees',
    'cta.button': 'Create Shop Today',

    // Footer
    'footer.tagline': 'Sell online, deliver to door',
    'footer.links': 'Links',
    'footer.about': 'About Us',
    'footer.security': 'Security',
    'footer.contact': 'Contact Us',
    'footer.forSellers': 'For Sellers',
    'footer.createShop': 'Create Shop',
    'footer.login': 'Login',
    'footer.contactUs': 'Contact',
    'footer.home': 'Home',

    // Security Page
    'secure.heroTitle': 'Your Security',
    'secure.heroSubtitle': 'TapShop prioritizes the safety of sellers and buyers above all',
    'secure.howWeProtect': 'How We Protect You',
    'secure.forSellers': 'For Sellers',
    'secure.forBuyers': 'For Buyers',
    'secure.cod': 'Cash on Delivery (COD)',
    'secure.codDesc': 'Rider collects payment from customer, reducing risk of non-payment',
    'secure.fastTransfer': 'Fast Transfer',
    'secure.fastTransferDesc': 'Order earnings transferred to your account within 1-2 business days',
    'secure.realtime': 'Real-time Tracking',
    'secure.realtimeDesc': 'Track delivery status of all orders anytime',
    'secure.lineNotify': 'LINE Notifications',
    'secure.lineNotifyDesc': 'Get instant notifications for new orders and delivery status',
    'secure.payAfter': 'Pay After Receiving',
    'secure.payAfterDesc': 'Inspect products before paying the rider',
    'secure.proRider': 'Professional Riders',
    'secure.proRiderDesc': 'Using Lalamove service with product insurance',
    'secure.trackRider': 'Track Rider',
    'secure.trackRiderDesc': 'View rider location in real-time',
    'secure.verified': 'Verified Shops',
    'secure.verifiedDesc': 'All sellers verified through phone number',
    'secure.measures': 'Security Measures',
    'secure.otp': 'OTP Code',
    'secure.otpDesc': 'Identity verification via SMS OTP every time',
    'secure.ssl': 'SSL Encryption',
    'secure.sslDesc': 'All data encrypted with secure HTTPS',
    'secure.registered': 'Registered Company',
    'secure.registeredDesc': 'TapShop is a legally registered company',
    'secure.faqTitle': 'Security Questions',
    'secure.faq1q': 'What if items are damaged during delivery?',
    'secure.faq1a': 'Lalamove provides insurance up to 2,000 THB per order. Contact our team to file a claim if items are damaged.',
    'secure.faq2q': 'What if customer refuses delivery?',
    'secure.faq2a': 'Rider will return items to your shop.',
    'secure.faq3q': 'How is personal data protected?',
    'secure.faq3a': 'We only collect data necessary for service and do not share with third parties, except rider delivery addresses.',
    'secure.faq4q': 'Do sellers need a business license?',
    'secure.faq4a': 'Not required. TapShop is suitable for small online sellers, but sellers are responsible for their own taxes.',
    'secure.contactTitle': 'Contact Us',
    'secure.contactSubtitle': 'Have questions? Our team is ready to help',
    'secure.teamHours': 'Team available daily 9:00 - 21:00',
    'secure.ctaTitle': 'Ready to sell with TapShop?',
    'secure.ctaSubtitle': 'Create shop, no monthly fees',
  }
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('th')

  useEffect(() => {
    const saved = localStorage.getItem('tapshop_lang') as Language
    if (saved && (saved === 'th' || saved === 'en')) {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('tapshop_lang', newLang)
  }

  const t = (key: string): string => {
    return translations[lang][key] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n()

  return (
    <div className="text-sm text-gray-500">
      <button
        onClick={() => setLang('th')}
        className={lang === 'th' ? 'font-medium text-black' : 'hover:text-black'}
      >
        TH
      </button>
      <span className="mx-1">|</span>
      <button
        onClick={() => setLang('en')}
        className={lang === 'en' ? 'font-medium text-black' : 'hover:text-black'}
      >
        EN
      </button>
    </div>
  )
}
