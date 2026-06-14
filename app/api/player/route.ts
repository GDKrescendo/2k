import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get('slug');
  const teamType = searchParams.get('teamType') ?? 'curr';

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  const url = `${process.env.NBA2K_API_BASE}/players/${encodeURIComponent(slug)}?teamType=${teamType}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': process.env.NBA2K_API_KEY! },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream API error', status: res.status }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[player] fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
