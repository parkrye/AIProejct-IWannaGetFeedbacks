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

describe("GET /api/personas", () => {
  it("should return all loaded personas", async () => {
    // when
    const res = await request(app).get("/api/personas");

    // then
    expect(res.status).toBe(200);
    expect(res.body.personas).toBeInstanceOf(Array);
    expect(res.body.personas.length).toBeGreaterThan(0);
  });

  it("should return personas with required fields", async () => {
    // when
    const res = await request(app).get("/api/personas");

    // then
    const persona = res.body.personas[0];
    expect(persona.id).toBeDefined();
    expect(persona.name).toBeDefined();
    expect(persona.traits).toBeDefined();
    expect(persona.promptHint).toBeDefined();
    expect(persona.examplePatterns).toBeInstanceOf(Array);
  });
});

describe("GET /api/personas/categories", () => {
  it("should return persona categories", async () => {
    // when
    const res = await request(app).get("/api/personas/categories");

    // then
    expect(res.status).toBe(200);
    expect(res.body.categories).toBeInstanceOf(Array);
    expect(res.body.categories.length).toBeGreaterThan(0);
    expect(res.body.categories[0].category).toBe("personality");
  });
});
