import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { data } = await axios.post(
      'https://api.huddle01.com/api/v2/sdk/rooms/create-room',
      {
        title: 'Huddle01 Meet',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY as string,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
