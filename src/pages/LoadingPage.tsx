import { useEffect, useState } from 'react'
import { getAnalysisStatus, getApiErrorMessage } from '../api/argos'
import type { AnalysisStage, AnalysisStatusResponse } from '../api/argos'
import { Button, Card, Callout } from '../components'

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

type StageProgress = 'waiting' | 'active' | 'completed' | 'upcoming' | 'failed'

function getStageProgress(stage: AnalysisStage, index: number, analysis: AnalysisStatusResponse | null): StageProgress {
  if (!analysis) return 'waiting'
  if (analysis.status === 'QUEUED') return 'waiting'
  if (analysis.status === 'COMPLETED' || analysis.status === 'PARTIAL_COMPLETED') return 'completed'

  const activeIndexes = analysis.activeStages
    .map((activeStage) => stageOrder.indexOf(activeStage))
    .filter((activeIndex) => activeIndex >= 0)
  const lastActiveIndex = activeIndexes.length > 0 ? Math.max(...activeIndexes) : -1
  const active = analysis.activeStages.includes(stage)

  if (active) return analysis.status === 'FAILED' ? 'failed' : 'active'
  if (lastActiveIndex >= 0 && index < lastActiveIndex) return 'completed'
  return 'upcoming'
}

const stageProgressLabels: Record<StageProgress, string> = {
  waiting: '대기 중',
  active: '분석 중',
  completed: '완료',
  upcoming: '진행 예정',
  failed: '실패',
}

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
    <main className="page-content loading-page">
      <section className="loading-card-wrap">
        <p className="section-kicker">Argos is checking</p>
        <Card className="loading-card">
          <div className="loading-orbit" aria-hidden="true"><span /><span /><span /></div>
          <h1>{isFailed ? '판독에 실패했습니다.' : '판독 중입니다.'}</h1>
          <p>{error || (analysis ? statusLabel(analysis.status) : '분석 작업을 접수하고 있습니다.')}</p>

          {analysis && !isFailed && <div className="loading-status"><span className="chip chip-brand">{analysis.status}</span><span className="mono">ID {analysis.analysisId}</span></div>}

          <div className="progress-list">
            {stageOrder.map((stage, index) => {
              const progress = getStageProgress(stage, index, analysis)
              return <div className={`progress-row ${progress === 'active' ? 'active' : progress === 'completed' ? 'done' : progress === 'failed' ? 'failed' : ''}`} key={stage}><span>{progress === 'completed' ? '✓' : progress === 'active' ? '·' : progress === 'failed' ? '!' : index + 1}</span><strong>{stageLabels[stage]}</strong><small>{stageProgressLabels[progress]}</small></div>
            })}
          </div>

          {analysis?.error && <Callout title={isFailed ? '분석 실패 원인' : '일부 처리 안내'} tone={isFailed ? 'risk' : 'caution'}>{analysis.error.message}</Callout>}
          {analysis && analysis.warnings.length > 0 && <Callout title="일부 처리 안내" tone="caution">{analysis.warnings.map((warning) => warning.message).join(' ')}</Callout>}
          {error && <Callout title="상태 조회 오류" tone="risk">{error}</Callout>}
          {!isFailed && !error && <Callout title="판정 기준">분석 중인 단계는 API 상태 응답의 activeStages를 기준으로 표시합니다. 작업이 끝나면 결과 화면으로 이동합니다.</Callout>}
          <Button variant="ghost" onClick={onCancel}>{isFailed || error ? '처음으로 돌아가기' : '판독 화면 나가기'}</Button>
        </Card>
      </section>
    </main>
  )
}
