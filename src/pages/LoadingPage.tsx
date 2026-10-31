import { Button, Card, Callout } from '../components'
import { loadingSteps } from '../data/mockData'

export function LoadingPage({ onCancel }: { onCancel: () => void }) {
  return (
    <main className="page-content loading-page">
      <section className="loading-card-wrap">
        <p className="section-kicker">Argos is checking</p>
        <Card className="loading-card">
          <div className="loading-orbit" aria-hidden="true"><span /><span /><span /></div>
          <h1>판독 중입니다.</h1>
          <p>기사의 주장과 출처를 차례로 확인하고 있습니다. 잠시만 기다려주세요.</p>
          <div className="progress-list">
            {loadingSteps.map((step, index) => <div className={`progress-row ${index < 2 ? 'done' : index === 2 ? 'active' : ''}`} key={step}><span>{index < 2 ? '✓' : index + 1}</span><strong>{step}</strong><small>{index < 2 ? '완료' : index === 2 ? '분석 중' : '대기'}</small></div>)}
          </div>
          <Callout title="판정 기준">공식 출처와 익명 출처를 구분하고, 기사 표현이 확인된 근거보다 넓은지 살펴봅니다.</Callout>
          <Button variant="ghost" onClick={onCancel}>판독 취소</Button>
        </Card>
      </section>
    </main>
  )
}

