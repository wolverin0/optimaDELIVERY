const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string from .env
const connectionString = 'postgresql://postgres.nzqnibcdgqjporarwlzx:w0lv3r1n33x2x2AC!!@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

async function runMigrations() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        // Read and run rate limiting migration
        console.log('\n--- Running Rate Limiting Migration ---');
        const rateLimitingSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_rate_limiting.sql'),
            'utf8'
        );
        await client.query(rateLimitingSql);
        console.log('Rate limiting migration completed!');

        // Read and run email verification migration
        console.log('\n--- Running Email Verification Migration ---');
        const emailVerificationSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_email_verification.sql'),
            'utf8'
        );
        await client.query(emailVerificationSql);
        console.log('Email verification migration completed!');

        // Read and run team invitations migration
        console.log('\n--- Running Team Invitations Migration ---');
        const teamInvitationsSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_team_invitations.sql'),
            'utf8'
        );
        await client.query(teamInvitationsSql);
        console.log('Team invitations migration completed!');

        console.log('\n=== All migrations completed successfully! ===');

    } catch (error) {
        console.error('Migration error:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
        if (error.hint) console.error('Hint:', error.hint);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

runMigrations();
