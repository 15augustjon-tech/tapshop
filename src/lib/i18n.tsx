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
    'nav.createShop': 'สร้างร้านฟรี',

    // Hero
    'hero.title1': 'ขายของออนไลน์',
    'hero.title2': 'ส่งถึงบ้าน',
    'hero.subtitle': 'สร้างร้านฟรี รับออเดอร์ง่าย ส่งของอัตโนมัติ',
    'hero.cta': 'สร้างร้านฟรี',

    // Value Props
    'value.setup.title': 'ตั้งร้าน 5 นาที',
    'value.setup.desc': 'ใส่ข้อมูล เพิ่มสินค้า พร้อมขายทันที',
    'value.order.title': 'ลูกค้าสั่งเอง',
    'value.order.desc': 'ไม่ต้องตอบแชท ไม่ต้องจดที่อยู่',
    'value.delivery.title': 'เราส่งให้',
    'value.delivery.desc': 'ไรเดอร์รับของถึงหน้าบ้าน ส่งถึงลูกค้า',

    // How it works
    'how.title': 'วิธีใช้งาน',
    'how.step1.title': 'สร้างร้าน',
    'how.step1.desc': 'ใส่ข้อมูลร้าน เพิ่มรูปสินค้า ตั้งราคา เสร็จใน 5 นาที',
    'how.step2.title': 'แชร์ลิงก์',
    'how.step2.desc': 'ส่งลิงก์ร้านให้ลูกค้าทาง IG, Facebook, LINE',
    'how.step3.title': 'เราจัดส่ง',
    'how.step3.desc': 'ไรเดอร์มารับของถึงบ้าน ส่งให้ลูกค้า เก็บเงินให้',

    // Features
    'features.title': 'ไม่ต้องทำเอง',
    'features.noDM': 'ไม่ต้องตอบ DM',
    'features.noAddress': 'ไม่ต้องจดที่อยู่',
    'features.noGrab': 'ไม่ต้องเรียก Grab เอง',
    'features.cod': 'เก็บเงินปลายทางได้',

    // Pricing
    'pricing.title': 'ราคา',
    'pricing.free': 'ฟรี',
    'pricing.noFees': 'ไม่มีค่าสมัคร ไม่มีค่ารายเดือน',
    'pricing.payWhen': 'จ่ายแค่ตอนมีออเดอร์',
    'pricing.perOrder': 'ค่าส่ง + ฿40/ออเดอร์',
    'pricing.auto': 'หักจากยอด COD อัตโนมัติ',
    'pricing.cta': 'เริ่มต้นฟรี',

    // FAQ
    'faq.title': 'คำถามที่พบบ่อย',
    'faq.q1': 'TapShop คืออะไร?',
    'faq.a1': 'TapShop คือแพลตฟอร์มสำหรับขายของออนไลน์ ที่ช่วยให้คุณสร้างร้านค้า รับออเดอร์ และจัดส่งสินค้าถึงลูกค้าได้ง่ายๆ โดยไม่ต้องตอบ DM หรือเรียกไรเดอร์เอง',
    'faq.q2': 'ค่าใช้จ่ายเท่าไหร่?',
    'faq.a2': 'สมัครฟรี ไม่มีค่ารายเดือน จ่ายแค่ค่าส่ง + ค่าบริการ ฿40 ต่อออเดอร์ (หักจากยอดเก็บเงินปลายทาง)',
    'faq.q3': 'รับส่งพื้นที่ไหนบ้าง?',
    'faq.a3': 'ปัจจุบันรับส่งในกรุงเทพและปริมณฑล รัศมี 20 กม. จากร้านค้า กำลังขยายพื้นที่เร็วๆ นี้',
    'faq.q4': 'ลูกค้าจ่ายเงินยังไง?',
    'faq.a4': 'ลูกค้าจ่ายเงินสดให้ไรเดอร์ตอนรับของ (เก็บเงินปลายทาง/COD) เราจะโอนเงินให้คุณหลังจัดส่งสำเร็จ',
    'faq.q5': 'มีปัญหาติดต่อยังไง?',
    'faq.a5': 'แอดไลน์ @tapshop หรืออีเมล support@tapshop.me ทีมงานพร้อมช่วยเหลือทุกวัน 9:00-21:00',

    // CTA
    'cta.title': 'พร้อมเริ่มขาย?',
    'cta.subtitle': 'สร้างร้านได้เลย ไม่มีค่าใช้จ่าย',
    'cta.button': 'สร้างร้านฟรี วันนี้',

    // Footer
    'footer.tagline': 'ขายของออนไลน์ ส่งถึงบ้าน',
    'footer.links': 'ลิงก์',
    'footer.about': 'เกี่ยวกับเรา',
    'footer.security': 'ความปลอดภัย',
    'footer.contact': 'ติดต่อเรา',
    'footer.forSellers': 'สำหรับผู้ขาย',
    'footer.createShop': 'สร้างร้าน',
    'footer.login': 'เข้าสู่ระบบ',
    'footer.contactUs': 'ติดต่อ',
  },
  en: {
    // Navbar
    'nav.createShop': 'Create Free Shop',

    // Hero
    'hero.title1': 'Sell Online',
    'hero.title2': 'Deliver to Door',
    'hero.subtitle': 'Create shop free, receive orders easily, auto delivery',
    'hero.cta': 'Create Free Shop',

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
    'features.title': 'No need to do it yourself',
    'features.noDM': 'No DM replies',
    'features.noAddress': 'No address notes',
    'features.noGrab': 'No calling Grab',
    'features.cod': 'Cash on delivery',

    // Pricing
    'pricing.title': 'Pricing',
    'pricing.free': 'Free',
    'pricing.noFees': 'No signup fee, no monthly fee',
    'pricing.payWhen': 'Pay only when you have orders',
    'pricing.perOrder': 'Delivery + ฿40/order',
    'pricing.auto': 'Auto deducted from COD',
    'pricing.cta': 'Start Free',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'What is TapShop?',
    'faq.a1': 'TapShop is a platform for selling online that helps you create a shop, receive orders, and deliver products to customers easily without replying to DMs or calling riders yourself.',
    'faq.q2': 'How much does it cost?',
    'faq.a2': 'Free to sign up, no monthly fees. Pay only delivery + ฿40 service fee per order (deducted from COD amount).',
    'faq.q3': 'What areas do you deliver?',
    'faq.a3': 'Currently delivering in Bangkok and surrounding areas within 20km radius from shop. Expanding soon.',
    'faq.q4': 'How do customers pay?',
    'faq.a4': 'Customers pay cash to rider on delivery (COD). We transfer money to you after successful delivery.',
    'faq.q5': 'How to contact support?',
    'faq.a5': 'Add LINE @tapshop or email support@tapshop.me. Team available daily 9:00-21:00',

    // CTA
    'cta.title': 'Ready to sell?',
    'cta.subtitle': 'Create your shop now, no fees',
    'cta.button': 'Create Free Shop Today',

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
