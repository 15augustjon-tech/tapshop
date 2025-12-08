'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n, LanguageToggle } from '@/lib/i18n'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { t } = useI18n()

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') }
  ]

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
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            {t('hero.title1')}
            {t('hero.title2') && <><br />{t('hero.title2')}</>}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/seller/signup"
              className="bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t('hero.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('value.setup.title')}</h3>
            <p className="text-gray-600">{t('value.setup.desc')}</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('value.order.title')}</h3>
            <p className="text-gray-600">{t('value.order.desc')}</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('value.delivery.title')}</h3>
            <p className="text-gray-600">{t('value.delivery.desc')}</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{t('how.title')}</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-2">{t('how.step1.title')}</h3>
              <p className="text-gray-600">{t('how.step1.desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-2">{t('how.step2.title')}</h3>
              <p className="text-gray-600">{t('how.step2.desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-2">{t('how.step3.title')}</h3>
              <p className="text-gray-600">{t('how.step3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-black text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{t('features.title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '💬', title: t('features.noDM'), desc: t('features.noDMDesc') },
              { icon: '📝', title: t('features.noAddress'), desc: t('features.noAddressDesc') },
              { icon: '🛵', title: t('features.noGrab'), desc: t('features.noGrabDesc') },
              { icon: '💵', title: t('features.cod'), desc: t('features.codDesc') }
            ].map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <p className="text-lg font-medium mb-2">{feature.title}</p>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('pricing.title')}</h2>
          <div className="bg-gray-50 p-8 md:p-12 rounded-lg">
            <div className="text-5xl md:text-6xl font-bold mb-4">{t('pricing.free')}</div>
            <p className="text-xl text-gray-600 mb-6">{t('pricing.noFees')}</p>
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-lg mb-2">{t('pricing.payWhen')}</p>
              <p className="text-2xl font-bold mb-2">{t('pricing.perOrder')}</p>
              {t('pricing.auto') && <p className="text-gray-600">{t('pricing.auto')}</p>}
            </div>
            <div className="mt-8">
              <Link
                href="/seller/signup"
                className="inline-block bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
              >
                {t('pricing.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('faq.title')}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-medium">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-lg text-gray-600 mb-8">{t('cta.subtitle')}</p>
          <Link
            href="/seller/signup"
            className="inline-block bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-black text-white">
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
