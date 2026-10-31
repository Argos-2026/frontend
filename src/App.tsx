import { useState } from 'react'
import './App.css'
import {
  Banner,
  Button,
  Callout,
  Card,
  CheckRow,
  Chip,
  ClaimCard,
  DistributionBar,
  Dropzone,
  EvidenceRow,
  FactRow,
  Footer,
  Header,
  ImvainAxis,
  LoadingSteps,
  MetricBar,
  ProbabilityMeter,
  QuoteBlock,
  ScoreRing,
  SourceTable,
  Spectrum,
  StanceCard,
  StepCard,
  Tag,
  Tabs,
  TextField,
  Textarea,
  Thumbnail,
  VerdictBadge,
} from './components'

const sourceRows = [
  { source: '국가통계포털', type: '공공 데이터', date: '2024.03.12', reliability: 92 },
  { source: '한국은행 보도자료', type: '1차 출처', date: '2024.03.11', reliability: 88 },
  { source: '뉴스 아카이브', type: '기사 기록', date: '2024.03.13', reliability: 67 },
]

function App() {
  const [article, setArticle] = useState('올해 국내 소비자물가가 2%대로 안정되면서 가계 부담이 크게 줄었다는 분석이 나왔다.')
  const [activeTab, setActiveTab] = useState('판정 요약')
  const [isAnalyzed, setIsAnalyzed] = useState(false)

  const runAnalysis = () => {
    setIsAnalyzed(true)
    document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <Header onAnalyze={() => document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth' })} />

      <main className="app-main">
        <section className="hero">
          <div>
            <p className="eyebrow">Context-first fact checking</p>
            <h1>정보의 맥락을 읽고,<br /><span>판정을 설명합니다.</span></h1>
            <p className="hero-copy">아르고스는 뉴스의 진위만 표시하지 않습니다. 핵심 주장과 출처, 표현의 강도를 함께 살펴 누구나 판정의 이유를 이해할 수 있게 돕습니다.</p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth' })}>기사 판독 시작</Button>
              <Button size="lg" variant="ghost" onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })}>디자인 시스템 보기 →</Button>
            </div>
          </div>
          <div className="hero-aside" aria-label="샘플 판정 점수">
            <ScoreRing score={82} label="신뢰 점수" />
          </div>
        </section>

        <section className="section" id="analysis">
          <div className="section-heading">
            <div><p className="section-kicker">01 / Analyze</p><h2>판독할 기사를 넣어주세요.</h2></div>
            <p>기사 본문이나 URL을 입력하면 주장 단위로 맥락과 근거를 정리합니다.</p>
          </div>
          <div className="input-layout">
            <Card title="기사 입력" className="input-card">
              <TextField label="기사 제목 또는 URL" placeholder="https://example.com/news" value="https://news.example.com/article/2024-0312" onChange={() => undefined} />
              <Textarea label="본문 붙여넣기" placeholder="판독할 기사 내용을 입력하세요." value={article} onChange={setArticle} />
              <Dropzone />
              <div className="input-actions">
                <small>{article.length.toLocaleString()}자 입력됨 · JPG, PNG, PDF 지원</small>
                <Button size="lg" onClick={runAnalysis}>{isAnalyzed ? '다시 판독하기' : '판독 시작'} <span aria-hidden="true">→</span></Button>
              </div>
            </Card>
            <Card title="판독 프로세스">
              <LoadingSteps current={isAnalyzed ? 3 : 2} />
              <div style={{ height: 22 }} />
              <Callout title={isAnalyzed ? '판독이 완료되었습니다.' : '판정은 근거에서 시작합니다.'}>
                {isAnalyzed ? '아래 결과에서 핵심 주장과 출처별 근거를 확인해보세요.' : '출처의 성격과 문장의 표현 강도를 함께 살펴 맥락을 놓치지 않습니다.'}
              </Callout>
            </Card>
          </div>
        </section>

        <section className="section" id="result">
          <div className="section-heading">
            <div><p className="section-kicker">02 / Verdict</p><h2>판정 결과</h2></div>
            <Tabs items={['판정 요약', '근거 보기', '원문 비교']} active={activeTab} onChange={setActiveTab} />
          </div>
          <div className="result-layout">
            <Card className="result-card">
              <div className="verdict-header">
                <div>
                  <p className="eyebrow">{activeTab}</p>
                  <VerdictBadge verdict="caution" />
                  <h2>대체로 사실, 표현은 주의</h2>
                  <p>핵심 수치는 공공 통계와 대체로 일치하지만, ‘가계 부담이 크게 줄었다’는 표현은 확인된 수치보다 넓게 해석될 수 있습니다.</p>
                </div>
                <ScoreRing score={74} label="신뢰 점수" />
              </div>
              <div className="result-details">
                <ClaimCard claim="올해 국내 소비자물가가 2%대로 안정되었다." verdict="trust" summary="국가통계포털의 2024년 2월 소비자물가 상승률 2.9%와 일치합니다." />
                <ClaimCard claim="가계 부담이 크게 줄었다." verdict="caution" summary="물가 상승률 둔화만으로 가계의 체감 부담이 줄었다고 단정하기에는 주거·식료품 등 세부 항목 확인이 필요합니다." />
                <Banner tone="caution">수치의 방향은 확인되지만, 체감 부담에 대한 표현은 추가 맥락이 필요합니다.</Banner>
                <QuoteBlock source="기사 원문">물가가 안정세에 접어들면서 가계의 부담도 크게 줄어들 것으로 보인다.</QuoteBlock>
              </div>
            </Card>

            <div className="right-column">
              <Card title="판정 근거">
                <div className="showcase-stack">
                  <EvidenceRow source="국가통계포털" title="소비자물가 상승률 2.9%" score={92} />
                  <EvidenceRow source="한국은행" title="물가 안정세 평가" score={84} />
                  <EvidenceRow source="뉴스 아카이브" title="동일 주장 과거 보도" score={61} />
                </div>
              </Card>
              <Card title="분석 지표">
                <div className="showcase-stack">
                  <MetricBar label="출처 일치도" value={86} />
                  <MetricBar label="표현의 명확성" value={64} tone="caution" />
                  <MetricBar label="맥락 충분도" value={58} tone="iris" />
                  <ProbabilityMeter verdict="caution" probability={74} />
                </div>
              </Card>
              <Card title="주장 분포">
                <div className="showcase-stack">
                  <DistributionBar label="사실" value={62} color="brand" />
                  <DistributionBar label="주의" value={27} color="gold" />
                  <DistributionBar label="추정" value={11} color="iris" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="section" id="system">
          <div className="section-heading">
            <div><p className="section-kicker">03 / Design System</p><h2>아르고스 디자인 시스템</h2></div>
            <p>Figma의 Foundations와 Components를 실제 React 컴포넌트로 옮긴 인터랙티브 샘플입니다.</p>
          </div>

          <div className="showcase-grid">
            <div className="showcase-block wide">
              <h3>Buttons · Chips · Verdicts</h3>
              <div className="showcase-stack">
                <div className="showcase-row"><Button size="sm">Primary</Button><Button size="sm" variant="secondary">Secondary</Button><Button size="sm" variant="ghost">Ghost</Button><Button size="sm" variant="danger">Danger</Button></div>
                <div className="showcase-row"><Chip>Neutral chip</Chip><Chip tone="brand">Brand chip</Chip><Chip tone="trust">Trust</Chip><Chip tone="caution">Caution</Chip><Chip tone="risk">Risk</Chip><Chip tone="hold">Hold</Chip></div>
                <div className="showcase-row"><VerdictBadge verdict="trust" /><VerdictBadge verdict="caution" /><VerdictBadge verdict="risk" /><VerdictBadge verdict="hold" compact /></div>
                <div className="showcase-row"><Tag>경제</Tag><Tag color="gold">팩트체크</Tag><Tag color="iris">통계</Tag></div>
              </div>
            </div>
            <div className="showcase-block">
              <h3>ScoreRing · Spectrum</h3>
              <div className="showcase-stack">
                <div className="showcase-row"><ScoreRing score={82} label="신뢰도" /><ScoreRing score={48} label="위험도" /></div>
                <Spectrum position={58} />
              </div>
            </div>
            <div className="showcase-block wide">
              <h3>IMVAIN axis · Metrics</h3>
              <ImvainAxis values={[84, 62, 40, 57, 73]} />
              <div className="showcase-stack">
                <MetricBar label="정보성" value={84} />
                <MetricBar label="감정 자극" value={73} tone="risk" />
              </div>
            </div>
            <div className="showcase-block">
              <h3>Checks · Loading</h3>
              <div className="showcase-stack">
                <CheckRow label="출처가 존재합니다." checked detail="확인됨" />
                <CheckRow label="수치가 원문과 일치합니다." checked detail="92%" />
                <CheckRow label="맥락이 충분합니다." checked={false} detail="검토 필요" />
                <LoadingSteps current={2} />
              </div>
            </div>
            <div className="showcase-block wide">
              <h3>Stance cards · Callouts</h3>
              <div className="showcase-stack">
                <div className="showcase-row">
                  <StanceCard title="사실 기반" tone="trust" body="공식 출처에서 확인되는 내용입니다." />
                  <StanceCard title="맥락 필요" tone="caution" body="표현의 범위가 근거보다 넓습니다." />
                  <StanceCard title="검증 어려움" tone="risk" body="확인할 수 있는 출처가 부족합니다." />
                </div>
                <Callout title="검토 포인트" tone="caution">판정 색상은 판정에만 사용하고, gold는 장식 요소로 사용합니다.</Callout>
                <Banner tone="trust">공식 통계와 핵심 수치가 일치합니다.</Banner>
              </div>
            </div>
            <div className="showcase-block">
              <h3>Form · Upload</h3>
              <div className="showcase-stack">
                <TextField label="Label" placeholder="텍스트를 입력하세요" value="샘플 텍스트" onChange={() => undefined} />
                <Dropzone>이미지나 문서를 업로드하세요.</Dropzone>
                <div className="showcase-row"><Thumbnail alt="업로드 이미지 미리보기" /><span className="mono">thumbnail / 76 × 58</span></div>
              </div>
            </div>
            <div className="showcase-block">
              <h3>Facts · Steps</h3>
              <div className="fact-list">
                <FactRow label="검증한 출처" value="12개" />
                <FactRow label="분석 문장" value="24개" />
                <FactRow label="마지막 업데이트" value="방금 전" />
              </div>
              <StepCard step={1} title="핵심 주장 분리">한 문장 안의 사실과 해석을 나누어 읽습니다.</StepCard>
              <StepCard step={2} title="출처 교차 확인">서로 다른 성격의 출처를 비교합니다.</StepCard>
            </div>
            <div className="showcase-block full">
              <h3>SourceTable</h3>
              <SourceTable rows={sourceRows} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
