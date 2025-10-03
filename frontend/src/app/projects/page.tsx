'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { CreateProjectDialog } from '@/components/CreateProjectDialog'
import { useToast } from '@/components/Toast'
import { getProjects, deleteProject, type Project } from '@/lib/api'

export default function ProjectsPage() {
  const { token, user } = useAuth()
  const isAuthenticated = !!token && !!user
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { show: showToast, Toast } = useToast()

  const limit = 20

  // проверка прав доступа
  const canEditProjects = () => {
    if (!user?.roles) return false
    return !user.roles.includes('Engineer')
  }

  const showAccessDeniedToast = () => {
    showToast('У вас нет прав для выполнения этого действия', 'error')
  }

  const handleCreateProject = () => {
    if (!canEditProjects()) {
      showAccessDeniedToast()
      return
    }
    setIsCreateDialogOpen(true)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchProjects()
  }, [isAuthenticated, router, page, searchQuery])

  const fetchProjects = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await getProjects({
        page,
        limit,
        ...(searchQuery && { q: searchQuery })
      })
      
      setProjects(data.items)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching projects:', error)
      showToast('Ошибка при загрузке проектов', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!token) return

    // проверка прав доступа
    if (!canEditProjects()) {
      showAccessDeniedToast()
      return
    }
    
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return

    try {
      await deleteProject(id)
      showToast('Проект удален', 'success')
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      showToast('Ошибка при удалении проекта', 'error')
    }
  }

  const handleEditProject = (project: Project) => {
    // проверка прав доступа
    if (!canEditProjects()) {
      showAccessDeniedToast()
      return
    }
    
    setEditingProject(project)
    setIsEditDialogOpen(true)
  }

  const handleProjectCreated = () => {
    setIsCreateDialogOpen(false)
    fetchProjects()
  }

  const handleProjectUpdated = () => {
    setIsEditDialogOpen(false)
    setEditingProject(null)
    fetchProjects()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(total / limit)

  if (!isAuthenticated) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-500">Проекты</h1>
        <button
          onClick={handleCreateProject}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            canEditProjects() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Создать проект
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск проектов..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1)
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchQuery ? 'Проекты не найдены' : 'Нет проектов'}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Заказчик
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Создан
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Обновлен
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {project.customer || 'Не указан'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(project.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canEditProjects() ? (
                          <>
                            <button
                              onClick={() => handleEditProject(project)}
                              className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-150"
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150"
                            >
                              Удалить
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">Нет прав</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Показано {(page - 1) * limit + 1}-{Math.min(page * limit, total)} из {total} проектов
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Назад
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Страница {page} из {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Далее
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <CreateProjectDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingProject(null)
        }}
        onProjectCreated={handleProjectUpdated}
        initialData={editingProject}
        isEdit={true}
      />
      
      <Toast />
    </div>
  )
}