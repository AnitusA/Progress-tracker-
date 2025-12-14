'use client'

import { useState, useEffect } from 'react'

export default function ProgressTracker() {
  const [goals, setGoals] = useState([])
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState({})
  const [statsData, setStatsData] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadGoals()
  }, [])

  useEffect(() => {
    if (goals.length > 0) {
      loadProgressData()
      loadStatsData()
    }
  }, [goals, selectedDate])

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

  const loadProgressData = async () => {
    try {
      const progressPromises = goals.map(async (goal) => {
        const response = await fetch(`/api/progress?goalId=${goal.id}&startDate=${selectedDate}&endDate=${selectedDate}`)
        if (response.ok) {
          const data = await response.json()
          return { goalId: goal.id, progress: data[0] || null }
        }
        return { goalId: goal.id, progress: null }
      })
      
      const results = await Promise.all(progressPromises)
      const progressMap = {}
      results.forEach(({ goalId, progress }) => {
        progressMap[goalId] = progress
      })
      setProgressData(progressMap)
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const loadStatsData = async () => {
    try {
      const statsPromises = goals.map(async (goal) => {
        const response = await fetch(`/api/stats?goalId=${goal.id}`)
        if (response.ok) {
          const data = await response.json()
          return { goalId: goal.id, stats: data }
        }
        return { goalId: goal.id, stats: null }
      })
      
      const results = await Promise.all(statsPromises)
      const statsMap = {}
      results.forEach(({ goalId, stats }) => {
        statsMap[goalId] = stats
      })
      setStatsData(statsMap)
    } catch (error) {
      console.error('Error loading stats:', error)
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

  const toggleProgress = async (goalId) => {
    try {
      const currentProgress = progressData[goalId]
      const completed = !currentProgress?.completed

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          date: selectedDate,
          completed,
          notes: ''
        })
      })

      if (response.ok) {
        loadProgressData()
        loadStatsData()
      }
    } catch (error) {
      console.error('Error toggling progress:', error)
    }
  }

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal? This will also delete all progress data.')) {
      return
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadGoals()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
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
      <h1 style={{ marginBottom: '2rem', color: '#1f2937', fontSize: '2.5rem' }}>📈 Progress Tracker</h1>
      
      {/* Date Selector */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
        <h2 style={{ marginBottom: '1rem', color: 'white' }}>📅 Track Progress for Date</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.75rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: 'white',
            color: '#333'
          }}
        />
      </div>

      {/* Statistics Dashboard */}
      {goals.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#1f2937', fontSize: '1.5rem' }}>📊 Today's Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {goals.map((goal) => {
              const stats = statsData[goal.id]
              const todayProgress = progressData[goal.id]
              if (!stats) return null

              return (
                <div key={goal.id} style={{ 
                  padding: '1rem', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: goal.color }}>{goal.title}</h3>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <div>✅ Completed: {stats.completedDays}/{stats.totalDays} days</div>
                    <div>🎯 Rate: {stats.completionRate}%</div>
                    <div>🔥 Current Streak: {stats.currentStreak}</div>
                    <div>🏆 Best Streak: {stats.longestStreak}</div>
                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: todayProgress?.completed ? '#10b981' : '#ef4444' }}>
                      Today: {todayProgress?.completed ? '✓ Done' : '✗ Pending'}
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ marginTop: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px' }}>
                    <div style={{ 
                      backgroundColor: goal.color, 
                      width: `${stats.completionRate}%`, 
                      height: '100%', 
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Add New Goal */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid #3b82f6', borderRadius: '12px', backgroundColor: '#eff6ff' }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e40af' }}>🎯 Add New Goal</h2>
        <form onSubmit={addGoal} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="Enter your goal..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            ➕ Add Goal
          </button>
        </form>
      </div>

      {/* Goals with Checkboxes */}
      <div>
        <h2 style={{ marginBottom: '1.5rem', color: '#1f2937', fontSize: '1.5rem' }}>✅ Your Goals for {new Date(selectedDate).toLocaleDateString()}</h2>
        {goals.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            🎯 No goals yet. Add your first goal above to start tracking your progress!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {goals.map((goal) => {
              const todayProgress = progressData[goal.id]
              const isCompleted = todayProgress?.completed || false
              const stats = statsData[goal.id]

              return (
                <div
                  key={goal.id}
                  style={{
                    padding: '1.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff',
                    borderColor: isCompleted ? '#22c55e' : '#e5e7eb',
                    transition: 'all 0.3s ease',
                    boxShadow: isCompleted ? '0 4px 6px rgba(34, 197, 94, 0.1)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Checkbox */}
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '1.2rem' }}>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleProgress(goal.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          marginRight: '0.75rem',
                          accentColor: goal.color,
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ 
                        color: goal.color || '#1f2937',
                        fontWeight: '600',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.7 : 1
                      }}>
                        {goal.title}
                      </span>
                    </label>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.5rem',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                      title="Delete goal"
                    >
                      🗑️
                    </button>
                  </div>

                  {goal.description && (
                    <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem', paddingLeft: '2.5rem' }}>
                      {goal.description}
                    </p>
                  )}

                  {/* Quick Stats for this Goal */}
                  <div style={{ paddingLeft: '2.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <span>🎯 Target: {goal.targetDays} days</span>
                      <span>📅 Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                      {stats && (
                        <>
                          <span style={{ color: '#059669' }}>✅ {stats.completedDays} completed</span>
                          <span style={{ color: '#dc2626' }}>🔥 {stats.currentStreak} streak</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ paddingLeft: '2.5rem', marginTop: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: isCompleted ? '#dcfce7' : '#fef3c7',
                      color: isCompleted ? '#166534' : '#92400e'
                    }}>
                      {isCompleted ? '✅ COMPLETED TODAY' : '⏳ PENDING'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}