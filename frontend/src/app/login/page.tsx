'use client';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LoginForm = {
  email: string;
  password: string;
};

/**
 * Страница входа в систему
 */
export default function LoginPage() {
  const { setAuth } = useAuth();
  const { register, handleSubmit } = useForm<LoginForm>();
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  /**
   * Обработчик отправки формы входа
   */
  const onSubmit = async (formData: LoginForm) => {
    try {
      setError(undefined);
      
      const response = await api<{ token: string; user: any }>(
        '/api/auth/login',
        'POST',
        formData
      );
      
      setAuth(response.token, response.user);
      router.replace('/defects');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа в систему');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать
          </h1>
          <p className="text-gray-600">
            Войдите в систему управления дефектами
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Электронная почта
              </label>
              <input
                {...register('email', { 
                  required: 'Введите email',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Введите корректный email'
                  }
                })}
                id="email"
                type="email"
                placeholder="example@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Пароль
              </label>
              <input
                {...register('password', { 
                  required: 'Введите пароль',
                  minLength: {
                    value: 4,
                    message: 'Пароль должен содержать минимум 4 символа'
                  }
                })}
                id="password"
                type="password"
                placeholder="Введите ваш пароль"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Войти в систему
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Система управления дефектами
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
