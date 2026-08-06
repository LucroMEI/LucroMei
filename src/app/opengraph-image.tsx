import { ImageResponse } from "next/og";

export const alt =
  "LucroMEI — Tire foto do comprovante e veja quanto realmente sobrou";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #ecfdf5 0%, #ffffff 45%, #f8fafc 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 56,
        }}
      >
        {/* Header brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#059669",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            L
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
              LucroMEI
            </span>
            <span style={{ fontSize: 20, color: "#047857", fontWeight: 600 }}>
              Feito para MEIs do Brasil
            </span>
          </div>
        </div>

        {/* Headline + demo card */}
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 40,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              Tire foto do comprovante
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#059669",
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              e veja quanto sobrou.
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#475569",
                fontWeight: 500,
                marginTop: 8,
              }}
            >
              Lucro estimado · DAS · 14 dias grátis
            </div>
          </div>

          {/* Mini dashboard card */}
          <div
            style={{
              width: 360,
              display: "flex",
              flexDirection: "column",
              background: "white",
              borderRadius: 24,
              border: "2px solid #e2e8f0",
              padding: 24,
              boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#334155",
                marginBottom: 16,
              }}
            >
              Resumo do caixa
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  flex: 1,
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: 14,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontSize: 12, color: "#065f46", fontWeight: 700 }}>
                  Receitas
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#064e3b",
                    marginTop: 4,
                  }}
                >
                  R$ 1.650
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: 14,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontSize: 12, color: "#9f1239", fontWeight: 700 }}>
                  Despesas
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#881337",
                    marginTop: 4,
                  }}
                >
                  R$ 458
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#0f172a",
                borderRadius: 16,
                padding: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
                Lucro estimado
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "white",
                  marginTop: 4,
                }}
              >
                R$ 1.192
              </span>
              <span style={{ fontSize: 14, color: "#6ee7b7", marginTop: 6 }}>
                DAS MEI ≈ R$ 80,90
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
