import React, { useState, useRef, useEffect } from 'react';
import { Screen } from '../types';
import Header from './Header';
import { ProfileIcon, CameraCaptureIcon, CloseIcon, WarningIcon } from './Icons';

const InputField: React.FC<{ label: string; type?: string }> = ({ label, type = 'text' }) => (
    <div>
        <label className="text-sm font-semibold text-slate-500 px-1">{label}</label>
        <input 
            type={type} 
            className="w-full p-3 bg-black text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition placeholder:text-slate-400"
        />
    </div>
);


const CameraView: React.FC<{
  onCapture: (image: string) => void;
  onClose: () => void;
}> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (active && videoRef.current) {
          videoRef.current.srcObject = stream;
          setStream(stream);
        }
      } catch (err) {
        if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
            console.warn("Camera permission denied by user.");
            setError("Acesso à câmera negado. Por favor, habilite a permissão nas configurações do seu navegador para continuar.");
        } else {
             console.error("Error accessing camera: ", err);
             setError("Não foi possível acessar a câmera. Verifique se ela não está sendo usada por outro aplicativo e tente novamente.");
        }
      }
    };

    enableCamera();

    return () => {
      active = false;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
       {error ? (
        <div className="text-center flex flex-col items-center justify-center p-4">
            <WarningIcon />
            <p className="text-white text-lg my-4 max-w-sm">{error}</p>
            <button 
                onClick={onClose} 
                className="bg-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-600 transition-colors"
            >
                Entendi
            </button>
        </div>
      ) : (
        <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:opacity-75 transition-opacity">
                <CloseIcon className="w-8 h-8" />
            </button>
            <div className="absolute bottom-10 flex justify-center">
                <button onClick={handleCapture} className="p-2 rounded-full border-4 border-white hover:bg-white/20 transition-colors" aria-label="Tirar foto">
                    <CameraCaptureIcon className="h-16 w-16 text-white" />
                </button>
            </div>
        </>
      )}
    </div>
  );
};


const ProfileScreen: React.FC<{ setScreen: (screen: Screen) => void; }> = ({ setScreen }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  return (
    <div className="bg-slate-100 h-full flex flex-col">
      <Header title="MEU PERFIL" onBack={() => setScreen(Screen.Home)} />
      <div className="p-6 space-y-6 flex-grow">
        <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-300 flex items-center justify-center shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <ProfileIcon className="w-16 h-16 text-slate-500" />
                )}
            </div>
            <button onClick={() => setShowCamera(true)} className="bg-white text-slate-700 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-pink-50 transition-colors">
                ALTERAR FOTO
            </button>
        </div>
        
        <div className="space-y-4">
            <InputField label="NOME" />
            <InputField label="EMAIL" type="email" />
            <InputField label="SENHA" type="password" />
        </div>

      </div>
       <div className="p-6">
        <button className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors shadow-lg">
          SALVAR ALTERAÇÕES
        </button>
      </div>
       {showCamera && (
        <CameraView 
            onCapture={(image) => {
                setProfileImage(image);
                setShowCamera(false);
            }}
            onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default ProfileScreen;