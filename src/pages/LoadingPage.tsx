import { useEffect, useState } from 'react'
import { getAnalysisStatus, getApiErrorMessage } from '../api/argos'
import type { AnalysisStatusResponse } from '../api/argos'
import { ArgosLogo, Button, Callout } from '../components'

function statusLabel(status: AnalysisStatusResponse['status']) {
  if (status === 'QUEUED') return '분석 대기 중'
  if (status === 'RUNNING') return '분석 진행 중'
  if (status === 'FAILED') return '분석 실패'
  if (status === 'PARTIAL_COMPLETED') return '분석 일부 완료'
  return '분석 완료'
}

export function LoadingPage({ analysisId, onCancel, onComplete }: { analysisId: string; onCancel: () => void; onComplete: () => void }) {
  const [analysis, setAnalysis] = useState<AnalysisStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false
    let timer: number | undefined

    const poll = async () => {
      try {
        const nextAnalysis = await getAnalysisStatus(analysisId)
        if (disposed) return
        setAnalysis(nextAnalysis)

        if (nextAnalysis.status === 'COMPLETED' || nextAnalysis.status === 'PARTIAL_COMPLETED') {
          onComplete()
          return
        }

        if (nextAnalysis.status === 'FAILED') return
        timer = window.setTimeout(() => { void poll() }, 2000)
      } catch (pollError) {
        if (!disposed) setError(getApiErrorMessage(pollError))
      }
    }

    void poll()
    return () => {
      disposed = true
      if (timer) window.clearTimeout(timer)
    }
  }, [analysisId, onComplete])

  const isFailed = analysis?.status === 'FAILED'

  return (
    <main className="figma-page loading-page">
      <section className="loading-screen">
        <ArgosLogo />
        <h1>{isFailed ? '판독에 실패했습니다.' : '기사의 핵심 키워드를 추출 중입니다.'}</h1>
        <p>{error || (analysis ? statusLabel(analysis.status) : '분석 작업을 접수하고 있습니다.')}</p>
        <div className="loading-detail" aria-live="polite">
          {analysis?.error && <Callout title={isFailed ? '분석 실패 원인' : '일부 처리 안내'} tone={isFailed ? 'risk' : 'caution'}>{analysis.error.message}</Callout>}
          {analysis && analysis.warnings.length > 0 && <Callout title="일부 처리 안내" tone="caution">{analysis.warnings.map((warning) => warning.message).join(' ')}</Callout>}
          {error && <Callout title="상태 조회 오류" tone="risk">{error}</Callout>}
        </div>
        <Button variant="ghost" onClick={onCancel}>{isFailed || error ? '처음으로 돌아가기' : '분석 취소'}</Button>
      </section>
    </main>
  )
}
