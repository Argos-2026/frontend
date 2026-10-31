import { useEffect, useState } from 'react'
import { getAnalysisStatus, getApiErrorMessage } from '../api/argos'
import type { AnalysisStage, AnalysisStatusResponse } from '../api/argos'
import { ArgosLogo, Button, Callout } from '../components'

const stageLabels: Record<AnalysisStage, string> = {
  FETCHING_ARTICLE: '기사 수집·정규화',
  EXTRACTING_CLAIMS: '주장 추출·검색 질의 생성',
  RETRIEVING_EVIDENCE: '외부 근거 검색·수집',
  SELECTING_EVIDENCE: '근거 선별·연결',
  VERIFYING_CLAIMS: '주장별 판정',
  ASSESSING_SOURCES: '기사 내부 정보원 평가',
  AGGREGATING_RESULT: '최종 결과 통합',
}

const stageOrder = Object.keys(stageLabels) as AnalysisStage[]

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
  const lastActiveIndex = analysis ? Math.max(...analysis.activeStages.map((stage) => stageOrder.indexOf(stage)), -1) : -1
  const progress = analysis?.status === 'COMPLETED' || analysis?.status === 'PARTIAL_COMPLETED'
    ? 100
    : analysis?.status === 'FAILED'
      ? Math.max(10, Math.round(((lastActiveIndex + 1) / stageOrder.length) * 100))
      : analysis
        ? Math.min(95, Math.max(15, Math.round(((lastActiveIndex + 0.5) / stageOrder.length) * 100)))
        : 10

  return (
    <main className="figma-page loading-page">
      <section className="loading-screen">
        <ArgosLogo />
        <div className="loading-progress" aria-label={`분석 진행률 ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
        <strong className="loading-percent">{progress}%</strong>
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
