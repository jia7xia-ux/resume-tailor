import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !jd) return alert("Upload resume + paste JD");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>AI Resume Tailor</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <textarea
        placeholder="Paste Job Description"
        rows={10}
        cols={60}
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      <pre style={{ marginTop: 30, whiteSpace: "pre-wrap" }}>
        {result}
      </pre>
    </div>
  );
}
