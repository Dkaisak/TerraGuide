"use client";

import { DifficultyToggle } from "@/components/ui/DifficultyToggle";
import { usePersistedState } from "@/hooks/usePersistedState";
import { DIFFICULTY_STORAGE_KEY } from "@/lib/storage";
import type { Difficulty } from "@/types/data";

export function DifficultySelector() {
  const [difficulty, setDifficulty] = usePersistedState<Difficulty>(
    DIFFICULTY_STORAGE_KEY,
    "CLASSIC",
  );

  return (
    <DifficultyToggle
      value={difficulty}
      onChange={setDifficulty}
      label={true}
      className="hidden sm:inline-flex"
    />
  );
}