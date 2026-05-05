import { NextResponse } from 'next/server'

const SPECIALISTS = [
  { id: 'u2', name: 'Dr. Rajesh Mehra', specialty: 'Metabolic Geneticist — AIIMS New Delhi', expertise: ['Metabolic'] },
  { id: 'sp2', name: 'Dr. Sheela Nampoori', specialty: 'Neurogenetics — CMC Vellore', expertise: ['Neurogenetic'] },
  { id: 'sp3', name: 'Dr. Arun Bhatt', specialty: 'Clinical Immunologist — KEM Mumbai', expertise: ['Immunologic'] },
  { id: 'sp4', name: 'Dr. Pooja Dewan', specialty: 'Pediatric Metabolic — AIIMS Delhi', expertise: ['Metabolic'] },
]

export async function GET() {
  return NextResponse.json(SPECIALISTS)
}
