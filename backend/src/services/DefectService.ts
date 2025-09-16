import { Repository } from 'typeorm';
import { Defect } from '../models/Defect';
import crypto from 'crypto';

// здесь я определяю интерфейс для входных данных при создании дефекта
interface CreateDefectInput {
  title: string;
  project_id: string;
  description?: string | null;
  priority?: 'low' | 'med' | 'high' | 'critical';
}

// а это сервис для работы с дефектами, бизнес-логика вся тут, туси туси на тусе
export class DefectService {
  constructor(private readonly repo: Repository<Defect>) {}

  async list(limit = 20, offset = 0): Promise<Defect[]> {
    return this.repo.find({
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' as any }, // ну тут я сортирую по дате создания, от новых к старым
    });
  }
  // здеся метод для создания нового дефекта 
  async create(input: CreateDefectInput): Promise<{ id: string }> {
    if (!input.title?.trim()) {
      throw new Error('Title is required');
    }

    const now = new Date();
    const entity = this.repo.create({
      id: crypto.randomUUID(),
      project_id: input.project_id,
      stage_id: null,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'med',
      assignee_id: null,
      status: 'new',
      due_date: null,
      created_at: now,
      updated_at: now,
    });

    await this.repo.insert(entity);
    
    return { id: entity.id };
  }
}