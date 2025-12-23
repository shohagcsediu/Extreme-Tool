import { useState } from "react";
import pdfjsLib from "./pdfWorker";

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setImages([]);
    setLoading(true);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const pdf = await pdfjsLib.getDocument(reader.result).promise;
      const result = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        result.push(canvas.toDataURL("image/jpeg", 1));
      }

      setImages(result);
      setLoading(false);
    };
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>PDF → JPG Converter</h2>
          <p style={styles.subtitle}>Client-side · Fast · Secure</p>

          <div
            style={{
              ...styles.dropZone,
              borderColor: drag ? "#4f46e5" : "#c7d2fe",
              background: drag ? "#eef2ff" : "#f8fafc",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              accept="application/pdf"
              style={styles.fileInput}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <p style={styles.dropText}>Drag & drop PDF here</p>
            <span style={styles.or}>or</span>
            <button style={styles.button}>Browse File</button>
          </div>

          {loading && (
            <div style={styles.loaderWrap}>
              <div style={styles.loader} className="spinner" />
              <p style={styles.loadingText}>Converting PDF...</p>
            </div>
          )}

          <div style={styles.grid}>
            {images.map((img, i) => (
              <div key={i} style={styles.imageCard}>
                <img src={img} alt="" style={styles.image} />
                <a href={img} download={`page-${i + 1}.jpg`} style={styles.download}>
                  Download Page {i + 1}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e0e7ff, #f8fafc)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "clamp(16px, 3vw, 40px)",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    width: "100%",
  },
  card: {
    width: "100%",
    maxWidth: "95vw",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "clamp(20px, 5vw, 40px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#1f2937",
    margin: "0 0 8px 0",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "clamp(14px, 2vw, 16px)",
    margin: "0 0 30px 0",
  },
  dropZone: {
    position: "relative",
    border: "2px dashed",
    borderRadius: "14px",
    padding: "clamp(30px, 5vw, 50px)",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  fileInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "pointer",
    width: "100%",
    height: "100%",
  },
  dropText: {
    fontSize: "clamp(14px, 2.5vw, 18px)",
    fontWeight: 500,
    color: "#374151",
    margin: "0 0 8px 0",
  },
  or: {
    display: "block",
    margin: "12px 0",
    color: "#9ca3af",
    fontSize: "14px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "clamp(13px, 2vw, 15px)",
    fontWeight: 600,
    cursor: "pointer",
    pointerEvents: "none",
  },
  loaderWrap: {
    textAlign: "center",
    marginTop: "30px",
    padding: "20px",
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%",
    margin: "0 auto 15px",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: "15px",
    fontWeight: 500,
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))",
    gap: "clamp(16px, 3vw, 24px)",
    marginTop: "30px",
  },
  imageCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    background: "#f9fafb",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
    marginBottom: "12px",
    display: "block",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  download: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#22c55e",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "clamp(12px, 2vw, 14px)",
    fontWeight: 600,
  },
};