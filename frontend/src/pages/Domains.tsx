import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDomains } from '../hooks/useDomains';
import toast from 'react-hot-toast';

export default function Domains() {
  const { t } = useTranslation();
  const { domains, loading, addDomain, removeDomain } = useDomains();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDomain(newDomain);
      toast.success(t('domains.domainAdded') || 'Domain added!');
      setNewDomain('');
      setShowAddForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error adding domain';
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDomain = async (id: string) => {
    try {
      await removeDomain(id);
      toast.success(t('domains.domainRemoved') || 'Domain removed');
    } catch {
      toast.error('Error removing domain');
    }
  };

  const selectedDomain = domains.find(d => d.id === showVerifyModal);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Title row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('domains.title')}</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('domains.addDomain')}
        </button>
      </div>

      {/* Add domain modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8">
            <h2 className="text-xl font-bold text-white mb-6">{t('domains.addDomain')}</h2>
            <form onSubmit={handleAddDomain} className="space-y-5">
              <div>
                <label htmlFor="domainName" className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('domains.domainName')}
                </label>
                <input
                  id="domainName"
                  type="text"
                  required
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
                  placeholder={t('domains.domainPlaceholder')}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {adding && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>}
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify domain modal */}
      {showVerifyModal && selectedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-800 p-8">
            <h2 className="text-xl font-bold text-white mb-2">{t('domains.verifyTitle')}</h2>
            <p className="text-gray-400 text-sm mb-6">{selectedDomain.domain}</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">{t('domains.dnsTxt')}</h3>
                <p className="text-gray-400 text-xs mb-2">{t('domains.dnsInstructions')}</p>
                <code className="block bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-emerald-300 break-all">
                  auradef-verify={selectedDomain.verification_token}
                </code>
                <p className="text-gray-500 text-xs mt-2">
                  TXT record @ _auradef.{selectedDomain.domain}
                </p>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">{t('domains.htmlFile')}</h3>
                <p className="text-gray-400 text-xs mb-2">{t('domains.htmlInstructions')}</p>
                <code className="block bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-cyan-300 break-all">
                  https://{selectedDomain.domain}/auradef-verify-{selectedDomain.verification_token.slice(0, 16)}.html
                </code>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">{t('domains.metaTag')}</h3>
                <p className="text-gray-400 text-xs mb-2">{t('domains.metaInstructions')}</p>
                <code className="block bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-purple-300 break-all">
                  {'<meta name="auradef-verify" content="' + selectedDomain.verification_token + '" />'}
                </code>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowVerifyModal(null)}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  toast.success(t('domains.verificationPending') || 'Verification will be checked when scan starts');
                  setShowVerifyModal(null);
                }}
                className="px-6 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                {t('domains.checkVerification')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Domains list */}
      {domains.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">{t('domains.noDomains')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="rounded-xl bg-gray-900 border border-gray-800 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-semibold text-white truncate">{domain.domain}</h3>
                  {domain.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {t('domains.verified')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {t('domains.unverified')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(domain.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {!domain.is_verified && (
                  <button
                    onClick={() => setShowVerifyModal(domain.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    {t('domains.verify')}
                  </button>
                )}
                {domain.is_verified && (
                  <>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                      {t('scans.startQuickScan')}
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                      {t('scans.startFullScan')}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleRemoveDomain(domain.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  {t('domains.removeDomain')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
