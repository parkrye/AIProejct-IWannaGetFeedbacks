import type { SnsPost, ParsedPost } from "../../shared/types.ts";

const MAX_TEXT_LENGTH = 5000;

export function validatePost(post: SnsPost): string[] {
  const errors: string[] = [];

  if (!post.text.trim() && !post.imageFile && !post.imageUrl) {
    errors.push("텍스트 또는 이미지 중 하나는 필수입니다.");
  }

  if (post.text.length > MAX_TEXT_LENGTH) {
    errors.push(`텍스트는 ${MAX_TEXT_LENGTH}자 이하여야 합니다.`);
  }

  return errors;
}

export async function parsePost(post: SnsPost): Promise<ParsedPost> {
  const imageDataUrl = post.imageFile ? await fileToDataUrl(post.imageFile) : post.imageUrl;

  return {
    text: post.text.trim(),
    hasImage: imageDataUrl !== null,
    imageDataUrl,
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("파일 읽기에 실패했습니다."));
    reader.readAsDataURL(file);
  });
}
