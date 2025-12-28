import { runMigrations, closeDatabase } from './models/database';

async function migrate(): Promise<void> {
    console.log('Running database migrations...');
    try {
        await runMigrations();
        console.log('Migrations completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

migrate();
