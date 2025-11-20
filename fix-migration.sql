-- Mark the failed migration as rolled back so new migrations can proceed
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251119_add_performance_indexes' 
AND finished_at IS NULL;
