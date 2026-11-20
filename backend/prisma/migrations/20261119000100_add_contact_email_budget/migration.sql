CREATE TABLE "ContactEmailBudget" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "attempts" INTEGER NOT NULL,

    CONSTRAINT "ContactEmailBudget_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContactEmailBudget_attempts_positive" CHECK ("attempts" > 0)
);
