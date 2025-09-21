import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import { Express } from 'express'

export function setupSwagger(app: Express) {
	const options: swaggerJSDoc.Options = {
		definition: {
			openapi: '3.0.3',
			info: { title: 'Defect Management API', version: '1.0.0' },
			servers: [{ url: 'http://localhost:4000' }],
			components: {
				securitySchemes: {
					bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
				},
				schemas: {
					PageResult: {
						type: 'object',
						properties: {
							items: { type: 'array', items: { type: 'object' } },
							total: { type: 'integer' },
						},
					},
					LoginRequest: {
						type: 'object',
						required: ['email', 'password'],
						properties: {
							email: { type: 'string', format: 'email' },
							password: { type: 'string', minLength: 4 },
						},
					},
					LoginResponse: {
						type: 'object',
						properties: {
							token: { type: 'string' },
							user: {
								type: 'object',
								properties: {
									id: { type: 'string', format: 'uuid' },
									email: { type: 'string' },
									full_name: { type: 'string' },
									roles: { type: 'array', items: { type: 'string' } },
								},
							},
						},
					},
					Defect: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							project_id: { type: 'string', format: 'uuid' },
							stage_id: { type: 'string', format: 'uuid', nullable: true },
							title: { type: 'string' },
							description: { type: 'string', nullable: true },
							priority: {
								type: 'string',
								enum: ['low', 'med', 'high', 'critical'],
							},
							assignee_id: { type: 'string', format: 'uuid', nullable: true },
							status: {
								type: 'string',
								enum: ['new', 'in_work', 'review', 'closed', 'canceled'],
							},
							due_date: { type: 'string', format: 'date-time', nullable: true },
							created_at: { type: 'string', format: 'date-time' },
							updated_at: { type: 'string', format: 'date-time' },
						},
					},
					Comment: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							defect_id: { type: 'string', format: 'uuid' },
							author_id: { type: 'string', format: 'uuid' },
							text: { type: 'string' },
							created_at: { type: 'string', format: 'date-time' },
						},
					},
					Attachment: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							defect_id: { type: 'string', format: 'uuid' },
							author_id: { type: 'string', format: 'uuid' },
							file_name: { type: 'string' },
							mime_type: { type: 'string' },
							size_bytes: { type: 'string' },
							url_or_path: { type: 'string' },
							created_at: { type: 'string', format: 'date-time' },
						},
					},
				},
			},
			security: [{ bearerAuth: [] }],
		},
		apis: ['src/routes/*.ts'],
	}

	const spec = swaggerJSDoc(options)
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))
	app.get('/openapi.json', (_req, res) => res.json(spec))
}
