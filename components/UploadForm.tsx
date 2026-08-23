"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type DragEvent, type FormEvent } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function UploadForm() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a JPEG, PNG, or WebP image.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Image must be 10 MB or smaller.";
    }

    return null;
  }

  function handleFile(file: File | null) {
    if (!file) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("image", selectedFile);

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/art", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      if (data.id) {
        router.push(`/art/${data.id}`);
        router.refresh();
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label
        htmlFor="image"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-10 text-center transition hover:border-stone-400 hover:bg-stone-50"
      >
        {previewUrl ? (
          <div className="relative h-56 w-full max-w-sm overflow-hidden rounded-xl">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-stone-900">
              Drag and drop your artwork here
            </p>
            <p className="mt-1 text-xs text-stone-500">
              JPEG, PNG, or WebP up to 10 MB
            </p>
          </>
        )}

        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-stone-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-black outline-none ring-stone-900 placeholder:text-stone-400 focus:ring-2"
            placeholder="Sunset over the hills"
          />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-stone-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-black outline-none ring-stone-900 placeholder:text-stone-400 focus:ring-2"
          placeholder="Share the story behind this piece..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium text-stone-700">
          Tags
        </label>
        <input
          id="tags"
          name="tags"
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-black outline-none ring-stone-900 placeholder:text-stone-400 focus:ring-2"
          placeholder="digital, portrait, landscape"
        />
        <p className="text-xs text-stone-500">Separate tags with commas.</p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Uploading..." : "Publish artwork"}
      </button>
    </form>
  );
}
