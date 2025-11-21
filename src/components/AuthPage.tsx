import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
  darkMode: boolean;
}

const AuthPage = ({ onAuthSuccess, darkMode }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          onAuthSuccess();
        }, 1000);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setSuccess('Conta criada com sucesso! Fazendo login...');
        setTimeout(() => {
          onAuthSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitacao');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`p-8 ${
          darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'
        }`}>
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              YouTube Analytics Pro
            </h1>
            <p className="text-blue-100">
              Dashboard avancado com IA
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex mb-6 gap-2">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-blue-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-5 h-5 inline mr-2" />
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-purple-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Registrar
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Senha
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isLogin ? 'Sua senha' : 'Minimo 6 caracteres'}
                  minLength={6}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                isLogin
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processando...
                </div>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="w-5 h-5 inline mr-2" />
                      Entrar na Plataforma
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 inline mr-2" />
                      Criar Conta
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          <div className={`mt-6 text-center text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {isLogin ? (
              <p>
                Nao tem uma conta?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Registre-se aqui
                </button>
              </p>
            ) : (
              <p>
                Ja tem uma conta?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Faca login
                </button>
              </p>
            )}
          </div>
        </div>

        <div className={`px-8 py-4 border-t ${
          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>Seguro e privado</span>
            <span>•</span>
            <span>Dados criptografados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
