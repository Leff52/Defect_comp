require('dotenv').config()
const { Client } = require('pg')
const argon2 = require('argon2')
const { randomUUID } = require('crypto')

const DB_URL = process.env.DB_URL || process.env.DATABASE_URL
if (!DB_URL) {
	console.error('ERROR: set DB_URL in env (см. backend/.env.example)')
	process.exit(1)
}

async function main() {
	const client = new Client({ connectionString: DB_URL })
	await client.connect()
	console.log('Connected to DB')

	await client.query(`CREATE SCHEMA IF NOT EXISTS app;`)

	const roles = ['Engineer', 'Manager', 'Lead', 'Admin']
	for (const name of roles) {
		await client.query(
			`INSERT INTO app.roles (id, name)
       SELECT $1, $2
       WHERE NOT EXISTS (SELECT 1 FROM app.roles WHERE name = $2)`,
			[randomUUID(), name]
		)
		console.log('Ensured role:', name)
	}

	const adminEmail = 'admin@gmail.com'
	const plainPassword = '1234'
	const hash = await argon2.hash(plainPassword)

	const u = await client.query('SELECT id FROM app.users WHERE email = $1', [
		adminEmail,
	])
	let adminId
	if (u.rows.length === 0) {
		adminId = randomUUID()
		await client.query(
			`INSERT INTO app.users (id, email, password_hash, full_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, now(), now())`,
			[adminId, adminEmail, hash, 'Admin User']
		)
		console.log('Created admin user:', adminEmail)
	} else {
		adminId = u.rows[0].id
		await client.query(
			`UPDATE app.users SET password_hash = $1, updated_at = now() WHERE id = $2`,
			[hash, adminId]
		)
		console.log('Updated admin password for:', adminEmail)
	}

	const r = await client.query(
		'SELECT id FROM app.roles WHERE name = $1 LIMIT 1',
		['Admin']
	)
	if (r.rows.length === 0) throw new Error('Admin role not found')
	const adminRoleId = r.rows[0].id

	await client.query(
		`INSERT INTO app.user_roles (user_id, role_id)
     SELECT $1, $2
     WHERE NOT EXISTS (SELECT 1 FROM app.user_roles WHERE user_id = $1 AND role_id = $2)`,
		[adminId, adminRoleId]
	)
	console.log('Assigned Admin role to user')

	await client.end()
	console.log('✅ Seed complete. Login: admin@gmail.com / pass:  1234')
}

main().catch(e => {
	console.error('❌ Seed failed:', e)
	process.exit(1)
})
