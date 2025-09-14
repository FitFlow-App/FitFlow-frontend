import { useState, useEffect } from 'react';

export default function PwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => {
      setInstallPrompt(null);
    });
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 sm:bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 z-50">
      <p className="text-sm font-semibold">
        ¡Instala FitFlow en tu dispositivo!
      </p>
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-white text-indigo-600 font-bold rounded-md hover:bg-gray-200"
      >
        Instalar
      </button>
    </div>
  );
}
