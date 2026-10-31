import { useState } from 'react'
import { Banner, Button, Callout, Card, ClaimCard, DistributionBar, EvidenceRow, FactRow, ImvainAxis, MetricBar, ProbabilityMeter, QuoteBlock, SourceTable, Spectrum, Tabs, VerdictBadge } from '../components'
import { claims, imvainItems, sampleArticle, sourceRows } from '../data/mockData'

export function ResultPage({ onNewAnalysis }: { onNewAnalysis: () => void }) {
  const [activeTab, setActiveTab] = useState('판정 요약')
  const [compact, setCompact] = useState(false)

  return (
    <main className={`page-content result-page ${compact ? 'is-compact' : ''}`}>
      <section className="result-topbar">
        <div><p className="section-kicker">Output page · {activeTab}</p><h1>{sampleArticle.title}</h1><p>{sampleArticle.description}</p></div>
        <div className="result-actions"><Button variant="secondary" size="sm" onClick={() => setCompact((value) => !value)}>{compact ? '자세히 보기' : '간단히 보기'}</Button><Button size="sm" onClick={onNewAnalysis}>새 기사 판독</Button></div>
      </section>

      <section className="result-summary section-soft">
        <div className="result-summary-heading"><div><p className="section-kicker">판정 분석</p><h2>일부 내용이 과장됐고,<br />이름을 밝히지 않은 출처에 많이 기대고 있습니다.</h2></div><div className="result-score"><VerdictBadge verdict="caution" /><strong>74</strong><small>신뢰 점수</small></div></div>
        <div className="summary-cards"><Card title="기사의 출처는 무엇인가"><p>기사 안에서 확인되는 출처의 성격과 작성 주체를 분리해 살펴봅니다.</p><FactRow label="공식 출처" value="3개" /><FactRow label="익명 출처" value="2개" /></Card><Card title="기사의 주장은 무엇을 말하는가"><p>핵심 문장을 사실·추정·의견으로 나누어 표현의 범위를 확인합니다.</p><FactRow label="검증 문장" value="8개" /><FactRow label="추정 문장" value="3개" /></Card></div>
        <Callout title="핵심 판정" tone="caution">공식 자료와 일치하는 수치가 있지만, 사업 중단을 단정하는 표현은 확인된 근거보다 넓습니다.</Callout>
      </section>

      <div className="result-tabs"><Tabs items={['판정 요약', '근거 보기', '원문 비교']} active={activeTab} onChange={setActiveTab} /><span className="mono">updated just now</span></div>

      <section className="result-columns">
        <div className="result-column">
          <Card title="사실 검증" className="result-section-card">
            <p className="card-description">기사의 핵심 주장과 확인 가능한 자료를 비교했습니다.</p>
            <div className="metric-stack"><MetricBar label="출처 일치도" value={86} /><MetricBar label="표현의 명확성" value={64} tone="caution" /><MetricBar label="맥락 충분도" value={58} tone="iris" /></div>
            <div className="claim-list">{claims.map((item) => <ClaimCard key={item.claim} claim={item.claim} verdict={item.verdict} summary={item.summary} />)}</div>
          </Card>
          <Card title="확인한 출처"><SourceTable rows={sourceRows} /></Card>
        </div>

        <div className="result-column">
          <Card title="출처 평가 (IMVAIN)" className="result-section-card">
            <p className="card-description">기사 속 출처들을 IMVAIN 기준으로 각각 확인했습니다.</p>
            <div className="imvain-summary"><div className="imvain-bars"><DistributionBar label="I 독립성" value={16} color="gold" /><DistributionBar label="M 복수성" value={0} color="iris" /><DistributionBar label="V 공정성" value={18} color="gold" /><DistributionBar label="A 출처성" value={52} color="brand" /><DistributionBar label="N 기명성" value={32} color="gold" /></div><ImvainAxis values={[16, 8, 18, 52, 32]} /></div>
            <div className="imvain-list result-imvain-list">{imvainItems.map((item) => <div className="imvain-row" key={item.key}><span className={`imvain-key imvain-${item.color}`}>{item.key}</span><div><strong>{item.label}</strong><p>{item.title}</p></div><span className="mono">{item.score}/6</span></div>)}</div>
          </Card>
          <Card title="판정 확률"><ProbabilityMeter verdict="caution" probability={74} /><div className="probability-list"><FactRow label="신뢰" value="18%" /><FactRow label="주의" value="74%" /><FactRow label="위험" value="8%" /></div></Card>
          <Card title="문장 스펙트럼"><Spectrum position={58} /><QuoteBlock source="기사 원문">복지 사업이 줄줄이 중단될 것으로 보인다.</QuoteBlock><Banner tone="caution">수치의 방향은 확인되지만, 결론의 표현은 추가 맥락이 필요합니다.</Banner></Card>
        </div>
      </section>

      {!compact && <section className="result-bottom section-soft"><div className="section-heading"><div><p className="section-kicker">Evidence</p><h2>검증에 사용한 근거</h2></div><p>출처의 신뢰도와 기사 주장과의 일치도를 함께 확인할 수 있습니다.</p></div><div className="evidence-grid"><EvidenceRow source="국가통계포털" title="지역별 예산 및 복지 지출 통계" score={92} /><EvidenceRow source="기획재정부" title="2024년도 예산안 및 보도자료" score={78} /><EvidenceRow source="뉴스 아카이브" title="동일 주장 과거 보도 비교" score={61} /></div></section>}
    </main>
  )
}

