import { NextResponse } from 'next/server';
import { getCourseModules } from '@/lib/training/getCourseModules';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get('courseId') || 'forklift';
  const order = Number(searchParams.get('order') || '0');
  
  try {
    const { course, modules } = await getCourseModules(courseSlug);
    const row = modules.find((m:any) => m.order === order);
    
    return NextResponse.json({ 
      courseSlug, 
      order, 
      course: { id: course.id, slug: course.slug, title: course.title },
      row: row || null,
      allModules: modules.map(m => ({ order: m.order, title: m.title, content_slug: m.content_slug }))
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message, 
      courseSlug, 
      order 
    }, { status: 500 });
  }
}
