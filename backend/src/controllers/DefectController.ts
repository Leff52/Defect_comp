import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DefectService } from '../services/DefectService';

// снизу это схема для валидации запросов на создание дефекта, вау
const CreateSchema = z.object({
  title: z.string().min(1).max(120),
  project_id: z.string().uuid(),
  description: z.string().max(4000).optional(),
  priority: z.enum(['low', 'med', 'high', 'critical']).default('med').optional(),
});

// а это контроллер для обработки HTTP запросов, связанных с дефектами, да, вот так вот
export class DefectController {
  constructor(private readonly service: DefectService) {}


  list = async (req: Request, res: Response, next: NextFunction) => {
    // ну и здесь я обрабатываю запрос на получение списка дефектов, с пагинацией
    try {
      const limit = parseInt(String(req.query.limit || '20'), 10); // в конце 10 это основание системы счисления, для того чтобы не забыть пишу
      const offset = parseInt(String(req.query.offset || '0'), 10);
      
      const data = await this.service.list(limit, offset);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

// а это метод для создания нового дефекта
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateSchema.parse(req.body);
      const result = await this.service.create(dto);
      
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };
}