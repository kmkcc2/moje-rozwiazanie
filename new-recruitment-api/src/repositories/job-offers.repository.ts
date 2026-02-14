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

  async create() {}

  async existsMany(ids: string[]) {

    return true;
  }
}
