import { PrismaClient } from "@prisma/client";

// 型チェックをunknownで一時的に無効化してprismaプロパティを生やせるようにする
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// デバッグ用にログ出力
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

// 1つのインスタンスを使いまわす
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
