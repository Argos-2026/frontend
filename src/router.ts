import { useCallback, useEffect, useState } from 'react'

export type RoutePath = '/' | '/loading' | '/result' | '/about'
export type AppRoute = {
  path: RoutePath
  analysisId?: string
}

export function normalizePath(pathname: string): AppRoute {
  const analysisRoute = pathname.match(/^\/(loading|result)\/([^/]+)$/)
  if (analysisRoute) {
    return { path: `/${analysisRoute[1]}` as '/loading' | '/result', analysisId: decodeURIComponent(analysisRoute[2]) }
  }

  if (pathname === '/about') return { path: '/about' }
  return { path: '/' }
}

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRoute() {
  const [route, setRoute] = useState<AppRoute>(() => normalizePath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setRoute(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const go = useCallback((nextPath: string) => navigate(nextPath), [])
  return { route, navigate: go }
}

