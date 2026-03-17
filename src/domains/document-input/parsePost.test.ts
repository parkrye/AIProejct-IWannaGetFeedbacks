import { describe, it, expect } from "vitest";
import { validatePost } from "./parsePost.ts";
import type { SnsPost } from "../../shared/types.ts";

describe("validatePost", () => {
  it("should return error when both text and image are empty", () => {
    // given
    const post: SnsPost = { text: "", imageFile: null, imageUrl: null };

    // when
    const errors = validatePost(post);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("필수");
  });

  it("should return no errors when text is provided", () => {
    // given
    const post: SnsPost = { text: "안녕하세요", imageFile: null, imageUrl: null };

    // when
    const errors = validatePost(post);

    // then
    expect(errors).toHaveLength(0);
  });

  it("should return error when text exceeds max length", () => {
    // given
    const post: SnsPost = { text: "a".repeat(5001), imageFile: null, imageUrl: null };

    // when
    const errors = validatePost(post);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("5000");
  });

  it("should return no errors when only image url is provided", () => {
    // given
    const post: SnsPost = { text: "", imageFile: null, imageUrl: "https://example.com/img.jpg" };

    // when
    const errors = validatePost(post);

    // then
    expect(errors).toHaveLength(0);
  });
});
