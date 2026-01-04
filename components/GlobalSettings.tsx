
import React, { useState, useEffect } from 'react';
import { X, Globe, Key, Cpu, Settings, Cloud, Server, Terminal, Download, Play, Check, AlertCircle, Loader2, Wifi, ShieldCheck, BookOpen, Mic, Monitor, Layers, AlertTriangle, ExternalLink, Command } from 'lucide-react';
import { AppState, UILanguage } from '../types';
import { GoogleGenAI } from "@google/genai";

interface GlobalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  initialTab?: 'general' | 'cloud' | 'local' | 'guide';
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ isOpen, onClose, appState, setAppState, initialTab = 'general' }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'cloud' | 'local' | 'guide'>(initialTab);
  const [apiKeyInput, setApiKeyInput] = useState(appState.apiKey || '');
  const [localUrlInput, setLocalUrlInput] = useState(appState.localServerUrl || 'ws://localhost:9000');
  
  // Connection States
  const [cloudStatus, setCloudStatus] = useState<ConnectionStatus>('idle');
  const [localStatus, setLocalStatus] = useState<ConnectionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
      if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const testCloudConnection = async () => {
      if (!apiKeyInput) {
          setCloudStatus('error');
          setStatusMessage('API Key is missing');
          return;
      }
      setCloudStatus('testing');
      setStatusMessage('');
      try {
          const ai = new GoogleGenAI({ apiKey: apiKeyInput });
          // Lightweight test
          await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: "ping",
          });
          setCloudStatus('success');
          setStatusMessage('Connected to Gemini API successfully.');
      } catch (e: any) {
          setCloudStatus('error');
          setStatusMessage(e.message || "Invalid API Key or Network Error");
      }
  };

  const testLocalConnection = () => {
      setLocalStatus('testing');
      setStatusMessage('');
      
      try {
          const ws = new WebSocket(localUrlInput);
          
          ws.onopen = () => {
              setLocalStatus('success');
              setStatusMessage('Connected to Whisper Server successfully.');
              ws.close();
          };
          
          ws.onerror = () => {
              setLocalStatus('error');
              setStatusMessage('Connection refused. Is the server running?');
          };

      } catch (e) {
          setLocalStatus('error');
          setStatusMessage('Invalid URL format.');
      }
  };

  const saveSettings = () => {
      setAppState(prev => ({
          ...prev,
          apiKey: apiKeyInput,
          localServerUrl: localUrlInput
      }));
      // Persist to local storage for "Bring Your Own Key" support
      localStorage.setItem('cc_api_key', apiKeyInput);
      localStorage.setItem('cc_local_url', localUrlInput);
      onClose();
  };

  const StatusIndicator = ({ status, msg }: { status: ConnectionStatus, msg: string }) => {
      if (status === 'idle') return null;
      return (
          <div className={`mt-3 p-3 rounded-lg flex items-start gap-3 text-sm ${status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800'}`}>
              {status === 'testing' && <Loader2 size={16} className="animate-spin shrink-0 mt-0.5" />}
              {status === 'success' && <ShieldCheck size={16} className="shrink-0 mt-0.5" />}
              {status === 'error' && <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              <div>
                  <span className="font-bold block">{status === 'testing' ? 'Testing Connection...' : status === 'success' ? 'System Ready' : 'Connection Failed'}</span>
                  {msg && <span className="opacity-90 text-xs">{msg}</span>}
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-200 p-4 flex justify-between items-center shrink-0">
             <h2 className="font-display font-bold text-lg text-forest-dark flex items-center gap-2">
                <Settings size={20} className="text-sage-600" /> Application Settings
             </h2>
             <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-full transition-colors"><X size={20} className="text-stone-500" /></button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-56 bg-stone-50 border-r border-stone-200 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
                <button onClick={() => setActiveTab('general')} className={`text-left px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'general' ? 'bg-white shadow-sm text-forest-dark' : 'text-stone-500 hover:bg-stone-100'}`}>
                    <Globe size={16} /> General
                </button>
                <button onClick={() => setActiveTab('cloud')} className={`text-left px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'cloud' ? 'bg-white shadow-sm text-forest-dark' : 'text-stone-500 hover:bg-stone-100'}`}>
                    <Cloud size={16} /> Cloud Access
                </button>
                <button onClick={() => setActiveTab('local')} className={`text-left px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'local' ? 'bg-white shadow-sm text-forest-dark' : 'text-stone-500 hover:bg-stone-100'}`}>
                    <Server size={16} /> Local AI
                </button>
                <div className="h-px bg-stone-200 my-2"></div>
                <button onClick={() => setActiveTab('guide')} className={`text-left px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'guide' ? 'bg-white shadow-sm text-forest-dark' : 'text-stone-500 hover:bg-stone-100'}`}>
                    <BookOpen size={16} /> User Guide
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto bg-white">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">Interface Language</label>
                            <div className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl bg-white">
                                <Globe size={20} className="text-forest-dark" />
                                <select 
                                    value={appState.uiLanguage}
                                    onChange={(e) => setAppState(p => ({...p, uiLanguage: e.target.value as UILanguage}))}
                                    className="bg-transparent font-bold text-stone-700 w-full outline-none"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">Current Runtime</label>
                             <div className="p-4 bg-sage-50 rounded-xl border border-sage-200 flex items-center gap-4">
                                 <div className="bg-white p-2 rounded-lg shadow-sm text-sage-600">
                                     <Cpu size={24} />
                                 </div>
                                 <div>
                                     <div className="font-bold text-forest-dark">
                                         {appState.mode === 'cloud' ? 'Gemini 2.5 Flash' : 
                                          appState.mode === 'local' ? 'WebSpeech / Local Server' : 'Balanced (Auto)'}
                                     </div>
                                     <div className="text-xs text-stone-500">
                                         {appState.mode === 'cloud' ? 'Streaming via Google Cloud' : 
                                          'Running locally'}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cloud' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-forest-dark mb-2">Google Gemini API</h3>
                            <p className="text-sm text-stone-500 mb-4">Required for "Cloud Mode" and "Resilience Mode".</p>
                            
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">API Key</label>
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-3 p-3 border border-stone-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-sage-400 transition-all shadow-sm">
                                    <Key size={20} className="text-forest-dark" />
                                    <input 
                                        type="password"
                                        value={apiKeyInput}
                                        onChange={(e) => {
                                            setApiKeyInput(e.target.value);
                                            setCloudStatus('idle');
                                        }}
                                        placeholder="AIzaSy..."
                                        className="w-full bg-transparent outline-none font-mono text-sm text-stone-800 placeholder:text-stone-400"
                                    />
                                </div>
                                <button 
                                    onClick={testCloudConnection}
                                    disabled={cloudStatus === 'testing' || !apiKeyInput}
                                    className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                                >
                                    Test
                                </button>
                            </div>
                            
                            {/* Visual Status Feedback */}
                            <StatusIndicator status={cloudStatus} msg={statusMessage} />

                            <div className="mt-4 text-xs text-stone-400 border-t border-stone-100 pt-4">
                                Don't have one? <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-forest-dark underline font-bold">Get a key from Google AI Studio</a>.
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'local' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-forest-dark mb-2">Local Whisper Server</h3>
                            <p className="text-sm text-stone-500 mb-4">Connect to a Whisper ASR WebSocket server running on your machine for complete privacy.</p>
                            
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">Server URL</label>
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-3 p-3 border border-stone-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-sage-400 transition-all shadow-sm">
                                    <Server size={20} className="text-forest-dark" />
                                    <input 
                                        type="text"
                                        value={localUrlInput}
                                        onChange={(e) => {
                                            setLocalUrlInput(e.target.value);
                                            setLocalStatus('idle');
                                        }}
                                        placeholder="ws://localhost:9000"
                                        className="w-full bg-transparent outline-none font-mono text-sm text-stone-800 placeholder:text-stone-400"
                                    />
                                </div>
                                <button 
                                    onClick={testLocalConnection}
                                    disabled={localStatus === 'testing' || !localUrlInput}
                                    className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                                >
                                    Test
                                </button>
                            </div>

                            {/* Visual Status Feedback */}
                            <StatusIndicator status={localStatus} msg={statusMessage} />
                        </div>

                        <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                            <h4 className="font-bold text-sm text-stone-700 mb-4 flex items-center gap-2"><Terminal size={16} /> Setup Guide</h4>
                            
                            <div className="space-y-4">
                                <div className="pl-4 border-l-2 border-stone-300">
                                    <h5 className="font-bold text-sm text-stone-800 mb-1">Whisper.cpp Server</h5>
                                    
                                    <div className="bg-stone-900 rounded-lg p-4 font-mono text-xs text-stone-300 overflow-x-auto">
                                        <p className="text-stone-500 mb-2"># 1. Clone & Download Model</p>
                                        <p className="text-green-400 mb-1">git clone https://github.com/ggerganov/whisper.cpp</p>
                                        <p className="text-green-400 mb-1">cd whisper.cpp</p>
                                        <p className="text-green-400 mb-4">bash ./models/download-ggml-model.sh base.en</p>

                                        <p className="text-stone-500 mb-2"># 2. Build with CMake (More reliable)</p>
                                        <p className="text-green-400 mb-1">cmake -B build</p>
                                        <p className="text-green-400 mb-4">cmake --build build --config Release</p>

                                        <p className="text-stone-500 mb-2"># 3. Run Server</p>
                                        <p className="text-green-400">./build/bin/whisper-server -m models/ggml-base.en.bin --port 9000</p>
                                    </div>
                                    <div className="mt-4 bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs border border-yellow-200">
                                        <strong>Troubleshooting: "failed to open model" error?</strong><br/>
                                        The command looks for the model file relative to your current folder. You must run <code>cd whisper.cpp</code> before running the server command.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'guide' && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h3 className="text-2xl font-bold text-forest-dark mb-2">Welcome to Community Captioner</h3>
                            <p className="text-stone-600 leading-relaxed">
                                This guide helps you get the best performance, whether you are running a casual meeting or a professional broadcast.
                            </p>
                        </div>

                        {/* Critical Best Practices */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                            <h4 className="flex items-center gap-2 text-orange-800 font-bold mb-3">
                                <AlertTriangle size={18} /> Critical Browser Best Practices
                            </h4>
                            <ul className="space-y-2 text-sm text-stone-700 list-disc pl-5">
                                <li><strong>Never minimize the browser window.</strong> Modern browsers (Chrome/Edge) will put the tab to "sleep" to save battery, which kills the microphone stream and captioning engine.</li>
                                <li><strong>Keep the window visible.</strong> Even if it's behind another window, do not minimize it to the dock/taskbar.</li>
                                <li><strong>Use a separate machine or monitor.</strong> For professional broadcasts, run this app on a dedicated laptop or a second screen to ensure it stays active.</li>
                            </ul>
                        </div>

                        {/* Hardware */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-bold text-forest-dark border-b border-stone-200 pb-2">
                                <Mic size={18} /> Audio & Hardware
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-stone-50 p-4 rounded-lg">
                                    <h5 className="font-bold text-sm mb-1">Microphone Selection</h5>
                                    <p className="text-xs text-stone-500">
                                        Use a USB conference mic or a direct line-in from your soundboard. Avoid built-in laptop mics for large rooms.
                                    </p>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-lg">
                                    <h5 className="font-bold text-sm mb-1">Virtual Cables</h5>
                                    <p className="text-xs text-stone-500">
                                        To caption Zoom calls, use VB-Cable (Windows) or Loopback (Mac) to route audio into the browser.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Setup Guides */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-bold text-forest-dark border-b border-stone-200 pb-2">
                                <Settings size={18} /> Setup & Installation
                            </h4>
                            
                            {/* Cloud Setup */}
                            <div className="pl-4 border-l-2 border-blue-200">
                                <h5 className="font-bold text-sm text-blue-900 mb-1">Method A: Cloud Mode (Easiest & Most Accurate)</h5>
                                <ol className="list-decimal pl-5 text-sm text-stone-600 space-y-1">
                                    <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a>.</li>
                                    <li>Click "Create API Key". It is usually free for standard usage limits.</li>
                                    <li>Copy the key (starts with <code>AIzaSy...</code>).</li>
                                    <li>In this app, go to <strong>Settings &gt; Cloud Access</strong> and paste the key.</li>
                                    <li>Click "Test" and then "Save".</li>
                                </ol>
                            </div>

                            {/* Local Setup */}
                            <div className="pl-4 border-l-2 border-stone-300">
                                <h5 className="font-bold text-sm text-stone-800 mb-1">Method B: Local Whisper (Privacy / Advanced)</h5>
                                <p className="text-sm text-stone-500 mb-2">Requires separate server software.</p>
                                <p className="text-xs text-stone-500">See the "Local AI" tab for detailed setup instructions and download links.</p>
                            </div>
                        </div>

                        {/* OBS */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-bold text-forest-dark border-b border-stone-200 pb-2">
                                <Layers size={18} /> Broadcasting (OBS / vMix)
                            </h4>
                            <p className="text-sm text-stone-600">
                                Do not screen capture the dashboard. Instead, use the specialized Overlay Window.
                            </p>
                            <ol className="list-decimal pl-5 text-sm text-stone-600 space-y-2">
                                <li>On the Dashboard, click <strong>Caption Settings + Output</strong>.</li>
                                <li>Customize your font, color, and size.</li>
                                <li>Click <strong>Launch Output Window</strong>. This opens a new, clean popup.</li>
                                <li>Copy the URL of that popup.</li>
                                <li>In OBS, add a <strong>Browser Source</strong>. Paste the URL.</li>
                                <li><strong>Crucial:</strong> Set the OBS Browser Source background to CSS <code>background: transparent;</code> (usually default).</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
            <button onClick={saveSettings} className="bg-forest-dark text-white px-6 py-2 rounded-lg font-bold hover:bg-forest-light transition-colors flex items-center gap-2">
                <Check size={16} /> Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
