import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>&copy; {currentYear} HaxDef. {t('footer.rights')}</span>
          <span className="text-gray-600">
            {t('footer.poweredBy', { defaultValue: 'Powered by HaxDef' })}
          </span>
        </div>
      </div>
    </footer>
  );
}
