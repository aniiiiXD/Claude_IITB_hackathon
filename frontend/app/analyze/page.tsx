import { PageNav } from '@/components/layout/page-nav'
import { AnalyzeClient } from './analyze-client'

export default async function AnalyzePage({
    searchParams,
}: {
    searchParams: Promise<{ demo?: string }>
}) {
    const { demo } = await searchParams
    return (
        <>
            <PageNav />
            <AnalyzeClient initialDemo={demo} />
        </>
    )
}
