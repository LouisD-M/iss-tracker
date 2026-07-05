import { useEffect, useState } from 'react'
import Globe from 'react-globe.gl'
import './App.css'

type IssPosition = {
  name: string
  id: number
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  visibility: string
  timestamp: number
}

type IssPoint = {
  lat: number
  lng: number
  name: string
  altitude: number
  velocity: number
}

const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544'

function App() {
  const [iss, setIss] = useState<IssPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const issPoint: IssPoint[] = iss
    ? [
        {
          lat: iss.latitude,
          lng: iss.longitude,
          name: 'ISS',
          altitude: iss.altitude,
          velocity: iss.velocity,
        },
      ]
    : []

  async function fetchIssPosition() {
    try {
      const response = await fetch(ISS_API_URL)

      if (!response.ok) {
        throw new Error('Impossible de récupérer la position de l’ISS.')
      }

      const data: IssPosition = await response.json()

      setIss(data)
      setError(null)
    } catch {
      setError('Erreur lors du chargement de la position ISS.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssPosition()

    const interval = window.setInterval(() => {
      fetchIssPosition()
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <main className="app">
      <Globe
        width={viewport.width}
        height={viewport.height}
        backgroundColor="#020617"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.18}

        pointsData={issPoint}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.04}
        pointRadius={0.35}
        pointColor={() => '#38bdf8'}

        htmlElementsData={issPoint}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.075}
        htmlElement={() => {
          const img = document.createElement('img')
          img.src = '/iss.png'
          img.className = 'iss-image'
          img.alt = 'ISS'
          return img
        }}
      />

      <div className="top-title">
        <span className="live-dot"></span>
        <span>ISS Live Tracker</span>
      </div>

      <div className="info-card">
        {loading && <p>Chargement de la position...</p>}

        {error && <p className="error">{error}</p>}

        {iss && (
          <>
            <div>
              <span>Latitude</span>
              <strong>{iss.latitude.toFixed(4)}</strong>
            </div>

            <div>
              <span>Longitude</span>
              <strong>{iss.longitude.toFixed(4)}</strong>
            </div>

            <div>
              <span>Altitude</span>
              <strong>{iss.altitude.toFixed(2)} km</strong>
            </div>

            <div>
              <span>Vitesse</span>
              <strong>{iss.velocity.toFixed(0)} km/h</strong>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default App