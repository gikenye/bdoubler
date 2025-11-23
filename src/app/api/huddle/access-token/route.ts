import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, Role } from '@huddle01/server-sdk/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json(
      { error: 'roomId is required' },
      { status: 400 }
    );
  }

  try {
    const accessToken = new AccessToken({
      apiKey: process.env.API_KEY!,
      roomId: roomId as string,
      role: Role.HOST,
      permissions: {
        admin: true,
        canConsume: true,
        canProduce: true,
        canProduceSources: {
          cam: true,
          mic: true,
          screen: true,
        },
        canRecvData: true,
        canSendData: true,
        canUpdateMetadata: true,
      },
    });

    const token = await accessToken.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating access token:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}
