import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { join } from "path";
import { createTestApp } from "../app.ts";
import type express from "express";

let app: express.Express;

beforeAll(() => {
  const dataDir = join(process.cwd(), "data");
  app = createTestApp(dataDir);
});

describe("POST /api/generate", () => {
  it("should return 400 when personaIds is missing", async () => {
    // given
    const body = { postText: "테스트", imageLabels: [], textAnalysis: { keywords: [], sentiment: "neutral", topics: [] } };

    // when
    const res = await request(app).post("/api/generate").send(body);

    // then
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("personaIds");
  });

  it("should return 400 when personaIds is empty", async () => {
    // given
    const body = {
      postText: "테스트",
      imageLabels: [],
      textAnalysis: { keywords: [], sentiment: "neutral", topics: [] },
      personaIds: [],
    };

    // when
    const res = await request(app).post("/api/generate").send(body);

    // then
    expect(res.status).toBe(400);
  });

  it("should return 404 when persona ids are invalid", async () => {
    // given
    const body = {
      postText: "테스트",
      imageLabels: [],
      textAnalysis: { keywords: [], sentiment: "neutral", topics: [] },
      personaIds: ["nonexistent-persona"],
    };

    // when
    const res = await request(app).post("/api/generate").send(body);

    // then
    expect(res.status).toBe(404);
  });

  it("should return SSE stream for valid request (fallback mode)", async () => {
    // given
    const body = {
      postText: "오늘 카페에서 커피를 마셨다.",
      imageLabels: [],
      textAnalysis: { keywords: ["카페", "커피"], sentiment: "positive", topics: ["카페"] },
      personaIds: ["hype-teen"],
    };

    // when
    const res = await request(app)
      .post("/api/generate")
      .send(body)
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
        res.on("end", () => { callback(null, data); });
      });

    // then
    expect(res.status).toBe(200);
    const body2 = res.body as string;
    expect(body2).toContain("data: ");
    expect(body2).toContain("hype-teen");
    expect(body2).toContain("[DONE]");
  });
});
