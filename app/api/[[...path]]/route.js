import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase.js'
import { v4 as uuidv4 } from 'uuid'

// Goals API
export async function GET(request) {
  const { searchParams, pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    // Get all goals
    if (path === 'goals' || path === 'goals/') {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error
      return NextResponse.json(data || [])
    }

    // Get single goal
    if (path.startsWith('goals/') && path.split('/').length === 2) {
      const goalId = path.split('/')[1]
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }

    // Get progress for a goal
    if (path === 'progress' || path === 'progress/') {
      const goalId = searchParams.get('goalId')
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')

      let query = supabase
        .from('progress')
        .select('*')
        .order('date', { ascending: false })

      if (goalId) {
        query = query.eq('goalId', goalId)
      }

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return NextResponse.json(data || [])
    }

    // Get progress statistics
    if (path === 'stats' || path === 'stats/') {
      const goalId = searchParams.get('goalId')
      
      if (!goalId) {
        return NextResponse.json({ error: 'goalId is required' }, { status: 400 })
      }

      // Get all progress for this goal
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('goalId', goalId)
        .order('date', { ascending: true })

      if (progressError) throw progressError

      // Calculate statistics
      const totalDays = progressData.length
      const completedDays = progressData.filter(p => p.completed).length
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

      // Calculate current streak
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      const sortedProgress = [...progressData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )

      for (let i = 0; i < sortedProgress.length; i++) {
        if (sortedProgress[i].completed) {
          tempStreak++
          if (i === 0) currentStreak = tempStreak
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          if (i === 0) currentStreak = 0
          tempStreak = 0
        }
      }

      return NextResponse.json({
        totalDays,
        completedDays,
        completionRate: Math.round(completionRate),
        currentStreak,
        longestStreak
      })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    const body = await request.json()

    // Create a new goal
    if (path === 'goals' || path === 'goals/') {
      const newGoal = {
        id: uuidv4(),
        title: body.title,
        description: body.description || null,
        color: body.color || '#3b82f6',
        targetDays: body.targetDays || 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data, { status: 201 })
    }

    // Create or update progress
    if (path === 'progress' || path === 'progress/') {
      const { goalId, date, completed, notes } = body

      if (!goalId || !date) {
        return NextResponse.json(
          { error: 'goalId and date are required' },
          { status: 400 }
        )
      }

      // Check if progress already exists for this goal and date
      const { data: existingProgress } = await supabase
        .from('progress')
        .select('*')
        .eq('goalId', goalId)
        .eq('date', date)
        .single()

      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('progress')
          .update({
            completed,
            notes: notes || null,
            completedAt: completed ? new Date().toISOString() : null
          })
          .eq('id', existingProgress.id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      } else {
        // Create new progress
        const newProgress = {
          id: uuidv4(),
          goalId,
          date,
          completed,
          notes: notes || null,
          completedAt: completed ? new Date().toISOString() : null
        }

        const { data, error } = await supabase
          .from('progress')
          .insert([newProgress])
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data, { status: 201 })
      }
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    const body = await request.json()

    // Update a goal
    if (path.startsWith('goals/') && path.split('/').length === 2) {
      const goalId = path.split('/')[1]

      const updateData = {
        ...body,
        updatedAt: new Date().toISOString()
      }

      delete updateData.id
      delete updateData.createdAt

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    // Delete a goal (will cascade delete progress)
    if (path.startsWith('goals/') && path.split('/').length === 2) {
      const goalId = path.split('/')[1]

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}