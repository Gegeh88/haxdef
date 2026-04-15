import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentLang = i18n.language?.startsWith('hu') ? 'HU' : 'EN';
  const toggleLanguage = () => i18n.changeLanguage(currentLang === 'HU' ? 'en' : 'hu');

  return (
    <div className="min-h-screen bg-[#0A192F] text-white overflow-hidden" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      {/* Inject Montserrat font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ═══════════ NAV ═══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A192F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB400]/10 border border-[#00D4FF]/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-[#00D4FF]/5 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[#00D4FF]">Aura</span><span className="text-white">DEF</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="px-2.5 py-1 text-xs font-bold tracking-wider text-gray-400 hover:text-white border border-white/10 rounded-md transition-colors">{currentLang}</button>
            <Link to="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {t('common.login')}
            </Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#00B4D8] hover:from-[#00E5FF] hover:to-[#00D4FF] text-[#0A192F] transition-all shadow-lg shadow-[#00D4FF]/20 hover:shadow-[#00D4FF]/30">
              {t('common.register')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#00D4FF]/[0.03] blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full bg-[#FFB400]/[0.02] blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D4FF]/5 border border-[#00D4FF]/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4FF]" />
            </span>
            <span className="text-[#00D4FF] text-sm font-medium tracking-wide">Cybersecurity Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            <span className="block">Weboldalad biztonsága</span>
            <span className="block mt-2">
              <span className="bg-gradient-to-r from-[#00D4FF] via-[#00E5FF] to-[#FFB400] bg-clip-text text-transparent">a mi feladatunk.</span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Automatizált sérülékenységvizsgálat kis- és középvállalkozásoknak.
            Fedezd fel a sebezhetőségeket, mielőtt a támadók tennék.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group relative px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00B4D8] text-[#0A192F] transition-all shadow-xl shadow-[#00D4FF]/25 hover:shadow-[#00D4FF]/40 hover:scale-[1.02]">
              Kezdd el ingyen
              <svg className="inline-block w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a href="#hogyan-mukodik" className="px-6 py-4 text-sm font-medium text-gray-400 hover:text-[#00D4FF] transition-colors">
              Hogyan működik?
              <svg className="inline-block w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00D4FF]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Nincs telepítés
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00D4FF]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Eredmények percek alatt
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00D4FF]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              GDPR kompatibilis
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-[#00D4FF]/60" />
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM SECTION ═══════════ */}
      <section className="relative py-24 bg-[#061325]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F] via-transparent to-[#0A192F] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#FFB400] text-sm font-bold tracking-[0.2em] uppercase">Kockázatok</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">Miért veszélyeztetettek a KKV-k?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A kibertámadások 43%-a kis- és középvállalkozásokat érint. A legtöbben nem is tudják, hogy sérülékenyek.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: '43%', label: 'A kibertámadások célpontja KKV', desc: 'A támadók tudják: a kisebb cégek védtelenebbek.' },
              { stat: '60%', label: 'Bezár 6 hónapon belül', desc: 'A sikeres támadást elszenvedő kisvállalkozások többsége nem tud talpra állni.' },
              { stat: '3.5M Ft', label: 'Átlagos kár egy incidens után', desc: 'Adatvesztés, leállás, jogi költségek, és az ügyfelek bizalmának elvesztése.' },
            ].map((item) => (
              <div key={item.stat} className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#FFB400]/20 transition-colors">
                <div className="text-5xl font-black text-[#FFB400] mb-3">{item.stat}</div>
                <div className="text-white font-semibold mb-2">{item.label}</div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SOLUTION SECTION ═══════════ */}
      <section className="relative py-24">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#00D4FF]/[0.02] blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#00D4FF] text-sm font-bold tracking-[0.2em] uppercase">Megoldás</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
                <span className="text-[#00D4FF]">AuraDEF</span>: Az automatizált védelem
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Ugyanazokat az eszközöket használjuk, amiket az etikus hackerek — de teljesen automatizáltan.
                Add meg a domain neved, és mi elvégezzük a többit.
              </p>
              <div className="space-y-4">
                {[
                  'Több mint 8000 ismert sebezhetőség ellenőrzése',
                  'SSL, portok, fejlécek, DNS konfiguráció vizsgálata',
                  'AI-alapú összefoglaló közérthető nyelven',
                  'PDF riport fejlesztőidnek, azonnal továbbküldhető',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#00D4FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual: mock scan terminal */}
            <div className="relative">
              <div className="rounded-2xl bg-[#0D2137] border border-white/10 overflow-hidden shadow-2xl shadow-[#00D4FF]/5">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-gray-500 font-mono">auradef-scanner</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-2">
                  <div><span className="text-[#00D4FF]">$</span> <span className="text-gray-300">auradef scan example.hu --full</span></div>
                  <div className="text-gray-500 text-xs mt-3">Scanning target: example.hu</div>
                  <div className="flex items-center gap-2 mt-1"><span className="text-green-400">+</span> <span className="text-gray-400">SSL/TLS certificate valid (Let's Encrypt)</span></div>
                  <div className="flex items-center gap-2"><span className="text-[#FFB400]">!</span> <span className="text-[#FFB400]">Missing: Content-Security-Policy header</span></div>
                  <div className="flex items-center gap-2"><span className="text-[#FFB400]">!</span> <span className="text-[#FFB400]">Missing: X-Frame-Options header</span></div>
                  <div className="flex items-center gap-2"><span className="text-red-400">x</span> <span className="text-red-400">Port 3306 (MySQL) publicly accessible</span></div>
                  <div className="flex items-center gap-2"><span className="text-green-400">+</span> <span className="text-gray-400">WordPress 6.9 detected, up to date</span></div>
                  <div className="flex items-center gap-2"><span className="text-green-400">+</span> <span className="text-gray-400">12 subdomains discovered</span></div>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-gray-500">Nuclei templates:</span> <span className="text-[#00D4FF]">8,247 loaded</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-[#00D4FF] to-[#FFB400] h-1.5 rounded-full" style={{ width: '78%' }} />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">78%</span>
                  </div>
                </div>
              </div>
              {/* Glow behind terminal */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB400]/5 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-24 bg-[#061325]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#00D4FF] text-sm font-bold tracking-[0.2em] uppercase">Funkciók</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Minden, ami a védelemhez kell</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
                title: 'Tulajdonjog igazolás',
                desc: 'Biztonságos indítás: csak a saját domain vizsgálható, DNS vagy fájl alapú hitelesítéssel.',
                color: '#00D4FF',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
                title: 'Deep Scan',
                desc: 'Mélyelemzés 8000+ Nuclei sablonnal. Portok, fejlécek, SSL, CMS, aldomainek — minden.',
                color: '#00D4FF',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
                title: 'Érthető jelentések',
                desc: 'AI-generált PDF riport közérthető nyelven. Zéró szakzsargon, azonnal továbbküldhető.',
                color: '#FFB400',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />,
                title: 'Folyamatos védelem',
                desc: 'Ütemezett vizsgálatok, azonnali értesítés, ha új sebezhetőség jelenik meg.',
                color: '#FFB400',
              },
            ].map((feature) => (
              <div key={feature.title} className="group p-7 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[color:var(--c)]/30 transition-all duration-300 hover:bg-white/[0.04]" style={{ '--c': feature.color } as React.CSSProperties}>
                <div className="w-12 h-12 rounded-xl bg-[color:var(--c)]/10 border border-[color:var(--c)]/20 flex items-center justify-center mb-5" style={{ '--c': feature.color } as React.CSSProperties}>
                  <svg className="w-6 h-6" style={{ color: feature.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="hogyan-mukodik" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#00D4FF] text-sm font-bold tracking-[0.2em] uppercase">Folyamat</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">3 lépésben a biztonságig</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#00D4FF]/30 via-[#00D4FF]/50 to-[#FFB400]/30" />

            {[
              { step: '01', title: 'Regisztrálj', desc: 'Hozd létre fiókodat percek alatt. Nem kell bankkártya.', color: '#00D4FF' },
              { step: '02', title: 'Add hozzá a domaint', desc: 'Igazold a tulajdonjogodat egyszerű DNS vagy fájl feltöltéssel.', color: '#00D4FF' },
              { step: '03', title: 'Kapd meg az eredményt', desc: 'Részletes riport a sebezhetőségekről, javítási javaslatokkal.', color: '#FFB400' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0D2137] border-2 border-[color:var(--c)]/30 flex items-center justify-center mx-auto mb-6 text-[color:var(--c)] font-black text-lg" style={{ '--c': item.color } as React.CSSProperties}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="py-24 bg-[#061325]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#FFB400] text-sm font-bold tracking-[0.2em] uppercase">Csomagok</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Egyszerű, átlátható árazás</h2>
            <p className="text-gray-400 mt-3">Kezdd ingyen, frissíts amikor szükséged van rá.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-8 flex flex-col">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ingyenes</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black">0 Ft</span>
                <span className="text-gray-500 text-sm">/hó</span>
              </div>
              <p className="text-gray-500 text-sm mb-8">Tökéletes az első lépésekhez.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['1 domain', '3 gyors scan / nap', 'Alapvető riport', 'Email értesítés'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#00D4FF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center py-3 rounded-xl border border-white/10 hover:border-[#00D4FF]/30 text-sm font-semibold text-gray-300 hover:text-white transition-all">
                Regisztráció
              </Link>
            </div>

            {/* Pro - highlighted */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#00D4FF]/10 to-transparent border border-[#00D4FF]/30 p-8 flex flex-col shadow-xl shadow-[#00D4FF]/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00D4FF] text-[#0A192F] text-xs font-bold uppercase tracking-wider">Népszerű</div>
              <div className="text-sm font-bold text-[#00D4FF] uppercase tracking-wider mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black">9 900 Ft</span>
                <span className="text-gray-500 text-sm">/hó</span>
              </div>
              <p className="text-gray-400 text-sm mb-8">Kis- és középvállalkozásoknak.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['10 domain', 'Korlátlan scan', 'Teljes Nuclei Deep Scan', 'AI PDF riport', 'Ütemezett vizsgálatok', 'Prioritásos támogatás'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#00D4FF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center py-3 rounded-xl bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A192F] text-sm font-bold transition-all">
                14 nap ingyenes próba
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-8 flex flex-col">
              <div className="text-sm font-bold text-[#FFB400] uppercase tracking-wider mb-2">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black">Egyedi</span>
              </div>
              <p className="text-gray-500 text-sm mb-8">Nagyvállalatoknak és ügynökségeknek.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Korlátlan domain', 'API hozzáférés', 'White-label riportok', 'Dedikált scan szerver', 'SLA garancia', 'Személyes konzultáció'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#FFB400] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:info@auradef.com" className="block text-center py-3 rounded-xl border border-[#FFB400]/30 hover:border-[#FFB400]/50 text-sm font-semibold text-[#FFB400] hover:text-white transition-all">
                Kapcsolatfelvétel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#00D4FF] text-sm font-bold tracking-[0.2em] uppercase">GYIK</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Gyakori kérdések</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Biztonságos a vizsgálat? Nem okoz kárt az oldalamon?', a: 'Igen, teljesen biztonságos. Az AuraDEF kizárólag passzív és alacsony intenzitású vizsgálatokat végez — pontosan úgy, mintha egy felhasználó böngészné az oldaladat. Nem módosít semmit, nem termel túlzott forgalmat.' },
              { q: 'Miért kell igazolnom a domain tulajdonjogát?', a: 'Etikai és jogi okok miatt. Csak a saját weboldaladat vizsgálhatod. Ez véd téged és másokat is — megakadályozza, hogy valaki más oldalát vizsgálhassák az engedélye nélkül.' },
              { q: 'Mennyi ideig tart egy vizsgálat?', a: 'A gyors vizsgálat 2-5 percet vesz igénybe. A teljes Deep Scan 15-40 perc, a domain méretétől és komplexitásától függően. Nem kell nyitva tartanod a böngészőt — emailben értesítünk ha kész.' },
              { q: 'Milyen típusú sebezhetőségeket talál?', a: 'Hiányzó biztonsági fejlécek, SSL problémák, nyitott portok, elavult szoftverek, ismert CVE sérülékenységek (8000+ Nuclei sablon), rossz DNS konfiguráció, kitett fájlok és mappák, és még sok más.' },
              { q: 'Kell hozzá technikai tudás?', a: 'Nem. Az AuraDEF úgy lett tervezve, hogy bárki használhassa. A riportok közérthető nyelven készülnek, a technikai részleteket pedig külön szekció tartalmazza, amit továbbküldhetsz a fejlesztődnek.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold pr-4">{item.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D4FF]/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00D4FF]/[0.03] blur-[120px]" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Védd meg a vállalkozásod most</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Az első vizsgálat ingyenes. Nincs elköteleződés, nincs bankkártya.
            Tudd meg percek alatt, mennyire biztonságos a weboldalad.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00B4D8] text-[#0A192F] shadow-xl shadow-[#00D4FF]/25 hover:shadow-[#00D4FF]/40 hover:scale-[1.02] transition-all">
            Ingyenes vizsgálat indítása
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/5 py-12 bg-[#061020]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold"><span className="text-[#00D4FF]">Aura</span>DEF</span>
              <span className="text-gray-600 text-sm">| Cybersecurity Platform</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>&copy; {new Date().getFullYear()} AuraDEF</span>
              <span>Minden jog fenntartva.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
