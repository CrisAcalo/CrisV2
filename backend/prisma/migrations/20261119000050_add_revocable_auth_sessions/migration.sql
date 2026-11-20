ALTER TABLE "User" ADD COLUMN "lastTotpStep" BIGINT;

CREATE TABLE "AuthSession" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordFingerprint" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "mfaFingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("tokenHash")
);

CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Revoke existing sessions even if a role or password is subsequently restored.
CREATE FUNCTION "revoke_auth_sessions_on_identity_change"() RETURNS trigger AS $$
BEGIN
    DELETE FROM "AuthSession" WHERE "userId" = NEW."id";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "User_revoke_auth_sessions"
AFTER UPDATE OF "email", "passwordHash", "role", "deletedAt" ON "User"
FOR EACH ROW
WHEN (
    OLD."email" IS DISTINCT FROM NEW."email" OR
    OLD."passwordHash" IS DISTINCT FROM NEW."passwordHash" OR
    OLD."role" IS DISTINCT FROM NEW."role" OR
    OLD."deletedAt" IS DISTINCT FROM NEW."deletedAt"
)
EXECUTE FUNCTION "revoke_auth_sessions_on_identity_change"();
