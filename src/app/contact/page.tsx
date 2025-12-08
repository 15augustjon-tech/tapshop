'use client'

import Link from 'next/link'
import { useI18n, LanguageToggle } from '@/lib/i18n'

export default function ContactPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">TapShop</Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link
              href="/seller/signup"
              className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {t('nav.createShop')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-8">{t('contact.title')}</h1>
          <p className="text-lg text-gray-600 mb-12">{t('contact.subtitle')}</p>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Email */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <a href="mailto:support@tapshop.me" className="text-gray-600 hover:text-black hover:underline">
                support@tapshop.me
              </a>
            </div>

            {/* LINE */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#06C755] text-white rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">LINE</h3>
              <span className="text-gray-600">@tapshop</span>
            </div>
          </div>

          {/* Hours */}
          <p className="text-center text-gray-500">{t('contact.hours')}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-12 bg-black text-white mt-auto">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4">TapShop</div>
              <p className="text-gray-400 text-sm">{t('footer.tagline')}</p>
            </div>
            <div>
              <div className="font-medium mb-3">{t('footer.links')}</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">{t('footer.about')}</Link></li>
                <li><Link href="/secure" className="hover:text-white">{t('footer.security')}</Link></li>
                <li><Link href="/contact" className="hover:text-white">{t('footer.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-3">{t('footer.forSellers')}</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/seller/signup" className="hover:text-white">{t('footer.createShop')}</Link></li>
                <li><Link href="/seller/login" className="hover:text-white">{t('footer.login')}</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-3">{t('footer.contactUs')}</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>LINE: @tapshop</li>
                <li>support@tapshop.me</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2025 TapShop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
