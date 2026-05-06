import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Minifigür Serisi';
    const year = searchParams.get('year') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #fef2f2 2%, transparent 0%), radial-gradient(circle at 75px 75px, #fef2f2 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            position: 'relative',
            fontFamily: 'sans-serif',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Frame Border Top */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 40,
              right: 40,
              height: 20,
              backgroundColor: '#D22B2B',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center',
              width: '80%',
            }}
          >
            {year && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#D22B2B',
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '100px',
                  fontSize: 24,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: 20,
                }}
              >
                {year}
              </div>
            )}

            <div
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: '#111827',
                lineHeight: 1.1,
                letterSpacing: '-3px',
                marginBottom: 40,
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#9ca3af',
                letterSpacing: '-1px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#111827',
                  borderRadius: 8,
                  marginRight: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'white', fontSize: 24 }}>✌️</span>
              </div>
              minifigürlerim.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate custom OG card image`, {
      status: 500,
    });
  }
}
