import Redis from 'ioredis';
import config from './app.js';

const redis = new Redis(config.redis.url);

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;
