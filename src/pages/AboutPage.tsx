import { Card, StepCard, Banner } from '../components'

export function AboutPage() {
  return <main className="page-content about-page"><section className="about-hero"><p className="eyebrow">About Argos</p><h1>판정을 설명하는<br /><span>뉴스 리더.</span></h1><p>아르고스는 뉴스가 사실인지 아닌지를 넘어, 어떤 근거로 그렇게 판단했는지 보여주는 맥락 중심 판독 서비스입니다.</p></section><section className="about-grid"><Card title="핵심 주장 분리"><StepCard step={1} title="주장 단위로 읽기">기사에서 검증 가능한 핵심 주장을 최대 3개까지 분리합니다.</StepCard><StepCard step={2} title="근거를 연결하기">각 주장에 판정 이유와 실제 수집된 외부 근거를 연결합니다.</StepCard></Card><Card title="정보원 평가"><StepCard step={3} title="IMVAIN 6개 기준">독립성, 복수성, 검증 가능성, 권위성, 정보성, 기명성을 따로 평가합니다.</StepCard><StepCard step={4} title="확인 범위를 밝히기">근거가 부족한 내용은 억지로 판정하지 않고 확인하지 못한 이유를 설명합니다.</StepCard></Card></section><Banner>정보의 맥락을 읽고, 판단의 근거를 남깁니다.</Banner></main>
}

