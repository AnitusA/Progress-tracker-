'use client'

import { useState, useEffect } from 'react'

export default function ProgressTracker() {
  const [goals, setGoals] = useState([])
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data || [])
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGoal = async (e) => {
    e.preventDefault()
    if (!newGoalTitle.trim()) return

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGoalTitle.trim(),
          description: '',
          color: '#3b82f6',
          targetDays: 30
        })
      })

      if (response.ok) {
        setNewGoalTitle('')
        loadGoals()
      }
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Progress Tracker</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>Progress Tracker</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add New Goal</h2>
        <form onSubmit={addGoal} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="Enter your goal..."
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Add Goal
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Your Goals</h2>
        {goals.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No goals yet. Add your first goal above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {goals.map((goal) => (
              <div
                key={goal.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', color: goal.color || '#1f2937' }}>
                  {goal.title}
                </h3>
                {goal.description && (
                  <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    {goal.description}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Target: {goal.targetDays} days | Created: {new Date(goal.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}