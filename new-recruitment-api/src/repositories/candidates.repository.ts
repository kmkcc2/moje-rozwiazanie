import type { Database } from "sqlite";
import { CreateCandidateDto } from "../modules/candidates/validators/create-candidate.validator";
import { Logger } from "../common/logger";

export type CandidateRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  notes: string;
  status: string;
  consentAt: string;
  createdAt: string;
};

const toIntId = (id: string | number): number => {
  const n = typeof id === "number" ? id : Number.parseInt(id, 10);
  if (!Number.isFinite(n)) throw new Error(`Invalid id: ${id}`);
  return n;
};

export class CandidatesRepository {
  private readonly logger = new Logger(CandidatesRepository.name);
  constructor(private readonly db: Database) {}

  async findAll(params: { limit: number; offset: number }) {
    return this.db.all(
      `
        SELECT *
        FROM Candidate
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `,
      [params.limit, params.offset],
    );
  }

  async countAll() {
    const row = await this.db.get(`SELECT COUNT(*) as count FROM Candidate`);
    return row.count as number;
  }

  async findByEmail(email: string): Promise<{ id: number } | null> {
    const row = await this.db.get<{ id: number }>(
      `SELECT id FROM Candidate WHERE email = ? LIMIT 1`,
      [email],
    );
    return row ?? null;
  }

  async create(payload: CreateCandidateDto): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  }> {
    const consentAt =
      payload.consentAt instanceof Date
        ? payload.consentAt.toISOString()
        : new Date(payload.consentAt as any).toISOString();

    const result = await this.db.run(
      `
      INSERT INTO Candidate (
        first_name,
        last_name,
        email,
        phone,
        years_of_experience,
        notes,
        status,
        consent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.phone,
        payload.yearsOfExperience,
        payload.notes ?? "",
        payload.status,
        consentAt,
      ],
    );

    const id = result.lastID as number;

    return {
      id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }

  async attachToJobOffers(args: {
    candidateId: number;
    jobOfferIds: Array<string | number>;
  }): Promise<void> {
    if (!args.jobOfferIds.length) return;

    await this.db.run("BEGIN");
    try {
      for (const jobOfferId of args.jobOfferIds) {
        await this.db.run(
          `
          INSERT OR IGNORE INTO CandidateJobOffer (candidate_id, job_offer_id)
          VALUES (?, ?)
          `,
          [args.candidateId, toIntId(jobOfferId)],
        );
      }
      await this.db.run("COMMIT");
    } catch (e) {
      this.logger.error(
        `Failed to attach candidate id ${args.candidateId} to job offers [${args.jobOfferIds.join(
          ",",
        )}]. Rolling back. Error: ${e}`,
      );
      await this.db.run("ROLLBACK");
      throw e;
    }
  }

  async delete(candidateId: number): Promise<void> {
    await this.db.run(`DELETE FROM Candidate WHERE id = ?`, [candidateId]);
    // relacje usuną się same dzięki ON DELETE CASCADE
  }
}
