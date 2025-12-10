import * as crypto from 'crypto';
import { db } from '../../../src/utils/turso-client';

export async function generateApiKey(userId: string): Promise<string> {
    const id = crypto.randomBytes(8).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex'); // 64 characters
    const salt = crypto.randomBytes(32).toString('hex');
    
    const hash = crypto.createHash('sha256').update(secret + salt).digest('hex');
    
    await db.execute({
        sql: `
        INSERT INTO api_keys (id, user_id, key_hash, salt)
        VALUES (?, ?, ?, ?)
    `, args: [id, userId, hash, salt]
    });
    
    return `${id}.${secret}`;
}

export async function verifyApiKey(apiKey: string): Promise<boolean> {
    try {
        const [id, secret] = apiKey.split('.');
        
        if (!id || !secret) {
            return false;
        }
        
        const result = await db.execute({
            sql: `SELECT key_hash, salt FROM api_keys WHERE id = ?`,
            args: [id]
        });
        
        if (result.rows.length === 0) {
            return false;
        }
        
        const { key_hash, salt } = result.rows[0] as unknown as { key_hash: string; salt: string };
        const hash = crypto.createHash('sha256').update(secret + salt).digest('hex');
        
        return hash === key_hash;
    } catch (error) {
        console.error('API key verification error:', error);
        return false;
    }
}