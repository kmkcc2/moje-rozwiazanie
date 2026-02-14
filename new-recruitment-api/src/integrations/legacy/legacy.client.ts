import { LegacyApiError } from "../../exceptions/legacy-api.exception";
import { CreateCandidateDto } from "../../modules/candidates/validators/create-candidate.validator";

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  expectedStatuses?: number[];
};

export class LegacyClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    const url = process.env.LEGACY_API_URL;
    const apiKey = process.env.LEGACY_API_KEY;
    if (!url) {
      throw new Error("LEGACY_API_URL is not defined");
    }
    if (!apiKey) {
      throw new Error("LEGACY_API_KEY is not defined");
    }

    this.baseUrl = url;
    this.apiKey = apiKey;
  }

  private async safeParseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json().catch(() => "");
    }
    return response.text().catch(() => "");
  }

  private async request(opts: RequestOptions) {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${opts.path}`, {
        method: opts.method,
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (error: any) {
      throw new LegacyApiError(
        `Legacy request failed: ${error?.message ?? String(error)}`,
        undefined,
        undefined,
      );
    }

    const okStatuses = opts.expectedStatuses ?? [200];
    if (okStatuses.includes(response.status)) {
      return;
    }

    const errorBody = await this.safeParseBody(response);
    throw new LegacyApiError(
      `Legacy api error (${opts.method} ${opts.path}) status=${response.status}`,
      response.status,
      errorBody,
    );
  }

  async createCandidate(dto: CreateCandidateDto): Promise<void> {
    await this.request({
      method: "POST",
      path: "/candidates",
      expectedStatuses: [201],
      body: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
      },
    });
  }
}
