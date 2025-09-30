'use client';
import { useState } from 'react';
import { apiForm } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { useToast } from '@/components/Toast';

export function FileUpload({ 
	defectId, 
	onUploaded 
}: { 
	defectId: string; 
	onUploaded?: () => void; 
}) {
	const { token } = useAuth();
	const [busy, setBusy] = useState(false);
	const { show: toast, Toast } = useToast();

	const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setBusy(true);
		try {
			const fd = new FormData();
			fd.append('file', file);
			await apiForm(`/api/defects/${defectId}/attachments`, 'POST', fd, token);
			toast('Файл загружен');
			e.target.value = ''; // корректный сброс
			onUploaded?.();
		} catch (err: any) {
			toast(err?.message ?? 'Ошибка загрузки файла');
		} finally {
			setBusy(false);
		}
	};

	return (
		<>
			<label className="inline-flex items-center gap-2 cursor-pointer">
				<span className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
					{busy ? 'Загрузка…' : 'Прикрепить файл'}
				</span>
				<input
					type="file"
					className="hidden"
					onChange={onChange}
					disabled={busy}
				/>
			</label>
			<Toast />
		</>
	);
}
