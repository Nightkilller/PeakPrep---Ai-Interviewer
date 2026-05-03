import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a', // standard black for favicon
          borderRadius: '8px',
        }}
      >
        <svg viewBox="0 0 100 100" width="24" height="24" fill="none">
          <path d="M35 25V75" stroke="#f5f0e8" strokeWidth="10" strokeLinecap="round" />
          <path d="M35 25H58C70 25 78 33 78 45C78 57 70 65 58 65H35" fill="#16a34a" fillOpacity="0.9" />
          <path d="M50 45L60 35L70 45" stroke="#f5f0e8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
