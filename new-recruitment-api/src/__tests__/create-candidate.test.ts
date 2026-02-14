import request from "supertest";
import { Application } from "express";
import { setupApp } from "../app";
import { ERecruitmentStatus } from "../modules/candidates/interfaces/candidate.interface";
import { LegacyClient } from "../integrations/legacy/legacy.client";

describe("Create Candidate", () => {
  let app: Application;

  beforeAll(async () => {
    process.env.LEGACY_API_URL = "http://legacy-mock";
    process.env.LEGACY_API_KEY = "00000000-0000-0000-0000-000000000000";

    const legacyClient = new LegacyClient();

    jest.spyOn(legacyClient, "createCandidate").mockResolvedValue(undefined);
    
    app = await setupApp({ legacyClient });
  });

  it("should create a new candidate successfully", async () => {
    const payload = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: `jan.kowalski+${Date.now()}@example.com`,
      phone: "123123123",
      yearsOfExperience: 3,
      notes: "Strong candidate",
      status: ERecruitmentStatus.NEW,
      consentAt: new Date().toISOString(),
      jobOfferIds: ["1"],
    };

    const res = await request(app).post("/candidates").send(payload);

    expect(res.status).toBe(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      }),
    );
  });

  it("should return 400 when jobOfferIds is empty", async () => {
    const payload = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: `bad+${Date.now()}@example.com`,
      phone: "123123123",
      yearsOfExperience: 3,
      notes: "x",
      status: ERecruitmentStatus.NEW,
      consentAt: new Date().toISOString(),
      jobOfferIds: [] as string[],
    };

    const res = await request(app).post("/candidates").send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  it("should return 400 when email is invalid", async () => {
    const payload = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "not-an-email",
      phone: "123123123",
      yearsOfExperience: 3,
      notes: "x",
      status: ERecruitmentStatus.NEW,
      consentAt: new Date().toISOString(),
      jobOfferIds: ["1"],
    };

    const res = await request(app).post("/candidates").send(payload);

    expect(res.status).toBe(400);
  });
});
