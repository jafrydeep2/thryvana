import { useState, useEffect } from 'react';
import { Download, CheckCircle, Info, Smartphone, Share, Home } from 'lucide-react';

const PWAInstallPage = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if on iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setInstallPrompt(e);
            // Update UI to show the install button
            setIsInstallable(true);
        });

        // Listen for the appinstalled event
        window.addEventListener('appinstalled', () => {
            // Log install to analytics
            console.log('PWA was installed');
            setIsInstalled(true);
            setIsInstallable(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', () => { });
            window.removeEventListener('appinstalled', () => { });
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, discard it
        setInstallPrompt(null);

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
                    <h1 className="text-3xl font-bold">Install Our Application</h1>
                    <p className="mt-2 text-blue-100">Get faster access and a better experience with our app</p>
                </div>

                {/* Main content */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left column - Install instructions */}
                    <div>
                        {isInstalled ? (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center space-x-3">
                                <CheckCircle className="text-green-500 flex-shrink-0" />
                                <span className="text-green-800 font-medium">This application is already installed on your device!</span>
                            </div>
                        ) : isInstallable ? (
                            <div className="space-y-6">
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                                >
                                    <Download size={20} />
                                    <span>Install Application</span>
                                </button>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-blue-800 text-sm">Click the button above to install our app directly to your device. This will create a shortcut icon that you can access anytime.</p>
                                    </div>
                                </div>
                            </div>
                        ) : isIOS ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                                        <Smartphone size={18} className="mr-2" />
                                        Install on iOS
                                    </h3>
                                    <ol className="text-blue-700 space-y-2 pl-6 list-decimal">
                                        <li>Tap the <span className="font-medium">Share button</span> in Safari</li>
                                        <li>Scroll down and tap <span className="font-medium">"Add to Home Screen"</span></li>
                                        <li>Tap <span className="font-medium">"Add"</span> in the upper right corner</li>
                                    </ol>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Step 1: Share button */}
                                    <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg shadow-sm">
                                        <Share size={36} className="text-blue-500 mb-2" />
                                        <span className="text-xs text-center text-gray-700 font-medium">1. Tap Share</span>
                                    </div>

                                    {/* Step 2: Add to Home Screen */}
                                    <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg shadow-sm">
                                        <div className="w-12 h-12 mb-2 flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                                <line x1="8" y1="12" x2="16" y2="12"></line>
                                            </svg>
                                        </div>
                                        <span className="text-xs text-center text-gray-700 font-medium">2. Add to Home Screen</span>
                                    </div>

                                    {/* Step 3: Add button */}
                                    <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg shadow-sm">
                                        <Home size={36} className="text-blue-500 mb-2" />
                                        <span className="text-xs text-center text-gray-700 font-medium">3. Tap Add</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Info size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-amber-800 text-sm">Your browser doesn't support automatic installation. Try using Chrome, Edge, or Safari to install this application.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column - Benefits */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Why Install Our App?</h2>
                        <div className="space-y-4">

                            <div className="flex items-start">
                                <div className="bg-indigo-100 p-2 rounded-full mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Faster Experience</h3>
                                    <p className="text-gray-600 text-sm">Enjoy quicker load times and smoother performance</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-indigo-100 p-2 rounded-full mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">App-Like Experience</h3>
                                    <p className="text-gray-600 text-sm">Enjoy full-screen mode without browser controls</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-indigo-100 p-2 rounded-full mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Stay Updated</h3>
                                    <p className="text-gray-600 text-sm">Receive automatic updates with new features</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-indigo-100 p-2 rounded-full mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Work Offline</h3>
                                    <p className="text-gray-600 text-sm">Access our app even without an internet connection</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-gray-500 text-sm text-center">
                        Install Thryvana today and add us to your home screen. Your future self will thank you
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPage;