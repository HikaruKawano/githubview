import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { suggestion } = await request.json();

    if (!suggestion || typeof suggestion !== 'string') {
      return NextResponse.json(
        { error: "O texto da sugestão é obrigatório" },
        { status: 400 }
      );
    }

    const savedSuggestion = await prisma.suggestion.create({
      data: {
        text: suggestion.trim(),
      },
    });

    return NextResponse.json(savedSuggestion, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar sugestão:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar sua sugestão' },
      { status: 500 }
    );
  }
}