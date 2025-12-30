-- Add security question and answer hash for password reset
ALTER TABLE "User"
  ADD COLUMN "securityQuestion" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "securityAnswerHash" TEXT NOT NULL DEFAULT '';
