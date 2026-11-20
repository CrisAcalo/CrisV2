-- Migrate the legacy Project.techStack values into Skill and ProjectSkill before dropping it.
-- AlterTable
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE IF NOT EXISTS "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isFromLinkedIn" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ExperienceSkill" (
    "experienceId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ExperienceSkill_pkey" PRIMARY KEY ("experienceId","skillId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EducationSkill" (
    "educationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "EducationSkill_pkey" PRIMARY KEY ("educationId","skillId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProjectSkill" (
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ProjectSkill_pkey" PRIMARY KEY ("projectId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Skill_normalizedName_key" ON "Skill"("normalizedName");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExperienceSkill_experienceId_fkey') THEN
        ALTER TABLE "ExperienceSkill" ADD CONSTRAINT "ExperienceSkill_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExperienceSkill_skillId_fkey') THEN
        ALTER TABLE "ExperienceSkill" ADD CONSTRAINT "ExperienceSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EducationSkill_educationId_fkey') THEN
        ALTER TABLE "EducationSkill" ADD CONSTRAINT "EducationSkill_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EducationSkill_skillId_fkey') THEN
        ALTER TABLE "EducationSkill" ADD CONSTRAINT "EducationSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProjectSkill_projectId_fkey') THEN
        ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProjectSkill_skillId_fkey') THEN
        ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Project' AND column_name = 'techStack'
    ) THEN
        INSERT INTO "Skill" ("id", "name", "normalizedName", "isFromLinkedIn", "isPublic", "createdAt", "updatedAt")
        SELECT gen_random_uuid()::text, trim(value),
               regexp_replace(lower(trim(value)), '[[:space:]._-]', '', 'g'),
               false, true, now(), now()
        FROM (SELECT DISTINCT unnest("techStack") AS value FROM "Project") legacy
        WHERE trim(value) <> ''
        ON CONFLICT ("normalizedName") DO NOTHING;

        INSERT INTO "ProjectSkill" ("projectId", "skillId")
        SELECT project.id, skill.id
        FROM "Project" project
        CROSS JOIN LATERAL unnest(project."techStack") AS value
        JOIN "Skill" skill ON skill."normalizedName" = regexp_replace(lower(trim(value)), '[[:space:]._-]', '', 'g')
        ON CONFLICT DO NOTHING;

        ALTER TABLE "Project" DROP COLUMN "techStack";
    END IF;
END $$;
