import { getStmStatus } from "./stm";
import { getRemStatus } from "./rem";
import type { CombinedStatus } from "./types";

export async function getCombinedStatus(): Promise<CombinedStatus> {
  const [stm, rem] = await Promise.all([getStmStatus(), getRemStatus()]);
  return {
    fetchedAt: new Date().toISOString(),
    stm,
    rem,
  };
}
