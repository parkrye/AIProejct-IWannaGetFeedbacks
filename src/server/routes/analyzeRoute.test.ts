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

describe("POST /api/analyze", () => {
  it("should return analysis for valid text", async () => {
    // given
    const body = { text: "좋아 좋아 최고! 행복하다 너무 좋다!" };

    // when
    const res = await request(app).post("/api/analyze").send(body);

    // then
    expect(res.status).toBe(200);
    expect(res.body.analysis).toBeDefined();
    expect(res.body.analysis.keywords).toBeInstanceOf(Array);
    expect(res.body.analysis.keywords.length).toBeGreaterThan(0);
    expect(res.body.analysis.sentiment).toBe("positive");
  });

  it("should return 400 when text is missing", async () => {
    // given
    const body = {};

    // when
    const res = await request(app).post("/api/analyze").send(body);

    // then
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("text");
  });

  it("should return 400 when text is not a string", async () => {
    // given
    const body = { text: 123 };

    // when
    const res = await request(app).post("/api/analyze").send(body);

    // then
    expect(res.status).toBe(400);
  });

  it("should detect neutral sentiment for factual text", async () => {
    // given
    const body = { text: "서울에서 회의가 있었다." };

    // when
    const res = await request(app).post("/api/analyze").send(body);

    // then
    expect(res.status).toBe(200);
    expect(res.body.analysis.sentiment).toBe("neutral");
  });
});
