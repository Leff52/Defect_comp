'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/store/auth'
import { useToast } from '@/components/Toast'
import { createProject, updateProject, type Project } from '@/lib/api'

interface CreateProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: () => void
  initialData?: Project | null
  isEdit?: boolean
}

export function CreateProjectDialog({
  isOpen,
  onClose,
  onProjectCreated,
  initialData,
  isEdit = false
}: CreateProjectDialogProps) {
  const { token } = useAuth()
  const { show: showToast } = useToast()
  const [name, setName] = useState('')
  const [customer, setCustomer] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        setName(initialData.name)
        setCustomer(initialData.customer || '')
      } else {
        setName('')
        setCustomer('')
      }
    }
  }, [isOpen, initialData, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !name.trim()) return

    try {
      setLoading(true)
      
      if (isEdit && initialData) {
        await updateProject(initialData.id, {
          name: name.trim(),
          customer: customer.trim() || undefined,
        })
      } else {
        await createProject({
          name: name.trim(),
          customer: customer.trim() || undefined,
        })
      }

      showToast(
        isEdit ? 'Проект обновлен' : 'Проект создан',
        'success'
      )
      onProjectCreated()
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} project:`, error)
      showToast(
        isEdit ? 'Ошибка при обновлении проекта' : 'Ошибка при создании проекта',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Редактировать проект' : 'Создать проект'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Название проекта <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Введите название проекта"
              />
            </div>

            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
                Заказчик
              </label>
              <input
                type="text"
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Введите название заказчика"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isEdit ? 'Сохранить' : 'Создать'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}