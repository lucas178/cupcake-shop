import React, { useState } from 'react';
import { Screen } from '../types';
import Header from './Header';
import { LogoIcon } from './Icons';

interface AdminLoginScreenProps {
    setScreen: (screen: Screen) => void;
    onLogin: (user: string, pass: string) => boolean;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ setScreen, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(username, password);
        if (!success) {
            setError('Usuário ou senha inválidos.');
        }
    };

    return (
        <div className="bg-slate-100 h-full flex flex-col">
            <Header title="Login Administrativo" onBack={() => setScreen(Screen.Home)} />
            <div className="flex-grow flex flex-col justify-center items-center p-6 space-y-6">
                <div className="w-28 h-28 bg-white rounded-full shadow-lg overflow-hidden">
                  <LogoIcon className="w-full h-full" />
                </div>
                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-500 px-1">Usuário</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 mt-1 bg-black text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition placeholder:text-slate-400"
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-500 px-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 mt-1 bg-black text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition placeholder:text-slate-400"
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors shadow-lg">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginScreen;