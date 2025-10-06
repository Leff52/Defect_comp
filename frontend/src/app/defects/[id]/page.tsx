'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { api, apiBlobWithName } from '@/lib/api';
import { FileUpload } from '@/components/FileUpload';
import AuthGuard from '@/components/AuthGuard';
import { StatusActions } from '@/components/StatusActions';

type Status = 'new' | 'in_work' | 'review' | 'closed' | 'canceled';
type Priority = 'low' | 'med' | 'high' | 'critical';

type Defect = {
  id: string;
  title: string;
  description?: string | null;
  status: Status;      
  priority: Priority;   
  created_at: string;
  assignee_id?: string | null;
};

type Comment = {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
};

type Attachment = {
  id: string;
  file_name: string;
  url_or_path: string;
  created_at: string;
};

const statusLabels = {
  new: 'Новый',
  in_work: 'В работе',
  review: 'На проверке',
  closed: 'Закрыт',
  canceled: 'Отменён'
};

const priorityLabels = {
  low: 'Низкий',
  med: 'Средний',
  high: 'Высокий',
  critical: 'Критический'
};

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800'
    case 'in_work': return 'bg-indigo-100 text-indigo-800'
    case 'review': return 'bg-purple-100 text-purple-800'
    case 'closed': return 'bg-green-100 text-green-800'
    case 'canceled': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800'
    case 'high': return 'bg-orange-100 text-orange-800'
    case 'med': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
};

export default function DefectDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, hydrated, user } = useAuth();

  const [defect, setDefect] = useState<Defect | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [text, setText] = useState('');
  const [deletingAttachment, setDeletingAttachment] = useState<string | null>(null);

  const userRoles = user?.roles || [];
  const canDeleteAttachments = !userRoles.includes('Engineer');

  const refresh = async () => {
    if (!id) return;
    const d = await api<Defect>(`/api/defects/${id}`);
    setDefect(d);

    if (!token) return;
    const cs = await api<{ items: Comment[]; total: number }>(
      `/api/defects/${id}/comments?limit=100`,
      'GET',
      undefined,
      token
    );
    const at = await api<{ items: Attachment[]; total: number }>(
      `/api/defects/${id}/attachments`,
      'GET',
      undefined,
      token
    );
    setComments(cs.items);
    setAttachments(at.items);
  };

  async function handleDownload(att: { id: string; file_name: string }) {
    try {
      const { blob, filename } = await apiBlobWithName(`/api/attachments/${att.id}/download`, token)
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      a.download = filename || att.file_name || 'attachment'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e) 
    }
  }

  async function handleDeleteAttachment(attachmentId: string, fileName: string) {
    if (!token) return;
    if (!confirm(`Вы уверены, что хотите удалить файл "${fileName}"?`)) return;

    setDeletingAttachment(attachmentId);

    try {
      await api(`/api/attachments/${attachmentId}`, 'DELETE', undefined, token);
      await refresh(); // обновлю список файлов
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      alert(error.message || 'Ошибка при удалении файла');
    } finally {
      setDeletingAttachment(null);
    }
  }

  useEffect(() => {
		if (!hydrated) return
		if (!token) return
		if (!id) return
		;(async () => {
			try {
				await refresh()
			} catch (e: any) {
				if (e.message === 'Unauthorized') console.warn('401 on defect load')
				else console.error(e)
			}
		})()
	}, [hydrated, token, id])

  const addComment = async () => {
    if (!text.trim() || !token || !id) return;
    
    try {
      await api(`/api/defects/${id}/comments`, 'POST', { text }, token);
      setText('');
      await refresh();
    } catch (error: any) {
      console.error('Error adding comment:', error);
    }
  };

  if (!defect) {
    return (
      <AuthGuard>
        <div className="min-h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Загрузка дефекта...</div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{defect.title}</h1>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(defect.status)}`}>
                  {statusLabels[defect.status]}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(defect.priority)}`}>
                  {priorityLabels[defect.priority]}
                </span>
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  {new Date(defect.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {defect.description && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{defect.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <StatusActions
          defectId={defect.id}
          current={defect.status}
          onChanged={(d) =>
            setDefect((prev) => (prev ? { ...prev, status: d.status } : prev))
          }
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Комментарии</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {comments.map((c) => (
                <div key={c.id} className="border-l-4 border-blue-100 pl-4 py-3">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(c.created_at).toLocaleString('ru-RU')}
                  </div>
                  <div className="text-gray-800 leading-relaxed">{c.text}</div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg font-medium">Пока нет комментариев</div>
                  <div className="text-sm">Станьте первым, кто оставит комментарий, йоу</div>
                </div>
              )}
            </div>

            {token && (
              <div className="border-t pt-6">
                <div className="flex gap-3">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Добавить комментарий..."
                    className="flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addComment();
                      }
                    }}
                  />
                  <button
                    onClick={addComment}
                    disabled={!text.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Вложения</h2>
              {token && <FileUpload defectId={id} onUploaded={() => { refresh(); }} />}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{a.file_name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(a.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(a)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                    >
                      Скачать
                    </button>
                    {canDeleteAttachments && (
                      <button
                        onClick={() => handleDeleteAttachment(a.id, a.file_name)}
                        disabled={deletingAttachment === a.id}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingAttachment === a.id ? 'Удаление...' : 'Удалить'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {attachments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg font-medium">Нет вложений</div>
                  <div className="text-sm">Загрузите файлы для этого дефекта</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
