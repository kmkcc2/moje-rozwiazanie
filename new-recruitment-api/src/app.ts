import express from "express";
import { CandidatesController } from "./modules/candidates/candidates.controller";
import { CandidatesService } from "./modules/candidates/candidates.service";
import { CandidatesRepository } from "./repositories/candidates.repository";
import { JobOffersRepository } from "./repositories/job-offers.repository";
import { LegacyClient } from "./integrations/legacy/legacy.client";
import { setupDb } from "./db";

export const setupApp = async (deps?: { legacyClient?: InstanceType <typeof LegacyClient> }) => {
  const app = express();

  app.use(express.json());

  const db = await setupDb();

  const candidatesRepository = new CandidatesRepository(db);
  const jobOffersRepository = new JobOffersRepository(db);
  const legacyClient = deps?.legacyClient ?? new LegacyClient();
  const candidatesService = new CandidatesService(
    candidatesRepository,
    jobOffersRepository,
    legacyClient,
  );
  const candidatesController = new CandidatesController(candidatesService);

  app.use(candidatesController.router);

  return app;
};
