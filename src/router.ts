import { useCallback, useEffect, useState } from 'react'

export type RoutePath = '/' | '/loading' | '/result' | '/about'

export function normalizePath(pathname: string): RoutePath {
  if (pathname === '/loading' || pathname === '/result' || pathname === '/about') return pathname
  return '/'
}

export function navigate(path: RoutePath) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRoute() {
  const [path, setPath] = useState<RoutePath>(() => normalizePath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const go = useCallback((nextPath: RoutePath) => navigate(nextPath), [])
  return { path, navigate: go }
}

