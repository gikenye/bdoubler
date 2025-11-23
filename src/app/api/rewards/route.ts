import { NextRequest, NextResponse } from 'next/server';
import { getUserRewards } from '../../../lib/rewardsCalculator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const rewards = await getUserRewards(userId);
    return NextResponse.json(rewards);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}