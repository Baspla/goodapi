import dotenv from 'dotenv';
import exp from "node:constants";
dotenv.config();
export const DISCORD_CLIENT_ID: string = process.env.DISCORD_CLIENT_ID || '';
export const DISCORD_CLIENT_SECRET: string = process.env.DISCORD_CLIENT_SECRET || '';
export const DISCORD_GUILD_ID: string = process.env.DISCORD_GUILD_ID || '';
export const REDIRECT_URI: string = process.env.REDIRECT_URI || '';
export const JWT_SECRET: string = process.env.JWT_SECRET || '';
export const PORT: number = parseInt(process.env.PORT || '3000');
export const DATABASE_URL: string = process.env.DATABASE_URL || '';

const missingVariables = [];
if (!DISCORD_CLIENT_ID) missingVariables.push('DISCORD_CLIENT_ID');
if (!DISCORD_CLIENT_SECRET) missingVariables.push('DISCORD_CLIENT_SECRET');
if (!DISCORD_GUILD_ID) missingVariables.push('DISCORD_GUILD_ID');
if (!REDIRECT_URI) missingVariables.push('REDIRECT_URI');
if (!JWT_SECRET) missingVariables.push('JWT_SECRET');
if (!PORT) missingVariables.push('PORT');
if (!DATABASE_URL) missingVariables.push('DATABASE_URL');

if (missingVariables.length > 0) {
    console.error('Missing environment variables:', missingVariables.join(', '));
    process.exit(1);
}

export default {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_GUILD_ID,
    REDIRECT_URI,
    JWT_SECRET,
    PORT,
    DATABASE_URL
};