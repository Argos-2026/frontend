import './App.css'
import './figma.css'
import { createAnalysis, isDemoArticleUrl } from './api/argos'
import { Footer, Header } from './components'
import { useRoute } from './router'
import { AboutPage } from './pages/AboutPage'
import { InputPage } from './pages/InputPage'
import { LoadingPage } from './pages/LoadingPage'
import { ResultPage } from './pages/ResultPage'
import { SummaryPage } from './pages/SummaryPage'

function App() {
  const { route, navigate } = useRoute()
  const { path, analysisId, isDemo = false } = route

  const handleAnalyze = async (articleUrl: string) => {
    const demo = isDemoArticleUrl(articleUrl)
    const accepted = await createAnalysis(articleUrl)
    navigate(`/loading/${encodeURIComponent(accepted.analysisId)}${demo ? '?demo=1' : ''}`)
  }

  const page = (() => {
    switch (path) {
      case '/loading':
        return analysisId ? <LoadingPage analysisId={analysisId} isDemo={isDemo} onCancel={() => navigate('/')} onComplete={() => navigate(`/summary/${encodeURIComponent(analysisId)}${isDemo ? '?demo=1' : ''}`)} /> : <InputPage onAnalyze={handleAnalyze} />
      case '/summary':
        return analysisId ? <SummaryPage analysisId={analysisId} isDemo={isDemo} onNewAnalysis={() => navigate('/')} onGoToResult={() => navigate(`/result/${encodeURIComponent(analysisId)}${isDemo ? '?demo=1' : ''}`)} /> : <InputPage onAnalyze={handleAnalyze} />
      case '/result':
        return analysisId ? <ResultPage analysisId={analysisId} isDemo={isDemo} onNewAnalysis={() => navigate('/')} onGoToLoading={() => navigate(`/loading/${encodeURIComponent(analysisId)}${isDemo ? '?demo=1' : ''}`)} /> : <InputPage onAnalyze={handleAnalyze} />
      case '/about':
        return <AboutPage />
      case '/':
      default:
        return <InputPage onAnalyze={handleAnalyze} />
    }
  })()

  return <div className="app-shell">{path !== '/loading' && <Header onNavigate={navigate} showNewAnalysis={path === '/result' || path === '/summary'} onNewAnalysis={() => navigate('/')} />}{page}{path !== '/loading' && <Footer />}</div>
}

export default App
