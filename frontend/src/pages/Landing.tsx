import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentLang = i18n.language?.startsWith('hu') ? 'HU' : 'EN';
  const toggleLanguage = () => i18n.changeLanguage(currentLang === 'HU' ? 'en' : 'hu');

  const faqItems = [
    {
      question: 'Milyen gyakran érdemes szkennelni az oldalt?',
      answer:
        'Javasoljuk a legalább heti egy mélyvizsgálatot, különösen ha rendszeresen frissíted az oldalad tartalmát, bővítményeit vagy keretrendszerét. A Pro csomag automatikusan elvégzi ezt helyetted.',
    },
    {
      question: 'Lassíthatja a szkennelés a weboldalam működését?',
      answer:
        'Nem. Az AuraDef intelligens terheléselosztót használ, amely minimálisra csökkenti a szerverre gyakorolt hatást. A vizsgálat külső nézetből történik, így a felhasználóid semmit nem éreznek belőle.',
    },
    {
      question: 'Kell-e bármit telepítenem a szerveremre?',
      answer:
        'Semmit. A vizsgálat külső nézetből történik, hasonlóan ahhoz, ahogyan egy támadó is látná az oldaladat. Csak a tulajdonjogot kell igazolnod egy egyszerű DNS vagy fájl alapú hitelesítéssel.',
    },
  ];

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-['Inter'] selection:bg-[#a2eeff] selection:text-[#001f25]">
      {/* Font imports and custom CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .aura-gradient { background: linear-gradient(135deg, #001b21 0%, #00a3b8 100%); }
        .glass-nav { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .editorial-shadow { box-shadow: 0px 4px 20px rgba(0, 27, 33, 0.04), 0px 12px 40px rgba(0, 27, 33, 0.08); }
      `}</style>

      {/* ═══════════ NAV ═══════════ */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/60 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-cyan-950 font-['Manrope']">AuraDef</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-cyan-600 border-b-2 border-cyan-600 pb-1 text-sm font-semibold tracking-tight" href="#">
              Kezdőlap
            </a>
            <a className="text-slate-600 hover:text-cyan-900 transition-all duration-300 text-sm font-semibold tracking-tight" href="#">
              Erőforrások
            </a>
            <a className="text-slate-600 hover:text-cyan-900 transition-all duration-300 text-sm font-semibold tracking-tight" href="#">
              Árazás
            </a>
            <a className="text-slate-600 hover:text-cyan-900 transition-all duration-300 text-sm font-semibold tracking-tight" href="#">
              Rólunk
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 text-xs font-bold tracking-wider text-slate-600 hover:text-[#006877] border border-slate-300 rounded-md transition-colors"
            >
              {currentLang}
            </button>
            <Link to="/login" className="text-slate-600 font-semibold text-sm hover:text-[#006877] transition-colors">
              Bejelentkezés
            </Link>
            <Link
              to="/register"
              className="bg-[#ffe16d] text-[#221b00] px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all"
            >
              Ingyenes Szkennelés
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a2eeff]/20 border border-[#00a3b8]/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00a3b8] animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-[#00a3b8]">Cybersecurity for SMEs</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold font-['Manrope'] text-[#191c1e] tracking-tighter leading-[1.1] mb-6">
              Weboldalad biztonsága a mi feladatunk.
            </h1>
            <p className="text-xl text-[#44474f] leading-relaxed mb-10 max-w-2xl">
              Automatizált sérülékenységvizsgálat kis- és középvállalkozásoknak. Fedezd fel a sebezhetőségeket, mielőtt a
              támadók tennék.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="bg-[#ffe16d] text-[#221b00] px-8 py-4 rounded-full font-bold text-base hover:opacity-90 transition-all"
              >
                Ingyenes szkennelés indítása
              </Link>
              <a
                href="#hogyan-mukodik"
                className="border-2 border-[#c4c6d0] text-[#44474f] px-8 py-4 rounded-full font-bold text-base hover:border-[#00a3b8] hover:text-[#00a3b8] transition-all"
              >
                Hogyan működik?
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-square bg-gradient-to-tr from-[#a2eeff]/30 to-transparent rounded-[2rem] flex items-center justify-center p-8 overflow-hidden">
              <img
                className="w-full h-auto z-10 editorial-shadow rounded-2xl"
                alt="Futuristic cyber security shield"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJymLG4WFUlMoudIe9KRXMG4LCIpWCep8jSZ6YNVR_NFtRtzcK8_Oi3hQB7Sck295h8SSA71kKS93hzTVQgPHByO5BGTn4dmRaQmXLcW6xZAgGVC4KYuKs5TaZ2idnZI0spuK-xHDTbC84QD8NKBzbR02Ety8cESWslj_QQfm34B28R3XJLfGgbhIKvZaLc-oC_6-MOtKNuhoCol6VnlW83yCP3jHkxK87k7nLU4AUYen5ZmzcxBhWLCSSw3mVrnXkUS4UjLRT8pla"
              />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ffe16d] rounded-full blur-3xl opacity-40"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#00a3b8] rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="py-24 bg-[#f2f4f6]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold font-['Manrope'] tracking-tight text-[#191c1e] mb-4">
              Miért veszélyeztetettek a KKV-k?
            </h2>
            <p className="text-[#44474f] text-lg">
              A kiberbűnözők nem csak a multi-cégeket támadják. A kisebb vállalkozások gyakran könnyebb célpontot jelentenek.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-2xl editorial-shadow text-center">
              <div className="text-6xl font-black text-[#00a3b8] font-['Manrope'] mb-4 tracking-tighter">43%</div>
              <p className="text-[#44474f] font-medium">A kibertámadások 43%-a kisvállalkozásokat érint.</p>
            </div>
            <div className="bg-white p-10 rounded-2xl editorial-shadow text-center">
              <div className="text-6xl font-black text-[#00a3b8] font-['Manrope'] mb-4 tracking-tighter">60%</div>
              <p className="text-[#44474f] font-medium">A feltört kisvállalkozások 60%-a fél éven belül csődbe megy.</p>
            </div>
            <div className="bg-white p-10 rounded-2xl editorial-shadow text-center">
              <div className="text-6xl font-black text-[#00a3b8] font-['Manrope'] mb-4 tracking-tighter">3.5M Ft</div>
              <p className="text-[#44474f] font-medium">Egy átlagos adatvédelmi incidens költsége egy hazai KKV-nál.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SOLUTION ═══════════ */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <img
                className="rounded-3xl editorial-shadow"
                alt="Dashboard UI"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt_5lYnw7bxTojYSIuxrU3mvK9aCl9xaiLIZVIehvns2tYGGskQekUbpECbJvWy_vFZlU_CocqVtnuwAzaJFNDdpziqNGl3Cf99E8eRDL5t7WTY55hI4AatQl7KGNj08g-Gv_oa37EWspceM0zZNX-333FjPis9nZcePYzHV0c6_y4TBwiVS5nGh8iCjf9ByGdd2Eq8W1bOZZvQTpdZgCiyV1np9E38IOY4RK8gcNZKQbgu8Ye-5dfILmG_ltDgAm7xYFFAmmoBz6H"
              />
              <div className="absolute -bottom-8 -right-8 p-6 bg-[#ffe16d] rounded-2xl editorial-shadow hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#221b00] rounded-full text-[#ffe16d]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      security
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#221b00]">98.5% Biztonság</div>
                    <div className="text-xs text-[#221b00]/70">Aktuális védelem szintje</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold font-['Manrope'] tracking-tighter text-[#191c1e] mb-8">
                Megoldás: AuraDEF: Az automatizált védelem
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#a2eeff]/30 rounded-xl flex items-center justify-center text-[#00a3b8]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      search_check
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-['Manrope'] mb-2">Deep Scan technológia</h3>
                    <p className="text-[#44474f] leading-relaxed">
                      Több mint 10.000 ismert sebezhetőséget vizsgálunk, beleértve az SQL injection-t és az XSS támadásokat.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#a2eeff]/30 rounded-xl flex items-center justify-center text-[#00a3b8]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-['Manrope'] mb-2">AI-alapú jelentések</h3>
                    <p className="text-[#44474f] leading-relaxed">
                      Nem csak listázzuk a hibákat, hanem érthető, magyar nyelvű javítási útmutatót is adunk melléjük.
                    </p>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="inline-block bg-[#00a3b8] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#006877] transition-all mt-4"
                >
                  Próbáld ki ingyen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES BENTO GRID ═══════════ */}
      <section className="py-24 bg-[#eceef0]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold font-['Manrope'] tracking-tight text-[#191c1e] mb-4">
              Minden, ami a védelemhez kell
            </h2>
            <p className="text-[#44474f] text-lg max-w-2xl">
              Integrált megoldások a teljes digitális biztonsághoz, fejlesztők és cégvezetők számára egyaránt.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
            {/* Big card: Tulajdonjog */}
            <div className="md:col-span-8 bg-white p-8 rounded-3xl editorial-shadow relative overflow-hidden">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-[#00a3b8] text-4xl mb-4">verified</span>
                <h3 className="text-2xl font-extrabold font-['Manrope'] mb-4">Tulajdonjog igazolás</h3>
                <p className="text-[#44474f] max-w-sm">
                  Biztonságos DNS vagy fájl alapú hitelesítés, hogy csak a saját oldalad szkennelhesd.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#a2eeff]/10 rounded-full blur-3xl"></div>
            </div>
            {/* Small dark card: Deep Scan */}
            <div className="md:col-span-4 bg-[#001b21] p-8 rounded-3xl editorial-shadow text-white">
              <span className="material-symbols-outlined text-[#00a3b8] text-4xl mb-4">radar</span>
              <h3 className="text-2xl font-extrabold font-['Manrope'] mb-4 text-[#a2eeff]">Deep Scan</h3>
              <p className="text-white/70 leading-relaxed">
                Mélyreható vizsgálat minden rétegben, a szervertől a kliensoldali scriptekig.
              </p>
            </div>
            {/* Small gold card: Reports */}
            <div className="md:col-span-4 bg-[#ffe16d] p-8 rounded-3xl editorial-shadow">
              <span
                className="material-symbols-outlined text-[#221b00] text-4xl mb-4"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                description
              </span>
              <h3 className="text-2xl font-extrabold font-['Manrope'] mb-4 text-[#221b00]">Érthető jelentések</h3>
              <p className="text-[#221b00]/80 leading-relaxed">
                Nulla technikai zsargon, 100% cselekvésre alkalmas tanács a csapatodnak.
              </p>
            </div>
            {/* Big card: Continuous protection */}
            <div className="md:col-span-8 bg-white p-8 rounded-3xl editorial-shadow flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="material-symbols-outlined text-[#00a3b8] text-4xl mb-4">update</span>
                <h3 className="text-2xl font-extrabold font-['Manrope'] mb-4">Folyamatos védelem</h3>
                <p className="text-[#44474f] leading-relaxed">
                  Napi, heti vagy havi automatikus szkennelések, hogy ne érjen meglepetés egy frissítés után.
                </p>
              </div>
              <div className="w-full md:w-48 h-32 bg-[#eceef0] rounded-2xl flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-6xl text-[#44474f]/20"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield_with_heart
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STEPS ═══════════ */}
      <section id="hogyan-mukodik" className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-extrabold font-['Manrope'] tracking-tighter text-center mb-20">
            3 lépésben a biztonságig
          </h2>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-[#c4c6d0]/30 -translate-y-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="relative bg-[#f7f9fb] p-8 text-center">
                <div className="w-16 h-16 bg-[#00323a] text-white rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-8 relative z-10 editorial-shadow">
                  1
                </div>
                <h3 className="text-xl font-bold font-['Manrope'] mb-4">Regisztráció</h3>
                <p className="text-[#44474f]">
                  Add meg az oldalad URL címét és igazold a tulajdonjogod pár kattintással.
                </p>
              </div>
              <div className="relative bg-[#f7f9fb] p-8 text-center">
                <div className="w-16 h-16 bg-[#00323a] text-white rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-8 relative z-10 editorial-shadow">
                  2
                </div>
                <h3 className="text-xl font-bold font-['Manrope'] mb-4">Szkennelés</h3>
                <p className="text-[#44474f]">
                  Indítsd el az automatizált Deep Scan vizsgálatot, ami kb. 15-20 percet vesz igénybe.
                </p>
              </div>
              <div className="relative bg-[#f7f9fb] p-8 text-center">
                <div className="w-16 h-16 bg-[#00323a] text-white rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-8 relative z-10 editorial-shadow">
                  3
                </div>
                <h3 className="text-xl font-bold font-['Manrope'] mb-4">Javítás</h3>
                <p className="text-[#44474f]">
                  Töltsd le a magyar nyelvű jelentést és kövesd az egyszerű javítási lépéseket.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="py-32 bg-[#00323a] text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold font-['Manrope'] tracking-tight mb-4">
              Egyszerű, átlátható árazás
            </h2>
            <p className="text-[#00a3b8]/80 text-lg">Válaszd a vállalkozásod méretéhez leginkább illő csomagot.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-[#001b21] p-10 rounded-3xl flex flex-col h-full">
              <h3 className="text-xl font-bold mb-2">Ingyenes</h3>
              <div className="text-4xl font-black font-['Manrope'] mb-6">
                0 Ft<span className="text-sm font-normal text-white/60">/hó</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a2eeff]">check_circle</span> 1 weboldal
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a2eeff]">check_circle</span> Havi 1 alap szkennelés
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a2eeff]">check_circle</span> Alap jelentés
                </li>
              </ul>
              <Link
                to="/register"
                className="block text-center bg-[#00a3b8] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#006877] transition-all"
              >
                Regisztráció
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-white p-10 rounded-3xl editorial-shadow flex flex-col h-full text-[#191c1e] relative md:scale-105">
              <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#ffe16d] text-[#221b00] px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                Legnépszerűbb
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-black font-['Manrope'] mb-6 text-[#00a3b8]">
                14.900 Ft<span className="text-sm font-normal text-[#44474f]">/hó</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-[#44474f]">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#00a3b8]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>{' '}
                  5 weboldal
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#00a3b8]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>{' '}
                  Heti Deep Scan
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#00a3b8]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>{' '}
                  Részletes magyar AI jelentés
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#00a3b8]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>{' '}
                  E-mail riasztások
                </li>
              </ul>
              <Link
                to="/register"
                className="block text-center bg-[#ffe16d] text-[#221b00] px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all"
              >
                Pro csomag választása
              </Link>
            </div>
            {/* Enterprise */}
            <div className="bg-[#001b21] p-10 rounded-3xl flex flex-col h-full">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-black font-['Manrope'] mb-6">Egyedi ár</div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a2eeff]">check_circle</span> Korlátlan weboldal
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a2eeff]">check_circle</span> API hozzáférés
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a2eeff]">check_circle</span> Dedikált szakértői támogatás
                </li>
              </ul>
              <a
                href="mailto:info@auradef.hu"
                className="block text-center border-2 border-[#00a3b8] text-[#00a3b8] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#00a3b8] hover:text-white transition-all"
              >
                Kapcsolatfelvétel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-4xl font-extrabold font-['Manrope'] tracking-tight text-center mb-16">Gyakori kérdések</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl editorial-shadow overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold font-['Manrope'] text-[#191c1e] pr-4">{item.question}</span>
                  <span
                    className="material-symbols-outlined text-[#00a3b8] flex-shrink-0 transition-transform duration-300"
                    style={{
                      transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-[#44474f] leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-slate-100 w-full py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-xl font-bold text-cyan-950 mb-6 font-['Manrope']">AuraDef</div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              A modern KKV-k digitális védőbástyája. Professzionális biztonság, mindenki számára elérhetően.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-cyan-950">Termék</h5>
            <ul className="space-y-4">
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Funkciók
                </a>
              </li>
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Árazás
                </a>
              </li>
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Dokumentáció
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-cyan-950">Vállalat</h5>
            <ul className="space-y-4">
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Rólunk
                </a>
              </li>
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Blog
                </a>
              </li>
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Kapcsolat
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-cyan-950">Jogi</h5>
            <ul className="space-y-4">
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Adatvédelem
                </a>
              </li>
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  ÁSZF
                </a>
              </li>
              <li>
                <a className="text-slate-500 hover:text-cyan-600 transition-colors text-sm" href="#">
                  Cookie szabályzat
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-[#c4c6d0]/10 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} AuraDef Cybersecurity. Minden jog fenntartva.
          </p>
        </div>
      </footer>
    </div>
  );
}
