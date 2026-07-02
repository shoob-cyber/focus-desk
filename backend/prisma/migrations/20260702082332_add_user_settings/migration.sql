-- AlterTable
ALTER TABLE "users" ADD COLUMN     "longBreakDuration" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "pomodoroDuration" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "shortBreakDuration" INTEGER NOT NULL DEFAULT 5;
