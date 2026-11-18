import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { COOKIE_NAME, readCookie, verifySession } from './auth';

const PUBLIC_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/validate-reset-token',
  '/api/auth/reset-password',
  '/api/health',
]);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins.length > 0 ? corsOrigins : true });

  // Protege todas as rotas /api, exceto login e health.
  // A sessão vem de um cookie HttpOnly assinado (ou Bearer, para clientes).
  app.use((req: any, res: any, next: any) => {
    if (!req.path.startsWith('/api/')) return next();
    if (req.method === 'OPTIONS') return next();
    if (PUBLIC_PATHS.has(req.path)) return next();

    const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const token = readCookie(req.headers.cookie, COOKIE_NAME) || bearer;
    if (!verifySession(token)) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Sessão expirada ou inválida. Faça login novamente.',
      });
    }
    return next();
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`IBSCN API rodando em http://0.0.0.0:${port}/api/health`);
}
bootstrap();
