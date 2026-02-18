
import React, { useState, useCallback } from 'react';
import { Phone, RefreshCw, Smartphone, QrCode, ShieldCheck, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { analyzePhoneNumber } from './services/geminiService';
import { PhoneAnalysis } from './types';

const App: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [generatedNumber, setGeneratedNumber] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhoneAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsAnalyzing(true);
    // Use Gemini to provide a nice "pro" feel for formatting/validation
    const result = await analyzePhoneNumber(phoneNumber);
    setAnalysis(result);
    setGeneratedNumber(result.formatted || phoneNumber);
    setIsAnalyzing(false);
  };

  const handleReset = useCallback(() => {
    setPhoneNumber('');
    setGeneratedNumber(null);
    setAnalysis(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation / Header */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <QrCode size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DialQR</h1>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw size={18} />
            Reset
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 flex flex-col items-center">
        {/* Intro Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Instant Call QR Generator
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Enter a phone number to create a secure QR code. Anyone who scans it will be prompted to call that number instantly.
          </p>
        </div>

        {!generatedNumber ? (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={20} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 text-lg placeholder:text-slate-400"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 italic">
                  Tip: Include country code for international calls.
                </p>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !phoneNumber}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isAnalyzing 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Generate QR Code
                    <QrCode size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-2xl grid md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
            {/* QR Display */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <QRCodeSVG
                  value={`tel:${generatedNumber}`}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">SCANNABLE QR CODE</p>
                <p className="text-slate-500 text-xs">Point your camera to call</p>
              </div>
            </div>

            {/* Analysis & Details */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                    <Smartphone size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">Direct Link Created</h3>
                </div>
                <div className="text-2xl font-mono text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                  {generatedNumber}
                </div>
                
                {analysis && (
                  <div className="space-y-4">
                    {analysis.countrySuggestion && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={16} />
                        <span>Region: <strong>{analysis.countrySuggestion}</strong></span>
                      </div>
                    )}
                    {analysis.securityNote && (
                      <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                        <span>{analysis.securityNote}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                Create New Code
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 w-full mt-20">
          <FeatureCard 
            icon={<Phone className="text-blue-600" />}
            title="Native Dialing"
            description="Works directly with your phone's native dialer. No apps needed."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-green-600" />}
            title="Privacy First"
            description="No phone numbers are stored. Your data stays between you and the QR."
          />
          <FeatureCard 
            icon={<Smartphone className="text-purple-600" />}
            title="Global Support"
            description="Supports international formats with country code recognition."
          />
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-slate-200 bg-white text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} DialQR Tool. Built for efficiency.</p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <div className="mb-4 p-3 bg-slate-50 rounded-full">{icon}</div>
    <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

export default App;
