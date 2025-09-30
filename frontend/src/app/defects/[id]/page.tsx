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

export default function DefectDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, hydrated } = useAuth();

  const [defect, setDefect] = useState<Defect | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [text, setText] = useState('');

  // универсальный рефреш одной карточки
  const refresh = async () => {
    if (!id) return;
    const d = await api<Defect>(`/api/defects/${id}`);
    setDefect(d);

    if (!token) return; // комменты/вложения после логина
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

  // функция для скачивания файла
  async function handleDownload(att: { id: string; file_name: string }) {
    try {
      const { blob, filename } = await apiBlobWithName(`/api/attachments/${att.id}/download`, token)
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // используем имя из ответа, а не из БД
      a.download = filename || att.file_name || 'attachment'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e) 
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
      // будующий тост об ошибке
    }
  };

  // показываю загрузку если дефект еще не загружен
  if (!defect) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-500">Загрузка...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* карточка */}
        <div className="bg-white border rounded p-4">
          <h1 className="text-xl font-semibold mb-1">{defect.title}</h1>
          <div className="text-sm text-slate-600 mb-2">
            Статус: {defect.status} • Приоритет: {defect.priority}
          </div>
          {defect.description && (
            <p className="text-sm whitespace-pre-wrap">{defect.description}</p>
          )}
        </div>

        {/* кнопки переходов статусов по ролям */}
        <StatusActions
          defectId={defect.id}
          current={defect.status}
          onChanged={(d) =>
            setDefect((prev) => (prev ? { ...prev, status: d.status } : prev))
          }
        />

        {/* комменты и вложения */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-3">Комментарии</h2>
            <div className="space-y-3 max-h-64 overflow-auto">
              {comments.map((c) => (
                <div key={c.id} className="text-sm border-b pb-2">
                  <div className="text-slate-500">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                  <div>{c.text}</div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-sm text-slate-500">Пока нет комментариев</div>
              )}
            </div>

            {token && (
              <div className="mt-3 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Написать комментарий…"
                  className="flex-1 border rounded px-3 py-2"
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
                  className="px-3 py-2 bg-slate-900 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Отправить
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Вложения</h2>
              {token && <FileUpload defectId={id} onUploaded={() => { refresh(); }} />}
            </div>
            <ul className="text-sm space-y-2 max-h-64 overflow-auto">
              {attachments.map((a) => (
                <li key={a.id} className="flex items-center justify-between border-b pb-1">
                  <span>{a.file_name}</span>
                  <button
                    onClick={() => handleDownload(a)}
                    className="text-blue-700 hover:text-blue-900 underline hover:no-underline transition-colors"
                  >
                    Скачать
                  </button>
                </li>
              ))}
              {attachments.length === 0 && (
                <li className="text-slate-500">Файлов нет</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
