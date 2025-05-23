import { PrismaClient } from '@prisma/client';

// Verifica se já existe uma instância do PrismaClient no globalThis
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Cria ou reutiliza a instância existente
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Em desenvolvimento, salva a instância no globalThis para evitar hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}