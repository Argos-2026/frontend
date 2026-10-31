import { useEffect } from 'react'
import './App.css'
import { Footer, Header } from './components'
import { useRoute } from './router'
import { AboutPage } from './pages/AboutPage'
import { InputPage } from './pages/InputPage'
import { LoadingPage } from './pages/LoadingPage'
import { ResultPage } from './pages/ResultPage'

function App() {
  const { path, navigate } = useRoute()

  useEffect(() => {
    if (path !== '/loading') return undefined
    const timer = window.setTimeout(() => navigate('/result'), 1500)
    return () => window.clearTimeout(timer)
  }, [navigate, path])

  const page = (() => {
    switch (path) {
      case '/loading':
        return <LoadingPage onCancel={() => navigate('/')} />
      case '/result':
        return <ResultPage onNewAnalysis={() => navigate('/')} />
      case '/about':
        return <AboutPage />
      case '/':
      default:
        return <InputPage onAnalyze={() => navigate('/loading')} />
    }
  })()

  return <div className="app-shell"><Header activePath={path} onNavigate={(nextPath) => navigate(nextPath as typeof path)} onAnalyze={() => navigate('/')} />{page}<Footer /></div>
}

export default App
