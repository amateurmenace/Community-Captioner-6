
import React, { useState } from 'react';
import { Server, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Terminal, Cpu, Download, RefreshCw, XCircle, Monitor, Command, Copy } from 'lucide-react';
import { checkOllamaConnection } from '../services/localAIService';

interface LocalSetupProps {
    onBack: () => void;
    onComplete: (llmUrl: string, whisperUrl: string) => void;
    initialLlmUrl?: string;
    initialWhisperUrl?: string;
}

const LocalSetup: React.FC<LocalSetupProps> = ({ onBack, onComplete, initialLlmUrl, initialWhisperUrl }) => {
    const [step, setStep] = useState(1);
    const [os, setOs] = useState<'mac' | 'windows'>('mac');
    const [llmUrl, setLlmUrl] = useState(initialLlmUrl || 'http://localhost:11434');
    const [whisperUrl, setWhisperUrl] = useState(initialWhisperUrl || 'ws://localhost:9000');
    
    // Detailed Status State
    const [globalStatus, setGlobalStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
    const [llmStatus, setLlmStatus] = useState<'unknown' | 'success' | 'fail'>('unknown');
    const [whisperStatus, setWhisperStatus] = useState<'unknown' | 'success' | 'fail'>('unknown');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    const testConnections = async () => {
        setGlobalStatus('testing');
        setLlmStatus('unknown');
        setWhisperStatus('unknown');
        
        // 1. Test LLM
        const llmOk = await checkOllamaConnection(llmUrl);
        setLlmStatus(llmOk ? 'success' : 'fail');
        
        // 2. Test Whisper
        let whisperOk = false;
        try {
            const ws = new WebSocket(whisperUrl);
            await new Promise((resolve, reject) => {
                ws.onopen = () => { whisperOk = true; ws.close(); resolve(true); };
                ws.onerror = () => { whisperOk = false; resolve(false); };
                setTimeout(() => { if(!whisperOk) resolve(false); }, 2000);
            });
        } catch(e) { whisperOk = false; }
        setWhisperStatus(whisperOk ? 'success' : 'fail');

        // Final Decision
        if (llmOk && whisperOk) {
            setGlobalStatus('success');
            setTimeout(() => onComplete(llmUrl, whisperUrl), 1000);
        } else {
            setGlobalStatus('fail');
        }
    };

    const StatusIcon = ({ status }: { status: 'unknown' | 'success' | 'fail' }) => {
        if (status === 'success') return <CheckCircle size={18} className="text-green-500" />;
        if (status === 'fail') return <XCircle size={18} className="text-red-500" />;
        return <div className="w-4 h-4 rounded-full border-2 border-stone-200"></div>;
    };

    const CodeBlock = ({ label, cmd }: { label: string, cmd: string }) => (
        <div className="mb-4">
            <div className="flex justify-between text-xs text-stone-400 mb-1 uppercase font-bold tracking-wider">
                <span>{label}</span>
                <button onClick={() => copyToClipboard(cmd)} className="flex items-center gap-1 hover:text-white transition-colors"><Copy size={10} /> Copy</button>
            </div>
            <div className="bg-stone-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-stone-700 shadow-inner">
                {cmd}
            </div>
        </div>
    );

    return (
        <div className="h-full bg-cream p-8 flex flex-col items-center justify-center font-sans">
            <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-stone-200 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sage-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-forest-dark font-bold text-xs mb-6 transition-colors uppercase tracking-wider">
                        <ArrowLeft size={14} /> Cancel Setup
                    </button>
                    
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-forest-dark mb-2">Local Privacy Stack</h1>
                            <p className="text-stone-500 max-w-md text-sm">Run the entire captioning and AI pipeline on your own hardware. <br/>No internet required. Zero data leaks.</p>
                        </div>
                        <div className="bg-stone-100 p-1 rounded-lg flex gap-1">
                            <button 
                                onClick={() => setOs('mac')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${os === 'mac' ? 'bg-white shadow text-forest-dark' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <Command size={14} /> macOS
                            </button>
                            <button 
                                onClick={() => setOs('windows')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${os === 'windows' ? 'bg-white shadow text-forest-dark' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <Monitor size={14} /> Windows
                            </button>
                        </div>
                    </div>

                    {/* Progress Stepper */}
                    <div className="flex gap-4 mb-8">
                        <div className={`flex-1 p-4 rounded-xl border-2 transition-colors relative overflow-hidden ${step === 1 ? 'border-sage-500 bg-sage-50' : 'border-stone-100 bg-white opacity-60'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <Cpu size={24} className={step === 1 ? "text-forest-dark" : "text-stone-300"} />
                                <StatusIcon status={llmStatus} />
                            </div>
                            <div className="font-bold text-forest-dark text-sm">1. The Brain</div>
                            <div className="text-xs text-stone-500">Ollama (Llama 3)</div>
                        </div>
                        <div className={`flex-1 p-4 rounded-xl border-2 transition-colors relative overflow-hidden ${step === 2 ? 'border-sage-500 bg-sage-50' : 'border-stone-100 bg-white opacity-60'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <Server size={24} className={step === 2 ? "text-forest-dark" : "text-stone-300"} />
                                <StatusIcon status={whisperStatus} />
                            </div>
                            <div className="font-bold text-forest-dark text-sm">2. The Ears</div>
                            <div className="text-xs text-stone-500">Whisper Server</div>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="animate-fade-in">
                            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-forest-dark">Install Ollama</h3>
                                        <p className="text-xs text-stone-500">Powers summarization and context correction.</p>
                                    </div>
                                    <span className="bg-white border border-stone-200 px-2 py-1 rounded text-[10px] font-bold text-stone-400">PORT 11434</span>
                                </div>
                                
                                {os === 'mac' ? (
                                    <>
                                        <CodeBlock label="1. Download & Install" cmd="brew install ollama" />
                                        <CodeBlock label="2. Start Model" cmd="ollama run llama3" />
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4 text-xs text-stone-600 bg-blue-50 p-2 rounded border border-blue-100">
                                            <strong>Note:</strong> Windows requires WSL2 or the official installer.
                                        </div>
                                        <CodeBlock label="1. Download Installer" cmd="https://ollama.com/download/windows" />
                                        <CodeBlock label="2. Powershell: Start Model" cmd="ollama run llama3" />
                                    </>
                                )}
                                
                                <div className="mt-4 pt-4 border-t border-stone-200 flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Local URL</label>
                                        <input 
                                            value={llmUrl} 
                                            onChange={e => { setLlmUrl(e.target.value); setLlmStatus('unknown'); }}
                                            className="w-full bg-white text-stone-900 border border-stone-200 rounded p-2 text-sm font-mono focus:border-sage-500 outline-none" 
                                        />
                                    </div>
                                    <button onClick={() => { checkOllamaConnection(llmUrl).then(ok => setLlmStatus(ok ? 'success' : 'fail')) }} className="mt-5 text-xs font-bold underline text-stone-500 hover:text-forest-dark">Check Now</button>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => setStep(2)} className="bg-forest-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-forest-light shadow-lg flex items-center gap-2">
                                    Next: Audio Server <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                         <div className="animate-fade-in">
                            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-forest-dark">Install Whisper</h3>
                                        <p className="text-xs text-stone-500">Real-time speech-to-text engine (whisper.cpp).</p>
                                    </div>
                                    <span className="bg-white border border-stone-200 px-2 py-1 rounded text-[10px] font-bold text-stone-400">PORT 9000</span>
                                </div>
                                
                                {os === 'mac' ? (
                                    <>
                                        <CodeBlock label="1. Clone Repo" cmd="git clone https://github.com/ggerganov/whisper.cpp && cd whisper.cpp" />
                                        <CodeBlock label="2. Get Model" cmd="bash ./models/download-ggml-model.sh base.en" />
                                        <CodeBlock label="3. Compile & Run" cmd="make && ./server -m models/ggml-base.en.bin --port 9000" />
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4 text-xs text-stone-600 bg-blue-50 p-2 rounded border border-blue-100">
                                            <strong>Note:</strong> Requires CMake installed on Windows.
                                        </div>
                                        <CodeBlock label="1. Build" cmd="cmake -B build && cmake --build build --config Release" />
                                        <CodeBlock label="2. Run Server" cmd="./build/bin/Release/whisper-server.exe -m models/ggml-base.en.bin --port 9000" />
                                    </>
                                )}

                                <div className="mt-4 pt-4 border-t border-stone-200 flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">WebSocket URL</label>
                                        <input 
                                            value={whisperUrl} 
                                            onChange={e => { setWhisperUrl(e.target.value); setWhisperStatus('unknown'); }}
                                            className="w-full bg-white text-stone-900 border border-stone-200 rounded p-2 text-sm font-mono focus:border-sage-500 outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {globalStatus === 'fail' && (
                                <div className="text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2 text-xs font-bold mb-4 border border-red-100">
                                    <AlertCircle size={16} /> One or both services are unreachable. Check terminals.
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                 <button onClick={() => setStep(1)} className="text-stone-500 font-bold hover:text-forest-dark text-sm">Back to Ollama</button>
                                 <button 
                                    onClick={testConnections} 
                                    disabled={globalStatus === 'testing'}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${globalStatus === 'success' ? 'bg-green-600 text-white' : 'bg-forest-dark text-white hover:bg-forest-light'}`}
                                 >
                                    {globalStatus === 'testing' ? (
                                        <>Connecting... <RefreshCw size={16} className="animate-spin" /></>
                                    ) : globalStatus === 'success' ? (
                                        <>All Systems Online <CheckCircle size={18} /></>
                                    ) : (
                                        'Test Connection'
                                    )}
                                 </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocalSetup;
