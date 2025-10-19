"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
    setError(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const resp = await fetch(process.env.NEXT_PUBLIC_NODE_URL || "http://localhost:4000/predict", {
        method: "POST",
        body: form,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Request failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: 16 }}>
      <h1>CIFAR-10 Classifier</h1>
      <p>Upload an image. It will be resized to 224x224 for prediction.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input type="file" accept="image/*" onChange={onFileChange} />
        {preview && (
          <img src={preview} alt="preview" style={{ maxWidth: 320, borderRadius: 8 }} />
        )}
        <button type="submit" disabled={!file || loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginTop: 16 }}>Error: {error}</div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h2>Prediction</h2>
          <div>Class: {result.class} (index {result.index})</div>
        </div>
      )}
    </main>
  );
}


