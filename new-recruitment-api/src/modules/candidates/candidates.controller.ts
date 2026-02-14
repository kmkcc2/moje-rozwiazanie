import { Request, Response, Router } from "express";
import { CandidatesService } from "./candidates.service";
import {
  CreateCandidateDto,
  createCandidateSchema,
} from "./validators/create-candidate.validator";
import { validateBody } from "../../middlewares/validate-request";
import { Logger } from "../../common/logger";

export class CandidatesController {
  private readonly logger = new Logger(CandidatesController.name);
  readonly router = Router();

  constructor(private readonly candidatesService: CandidatesService) {
    this.router.get("/candidates", this.getAll.bind(this));
    this.router.post(
      "/candidates",
      validateBody(createCandidateSchema),
      this.create.bind(this),
    );
  }

  async getAll(req: Request, res: Response) {
    this.logger.info(`Getting all candidates`);
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const candidates = await this.candidatesService.getCandidates({
      limit,
      offset,
    });

    res.json(candidates);
  }

  async create(req: Request, res: Response) {
    const dto = req.body as CreateCandidateDto;
    this.logger.info(`Creating candidate with email ${dto.email}`);

    const created = await this.candidatesService.createCandidate(dto);
    res.status(201).json(created);
  }
}
