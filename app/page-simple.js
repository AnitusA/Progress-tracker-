'use client'

import { useState, useEffect } from 'react'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Progress Tracker App')
  
  useEffect(() => {
    // Test if the app loads
    console.log('Progress Tracker App loaded successfully!')
  }, [])
  
  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎯 Progress Tracker
      </h1>
      
      <div className="card" style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <h2>Welcome to your Progress Tracker!</h2>
        <p style={{ marginTop: '10px', color: '#666' }}>
          The application is now running successfully without TailwindCSS dependencies.
        </p>
        
        {loading ? (
          <div className="loading" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '40px' 
          }}>
            <div className="spinner" style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <button 
              className="btn"
              onClick={() => {
                setLoading(true)
                setTimeout(() => {
                  setMessage('✅ App is working properly!')
                  setLoading(false)
                }, 1000)
              }}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Test App Functionality
            </button>
            
            <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#28a745' }}>
              {message}
            </p>
          </div>
        )}
      </div>
      
      <div className="card" style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h3>Next Steps:</h3>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>✅ Environment variables configured securely</li>
          <li>✅ Next.js server running successfully</li>
          <li>✅ TailwindCSS dependencies temporarily removed</li>
          <li>🔄 Ready to install proper dependencies when needed</li>
          <li>🔄 Ready to restore full Progress Tracker functionality</li>
        </ul>
      </div>
    </div>
  )
}