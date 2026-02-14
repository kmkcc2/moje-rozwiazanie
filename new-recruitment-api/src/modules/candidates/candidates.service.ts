import { BadRequestError } from "../../exceptions/bad-request.exception";
import { CreateCandidateDto } from "./validators/create-candidate.validator";
import { CandidatesRepository } from "../../repositories/candidates.repository";
import { ConflictError } from "../../exceptions/conflict.exception";
import { JobOffersRepository } from "../../repositories/job-offers.repository";
import { BadGatewayError } from "../../exceptions/bad-gateway.exception";
import { LegacyClient } from "../../integrations/legacy/legacy.client";
import { Logger } from "../../common/logger";

export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);
  constructor(
    private readonly candidatesRepo: CandidatesRepository,
    private readonly jobOffersRepo: JobOffersRepository,
    private readonly legacyClient: LegacyClient,
  ) {}

  async createCandidate(payload: CreateCandidateDto) {
    if (!payload.jobOfferIds || payload.jobOfferIds.length < 1) {
      throw new BadRequestError("Candidate must have at least one job offer.");
    }

    const existing = await this.candidatesRepo.findByEmail(payload.email);
    if (existing) {
      throw new ConflictError("Email must be unique.");
    }

    const offersExist = await this.jobOffersRepo.existsMany(
      payload.jobOfferIds,
    );
    if (!offersExist) {
      throw new BadRequestError("One or more job offers do not exist.");
    }

    const created = await this.candidatesRepo.create(payload);
    this.logger.info(
      `Created candidate with id ${created.id} and email ${created.email}`,
    );

    try {
      await this.candidatesRepo.attachToJobOffers({
        candidateId: created.id,
        jobOfferIds: payload.jobOfferIds,
      });

      await this.legacyClient.createCandidate(payload);

      return created;
    } catch (err) {
      this.logger.error(
        `Failed to create candidate in legacy system for candidate id ${created.id}. Rolling back. Error: ${err}`,
      );
      await this.candidatesRepo.delete(created.id);
      throw new BadGatewayError("Failed to create candidate in legacy system.");
    }
  }

  async getCandidates(params: { limit: number; offset: number }) {
    this.logger.info(
      `Fetching candidates with limit ${params.limit} and offset ${params.offset}`,
    );
    const data = await this.candidatesRepo.findAll(params);
    const total = await this.candidatesRepo.countAll();

    return { data, total };
  }
}
