'use client'

import Link from 'next/link'
import { useI18n, LanguageToggle } from '@/lib/i18n'

export default function SecurePage() {
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

      {/* Hero */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-black text-white rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('secure.heroTitle')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('secure.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* How We Protect You */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('secure.howWeProtect')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Sellers */}
            <div className="bg-white p-8 border border-gray-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">🏪</span>
                {t('secure.forSellers')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.cod')}</div>
                    <div className="text-sm text-gray-600">{t('secure.codDesc')}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.fastTransfer')}</div>
                    <div className="text-sm text-gray-600">{t('secure.fastTransferDesc')}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.realtime')}</div>
                    <div className="text-sm text-gray-600">{t('secure.realtimeDesc')}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.lineNotify')}</div>
                    <div className="text-sm text-gray-600">{t('secure.lineNotifyDesc')}</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* For Buyers */}
            <div className="bg-white p-8 border border-gray-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">🛒</span>
                {t('secure.forBuyers')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.payAfter')}</div>
                    <div className="text-sm text-gray-600">{t('secure.payAfterDesc')}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.proRider')}</div>
                    <div className="text-sm text-gray-600">{t('secure.proRiderDesc')}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.trackRider')}</div>
                    <div className="text-sm text-gray-600">{t('secure.trackRiderDesc')}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('secure.verified')}</div>
                    <div className="text-sm text-gray-600">{t('secure.verifiedDesc')}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('secure.measures')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{t('secure.otp')}</h3>
              <p className="text-gray-600 text-sm">{t('secure.otpDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{t('secure.ssl')}</h3>
              <p className="text-gray-600 text-sm">{t('secure.sslDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{t('secure.registered')}</h3>
              <p className="text-gray-600 text-sm">{t('secure.registeredDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('secure.faqTitle')}</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">{t('secure.faq1q')}</h3>
              <p className="text-gray-600 text-sm">{t('secure.faq1a')}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">{t('secure.faq2q')}</h3>
              <p className="text-gray-600 text-sm">{t('secure.faq2a')}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">{t('secure.faq3q')}</h3>
              <p className="text-gray-600 text-sm">{t('secure.faq3a')}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">{t('secure.faq4q')}</h3>
              <p className="text-gray-600 text-sm">{t('secure.faq4a')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t('secure.contactTitle')}</h2>
          <p className="text-gray-600 mb-8">{t('secure.contactSubtitle')}</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="bg-gray-50 p-6 border border-gray-200">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-bold mb-1">LINE</div>
              <div className="text-gray-600">@tapshop</div>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-200">
              <div className="text-2xl mb-2">📧</div>
              <div className="font-bold mb-1">Email</div>
              <div className="text-gray-600">support@tapshop.me</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">{t('secure.teamHours')}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t('secure.ctaTitle')}</h2>
          <p className="text-gray-300 mb-8">{t('secure.ctaSubtitle')}</p>
          <Link
            href="/seller/signup"
            className="inline-block bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {t('nav.createShop')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold">TapShop</div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">{t('footer.home')}</Link>
            <Link href="/about" className="hover:text-white">{t('footer.about')}</Link>
            <Link href="/contact" className="hover:text-white">{t('footer.contactUs')}</Link>
          </div>
          <div className="text-sm text-gray-500">© 2025 TapShop</div>
        </div>
      </footer>
    </div>
  )
}
