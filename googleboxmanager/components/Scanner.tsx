import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './Icons';

interface ScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    const startCamera = async () => {
      setError('');

      // 1. Check for Secure Context (Required for getUserMedia on most browsers)
      // Browsers block camera access on http:// unless it's localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        if(mounted) setError("摄像头需要 HTTPS 或 Localhost 安全环境。");
        return;
      }

      // 2. Check Browser Support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if(mounted) setError("您的浏览器不支持访问摄像头，请尝试使用 Chrome 或 Safari。");
        return;
      }

      try {
        // Try requesting the rear camera with 'ideal' constraint
        // 'ideal' is softer than 'exact', so it won't throw OverconstrainedError as easily
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' } 
          } 
        });
      } catch (err: any) {
        console.warn("Preferred camera request failed, trying fallback:", err);
        
        // If specific permission error, stop trying
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             if(mounted) setError("请允许浏览器访问摄像头权限。");
             return;
        }

        // Fallback: Try generic video (works for laptops or devices without 'environment' facing mode)
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
        } catch (err2: any) {
           console.error("Fallback camera failed:", err2);
           if(mounted) {
               if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
                   setError("请允许浏览器访问摄像头权限。");
               } else if (err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError') {
                   setError("未检测到摄像头设备。");
               } else {
                   setError("无法启动摄像头，请检查设备设置或使用手动输入。");
               }
           }
           return;
        }
      }

      if (mounted && videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        // Wait for video metadata to load before playing to avoid empty frames
        videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play().catch(e => console.error("Play error", e));
        };
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(manualId.trim()) {
      onScan(manualId.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm absolute top-0 w-full z-10">
        <h2 className="text-lg font-semibold">扫描箱子二维码</h2>
        <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {!error ? (
          <video 
            ref={videoRef} 
            playsInline 
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full max-w-sm mx-auto z-10">
             <div className="bg-red-500/20 p-4 rounded-full mb-4">
                 <XIcon className="w-8 h-8 text-red-400" />
             </div>
             <p className="text-lg font-medium mb-2">相机无法启动</p>
             <p className="text-gray-400 mb-6 text-sm leading-relaxed">{error}</p>
             <p className="text-xs text-gray-500">您可以直接输入箱子 ID 进行操作。</p>
          </div>
        )}
        
        {/* Scanner Overlay - Only show if no error */}
        {!error && (
            <div className="relative z-0 w-64 h-64 border-2 border-brand-500 rounded-2xl bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex items-center justify-center">
                <div className="w-60 h-0.5 bg-brand-500 animate-pulse shadow-[0_0_10px_#0ea5e9]"></div>
                
                {/* Simulation Click Area */}
                <button 
                onClick={() => onScan('box-001')}
                className="absolute -bottom-16 text-xs bg-gray-800/80 text-white px-4 py-2 rounded-full hover:bg-brand-600 transition-colors border border-gray-600 backdrop-blur-md"
                >
                (演示模式) 点击模拟扫描 box-001
                </button>
            </div>
        )}

        {!error && (
            <div className="absolute bottom-24 text-center w-full px-4 text-sm text-gray-300">
            请将二维码对准扫描框
            </div>
        )}
      </div>

      {/* Manual Entry Fallback */}
      <div className="p-6 bg-gray-900 pb-12">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input 
            type="text" 
            placeholder="或手动输入箱子 ID..." 
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button 
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            确定
          </button>
        </form>
      </div>
    </div>
  );
};

export default Scanner;