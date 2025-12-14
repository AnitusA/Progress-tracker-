'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Plus, Target, TrendingUp, Calendar, Flame, Edit, Trash2 } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns'

export default function App() {
  const [goals, setGoals] = useState([])
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [progress, setProgress] = useState([])
  const [stats, setStats] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
    targetDays: 30
  })

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals()
  }, [])

  // Fetch progress when goal is selected
  useEffect(() => {
    if (selectedGoal) {
      fetchProgress(selectedGoal.id)
      fetchStats(selectedGoal.id)
    }
  }, [selectedGoal])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      const data = await response.json()
      setGoals(data)
      if (data.length > 0 && !selectedGoal) {
        setSelectedGoal(data[0])
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async (goalId) => {
    try {
      const response = await fetch(`/api/progress?goalId=${goalId}`)
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const fetchStats = async (goalId) => {
    try {
      const response = await fetch(`/api/stats?goalId=${goalId}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreateGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      })
      const data = await response.json()
      setGoals([data, ...goals])
      setSelectedGoal(data)
      setIsDialogOpen(false)
      setNewGoal({ title: '', description: '', color: '#3b82f6', targetDays: 30 })
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleUpdateGoal = async () => {
    try {
      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      })
      const data = await response.json()
      setGoals(goals.map(g => g.id === data.id ? data : g))
      setSelectedGoal(data)
      setIsDialogOpen(false)
      setIsEditMode(false)
      setNewGoal({ title: '', description: '', color: '#3b82f6', targetDays: 30 })
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    try {
      await fetch(`/api/goals/${goalId}`, { method: 'DELETE' })
      const newGoals = goals.filter(g => g.id !== goalId)
      setGoals(newGoals)
      setSelectedGoal(newGoals[0] || null)
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleToggleProgress = async (date, currentStatus) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: selectedGoal.id,
          date,
          completed: !currentStatus
        })
      })
      fetchProgress(selectedGoal.id)
      fetchStats(selectedGoal.id)
    } catch (error) {
      console.error('Error toggling progress:', error)
    }
  }

  const openEditDialog = (goal) => {
    setIsEditMode(true)
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      color: goal.color,
      targetDays: goal.targetDays
    })
    setIsDialogOpen(true)
  }

  // Generate last 30 days for progress tracking
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    return format(date, 'yyyy-MM-dd')
  })

  // Get progress status for a date
  const getProgressForDate = (date) => {
    return progress.find(p => p.date === date)
  }

  // Prepare chart data for completion rate
  const completionChartData = last30Days.map(date => {
    const progressItem = getProgressForDate(date)
    return {
      date: format(parseISO(date), 'MMM dd'),
      completed: progressItem?.completed ? 1 : 0
    }
  })

  // Prepare weekly data
  const weeklyData = []
  for (let i = 0; i < 4; i++) {
    const weekStart = startOfWeek(subDays(new Date(), i * 7))
    const weekEnd = endOfWeek(weekStart)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    const completedInWeek = daysInWeek.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const prog = getProgressForDate(dateStr)
      return prog?.completed
    }).length

    weeklyData.unshift({
      week: `Week ${4 - i}`,
      completed: completedInWeek,
      total: 7
    })
  }

  // Calendar heatmap data (last 90 days)
  const last90Days = Array.from({ length: 90 }, (_, i) => {
    const date = subDays(new Date(), 89 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const prog = getProgressForDate(dateStr)
    return {
      date: dateStr,
      completed: prog?.completed || false
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Progress Tracker
                </h1>
                <p className="text-sm text-gray-600">Track your goals, build habits</p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setIsEditMode(false)
                setNewGoal({ title: '', description: '', color: '#3b82f6', targetDays: 30 })
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Update your goal details' : 'Set a new goal to start tracking your progress'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Daily Exercise, Read Books"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add more details about your goal..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2 mt-2">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newGoal.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewGoal({ ...newGoal, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="targetDays">Target Days</Label>
                    <Input
                      id="targetDays"
                      type="number"
                      min="1"
                      value={newGoal.targetDays}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDays: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={isEditMode ? handleUpdateGoal : handleCreateGoal}
                    disabled={!newGoal.title}
                  >
                    {isEditMode ? 'Update Goal' : 'Create Goal'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {goals.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Goals Yet</h2>
            <p className="text-gray-600 mb-6">Create your first goal to start tracking your progress!</p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Goals List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Goals</CardTitle>
                  <CardDescription>{goals.length} active goal{goals.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {goals.map(goal => (
                    <div
                      key={goal.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedGoal?.id === goal.id
                          ? 'border-current shadow-md scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ borderColor: selectedGoal?.id === goal.id ? goal.color : undefined }}
                      onClick={() => setSelectedGoal(goal)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: goal.color }}
                            />
                            <h3 className="font-semibold text-sm">{goal.title}</h3>
                          </div>
                          {goal.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDialog(goal)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteGoal(goal.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {selectedGoal && (
                <>
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Days</p>
                            <p className="text-2xl font-bold">{stats?.totalDays || 0}</p>
                          </div>
                          <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold">{stats?.completedDays || 0}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Completion Rate</p>
                            <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">{stats?.completionRate || 0}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Current Streak</p>
                            <p className="text-2xl font-bold">{stats?.currentStreak || 0} days</p>
                          </div>
                          <Flame className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="daily" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="daily">Daily Tracking</TabsTrigger>
                      <TabsTrigger value="charts">Charts</TabsTrigger>
                      <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                    </TabsList>

                    {/* Daily Tracking Tab */}
                    <TabsContent value="daily" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Last 30 Days Progress</CardTitle>
                          <CardDescription>
                            Check off the days you completed your goal
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {last30Days.map(date => {
                              const progressItem = getProgressForDate(date)
                              const isCompleted = progressItem?.completed || false
                              const dateObj = parseISO(date)
                              
                              return (
                                <div
                                  key={date}
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    isCompleted
                                      ? 'bg-green-50 border-green-500'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => handleToggleProgress(date, isCompleted)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-600">
                                      {format(dateObj, 'MMM dd')}
                                    </span>
                                    <Checkbox checked={isCompleted} />
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {format(dateObj, 'EEEE')}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Charts Tab */}
                    <TabsContent value="charts" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Completion Trend</CardTitle>
                          <CardDescription>Your daily completion over the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={completionChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="completed" 
                                stroke={selectedGoal.color} 
                                strokeWidth={3}
                                name="Completed"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Weekly Overview</CardTitle>
                          <CardDescription>Days completed per week</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={weeklyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="week" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="completed" fill={selectedGoal.color} name="Completed Days" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Streak Information</CardTitle>
                          <CardDescription>Your consistency metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Current Streak</span>
                                <span className="text-2xl font-bold text-orange-600">
                                  {stats?.currentStreak || 0} days
                                </span>
                              </div>
                              <Progress value={(stats?.currentStreak || 0) / (selectedGoal.targetDays || 30) * 100} className="h-3" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Longest Streak</span>
                                <span className="text-2xl font-bold text-blue-600">
                                  {stats?.longestStreak || 0} days
                                </span>
                              </div>
                              <Progress value={(stats?.longestStreak || 0) / (selectedGoal.targetDays || 30) * 100} className="h-3" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Heatmap Tab */}
                    <TabsContent value="heatmap">
                      <Card>
                        <CardHeader>
                          <CardTitle>Consistency Heatmap</CardTitle>
                          <CardDescription>Last 90 days activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-18 gap-1">
                            {last90Days.map(({ date, completed }) => (
                              <div
                                key={date}
                                className={`aspect-square rounded-sm transition-all ${
                                  completed
                                    ? 'opacity-100'
                                    : 'opacity-20'
                                }`}
                                style={{ backgroundColor: selectedGoal.color }}
                                title={`${format(parseISO(date), 'MMM dd, yyyy')} - ${completed ? 'Completed' : 'Not completed'}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                            <span>Less</span>
                            <div className="flex gap-1">
                              <div className="w-4 h-4 rounded-sm opacity-20" style={{ backgroundColor: selectedGoal.color }} />
                              <div className="w-4 h-4 rounded-sm opacity-60" style={{ backgroundColor: selectedGoal.color }} />
                              <div className="w-4 h-4 rounded-sm opacity-100" style={{ backgroundColor: selectedGoal.color }} />
                            </div>
                            <span>More</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}