import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Decode params
    const title = searchParams.get('title') || 'Minifigür';
    const series = searchParams.get('series') || 'LEGO Koleksiyonu';
    const image = searchParams.get('image');

    // Default image if none provided
    const imgUrl = image && image !== 'null' ? image : 'https://minifigurlerim.com/og-image.jpg';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #f3f4f6 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f3f4f6 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            position: 'relative',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Frame Border */}
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

          {/* Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              padding: '60px 80px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left Col: Text Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '50%',
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#D22B2B',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontSize: 24,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: 30,
                }}
              >
                {series}
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: '#111827',
                  lineHeight: 1.1,
                  letterSpacing: '-2px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: 20,
                }}
              >
                {title}
              </div>

              {/* Brand Logo Watermark */}
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#9ca3af',
                  letterSpacing: '-1px',
                  marginTop: 60,
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

            {/* Right Col: Huge Figure Image */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50%',
                height: '100%',
              }}
            >
              {image && image !== 'null' && (
                <img
                  src={image}
                  alt="Figure"
                  width="400"
                  height="480"
                  style={{
                    maxHeight: '480px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.15))',
                  }}
                />
              )}
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
