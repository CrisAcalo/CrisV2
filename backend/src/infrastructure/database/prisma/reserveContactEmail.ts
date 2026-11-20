import { prisma } from './client';

export async function reserveContactEmail(dailyLimit: number): Promise<boolean> {
    if (dailyLimit === 0) return false;

    const reserved = await prisma.$queryRaw<{ attempts: number }[]>`
        INSERT INTO "ContactEmailBudget" ("id", "day", "attempts")
        VALUES ('portfolio', (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date, 1)
        ON CONFLICT ("id") DO UPDATE
        SET
            "day" = EXCLUDED."day",
            "attempts" = CASE
                WHEN "ContactEmailBudget"."day" < EXCLUDED."day" THEN 1
                ELSE "ContactEmailBudget"."attempts" + 1
            END
        WHERE "ContactEmailBudget"."day" < EXCLUDED."day"
            OR ("ContactEmailBudget"."day" = EXCLUDED."day" AND "ContactEmailBudget"."attempts" < ${dailyLimit})
        RETURNING "attempts"
    `;
    return reserved.length === 1;
}
