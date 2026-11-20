ALTER TABLE "Project"
  ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "caseStudy" JSONB;

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_featured_requires_publication"
  CHECK (NOT "isFeatured" OR ("isPublished" AND "deletedAt" IS NULL));

-- A project can be featured only while public, and at most one can occupy that slot.
CREATE UNIQUE INDEX "Project_one_featured"
  ON "Project" ("isFeatured")
  WHERE "isFeatured";
