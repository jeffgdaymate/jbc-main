'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  PhoneIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function CreateClientPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();

  // Estado do formulário com todos os campos
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    dataNascimento: '', // Formato YYYY-MM-DD vindo do input type="date"
    valorDisponivel: '',
    telefone: '',
    status: '',
    banco: '',
    descricao: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += match[1];
      if (match[2]) formatted += `.${match[2]}`;
      if (match[3]) formatted += `.${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      return formatted;
    }
    return value;
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += `(${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      return formatted;
    }
    return value;
  };

  // Atualiza o estado do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setFormData({ ...formData, [name]: formatCPF(value) });
    } else if (name === 'telefone') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Envia o formulário para a API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user || !user.id) {
      setError('Usuário não autenticado. Faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          valorDisponivel: parseFloat(formData.valorDisponivel),
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao criar cliente';
        try {
          const errorData = await response.json();
          console.error('Resposta de erro da API:', errorData);
          if (errorData && 'error' in errorData) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          const errorText = await response.text();
          errorMessage = errorText || 'Erro desconhecido na resposta da API';
        }
        throw new Error(errorMessage);
      }

      router.push('/clients');
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return <div className="p-8 text-center">Verificando autenticação...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/clients')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold">Criar Novo Cliente</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-6">
          {/* Seção de Informações Pessoais */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Informações Pessoais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo Nome */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Nome
                  </div>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Campo CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <IdentificationIcon className="h-5 w-5 mr-2 text-gray-500" />
                    CPF
                  </div>
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Campo Data de Nascimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Data de Nascimento
                  </div>
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Campo Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Telefone
                  </div>
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Campo Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Status
                  </div>
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="Digite o status"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção de Informações Financeiras */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Informações Financeiras</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo Valor Disponível */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Valor Disponível
                  </div>
                </label>
                <input
                  type="number"
                  name="valorDisponivel"
                  value={formData.valorDisponivel}
                  onChange={handleChange}
                  placeholder="R$ 0,00"
                  step="0.01"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Campo Banco */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Banco
                  </div>
                </label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  placeholder="Nome do banco"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção de Informações Adicionais */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Informações Adicionais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo Descrição */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Descrição
                  </div>
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descrição do cliente (opcional)"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/clients')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 font-medium"
          >
            {loading ? 'Criando...' : 'Criar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}