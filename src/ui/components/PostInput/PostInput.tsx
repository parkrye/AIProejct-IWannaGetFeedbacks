import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import type { SnsPost } from "../../../shared/types.ts";
import { validatePost } from "../../../domains/document-input/index.ts";
import "./PostInput.css";

interface PostInputProps {
  readonly onSubmit: (post: SnsPost) => void;
  readonly isDisabled: boolean;
}

export function PostInput({ onSubmit, isDisabled }: PostInputProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setErrors([]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setErrors([]);

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const post: SnsPost = { text, imageFile, imageUrl: imagePreviewUrl };
    const validationErrors = validatePost(post);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(post);
  };

  return (
    <form className="post-input" onSubmit={handleSubmit}>
      <h2 className="post-input__title">SNS 게시글 입력</h2>

      <textarea
        className="post-input__textarea"
        placeholder="게시글 텍스트를 입력하세요..."
        value={text}
        onChange={handleTextChange}
        rows={5}
        disabled={isDisabled}
      />

      <div className="post-input__image-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isDisabled}
          className="post-input__file-input"
        />

        {imagePreviewUrl && (
          <div className="post-input__preview">
            <img src={imagePreviewUrl} alt="미리보기" className="post-input__preview-img" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="post-input__remove-btn"
              disabled={isDisabled}
            >
              이미지 제거
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="post-input__errors">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      <button type="submit" className="post-input__submit" disabled={isDisabled}>
        {isDisabled ? "생성 중..." : "피드백 생성"}
      </button>
    </form>
  );
}
