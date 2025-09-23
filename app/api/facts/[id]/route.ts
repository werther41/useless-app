import { NextRequest, NextResponse } from 'next/server'
import { getFactById } from '@/lib/facts'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userIp = request.ip || 
                   request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

    const fact = await getFactById(params.id, userIp)
    
    if (!fact) {
      return NextResponse.json(
        { error: 'Fact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: fact
    })
  } catch (error) {
    console.error('Error fetching fact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fact' },
      { status: 500 }
    )
  }
}
