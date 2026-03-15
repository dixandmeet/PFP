import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
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
          borderRadius: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -3,
          }}
        >
          PF
        </span>
      </div>
    ),
    { ...size }
  )
}
