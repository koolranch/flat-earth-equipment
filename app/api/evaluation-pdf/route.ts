import { NextResponse } from 'next/server'
import { generateEvaluationPDF } from '@/scripts/generateEvaluationPDF'
import { getUserLocale } from '@/lib/getUserLocale'

export async function POST(req: Request) {
  try {
    const {
      operatorName,
      operatorId,
      date,
      evaluatorName,
      evaluatorTitle,
      equipmentType,
      equipmentId,
      version = '2.3'
    } = await req.json()
    
    const locale = getUserLocale(req)
    
    // Generate PDF with locale support
    const pdfBytes = await generateEvaluationPDF({
      operatorName,
      operatorId,
      date,
      evaluatorName,
      evaluatorTitle,
      equipmentType,
      equipmentId,
      version,
      locale
    })
    
    const fileName = `evaluation-${locale}.pdf`
    
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
    
  } catch (error) {
    console.error('Evaluation PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate evaluation PDF' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const locale = getUserLocale(req)
    
    // Generate blank evaluation form
    const pdfBytes = await generateEvaluationPDF({
      version: '2.3',
      locale
    })
    
    const fileName = `evaluation-blank-${locale}.pdf`
    
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
    
  } catch (error) {
    console.error('Evaluation PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate evaluation PDF' },
      { status: 500 }
    )
  }
} 