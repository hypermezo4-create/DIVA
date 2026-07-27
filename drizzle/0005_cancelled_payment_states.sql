ALTER TYPE "payment_status" ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE "payment_attempt_status" ADD VALUE IF NOT EXISTS 'cancelled';
