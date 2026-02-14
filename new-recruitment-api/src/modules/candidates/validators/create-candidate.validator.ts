import { z } from "zod";
import { ERecruitmentStatus } from "../interfaces/candidate.interface";

export const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(5),
  yearsOfExperience: z.number().int().min(0),
  notes: z.string().default(""),
  status: z.enum(ERecruitmentStatus).default(ERecruitmentStatus.NEW),
  consentAt: z.coerce.date(),
  jobOfferIds: z.array(z.string().min(1)).min(1),
});

export type CreateCandidateDto = z.infer<typeof createCandidateSchema>;
