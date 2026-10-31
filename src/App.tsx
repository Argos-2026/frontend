import './App.css'
import { createAnalysis } from './api/argos'
import { Footer, Header } from './components'
import { useRoute } from './router'
import { AboutPage } from './pages/AboutPage'
import { InputPage } from './pages/InputPage'
import { LoadingPage } from './pages/LoadingPage'
import { ResultPage } from './pages/ResultPage'

function App() {
  const { route, navigate } = useRoute()
  const { path, analysisId } = route

  const handleAnalyze = async (articleUrl: string) => {
    const accepted = await createAnalysis(articleUrl)
    navigate(`/loading/${encodeURIComponent(accepted.analysisId)}`)
  }

  const page = (() => {
    switch (path) {
      case '/loading':
        return analysisId ? <LoadingPage analysisId={analysisId} onCancel={() => navigate('/')} onComplete={() => navigate(`/result/${encodeURIComponent(analysisId)}`)} /> : <InputPage onAnalyze={handleAnalyze} />
      case '/result':
        return analysisId ? <ResultPage analysisId={analysisId} onNewAnalysis={() => navigate('/')} onGoToLoading={() => navigate(`/loading/${encodeURIComponent(analysisId)}`)} /> : <InputPage onAnalyze={handleAnalyze} />
      case '/about':
        return <AboutPage />
      case '/':
      default:
        return <InputPage onAnalyze={handleAnalyze} />
    }
  })()

  return <div className="app-shell"><Header activePath={path} onNavigate={navigate} onAnalyze={() => navigate('/')} />{page}<Footer /></div>
}

export default App
