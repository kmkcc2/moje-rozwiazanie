import type { Database } from "sqlite";
import { CreateCandidateDto } from "../modules/candidates/validators/create-candidate.validator";

export class JobOffersRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<{ id: number } | null> {
    const row = await this.db.get<{ id: number }>(
      `SELECT id FROM Candidate WHERE email = ? LIMIT 1`,
      [email],
    );
    return row ?? null;
  }

  async existsMany(ids: string[]) {
    if (!ids || ids.length === 0) return false;

    const jobOfferIds = ids.map(() => "?").join(",");

    const row = await this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count 
     FROM JobOffer 
     WHERE id IN (${jobOfferIds})`,
      ids,
    );

    return (row?.count ?? 0) === ids.length;
  }
}
