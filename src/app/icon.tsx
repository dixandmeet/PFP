import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2a2e37",
          borderRadius: 112,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 220,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -8,
          }}
        >
          PF
        </span>
      </div>
    ),
    { ...size }
  )
}
