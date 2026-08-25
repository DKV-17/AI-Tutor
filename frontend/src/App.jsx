
import { useState, useEffect } from 'react'
import './App.css'
const API_BASE_URL = 'https://ai-tutor-6o9n.onrender.com'
function App() {
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [courses, setCourses] = useState([])
const [coursesLoading, setCoursesLoading] = useState(false)
const [coursesError, setCoursesError] = useState('')
const [selectedCourse, setSelectedCourse] = useState(null)
const [lessons, setLessons] = useState([])
const [lessonsLoading, setLessonsLoading] = useState(false)
const [lessonsError, setLessonsError] = useState('')
const [completedLessons, setCompletedLessons] = useState([])
const [chatMessages, setChatMessages] = useState([])
const [chatInput, setChatInput] = useState('')
const [chatLoading, setChatLoading] = useState(false)
const [conversationId, setConversationId] = useState(null)
const [chatError, setChatError] = useState('')
const [progress, setProgress] = useState([])
const [progressLoading, setProgressLoading] = useState(false)
const [progressError, setProgressError] = useState('')



useEffect(() => {
  const restoreLogin = async () => {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const savedUsername = localStorage.getItem('username')

    if (!accessToken || !refreshToken) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/token/refresh/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('access_token', data.access)

        setLoggedIn(true)
        setUsername(savedUsername || '')
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('username')

        setLoggedIn(false)
      }
    } catch (error) {
      console.log('Unable to restore login session')
    }
  }

  restoreLogin()
}, [])



  const handleLogin = async (e) => {
    e.preventDefault()

    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  localStorage.setItem('username', username)

  setLoggedIn(true)
} else {
        setMessage(
          data.detail || 'Invalid username or password'
        )
      }
    } catch (error) {
      setMessage(
        'Unable to connect to the server.'
      )
    } finally {
      setLoading(false)
    }
  }


  const handleViewCourses = async () => {
  setCoursesLoading(true)
  setCoursesError('')

  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      `${API_BASE_URL}/api/courses/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      setCourses(data)
    } else {
      setCoursesError(
        data.detail || 'Unable to load courses'
      )
    }
  } catch (error) {
    setCoursesError(
      'Unable to connect to the server.'
    )
  } finally {
    setCoursesLoading(false)
  }
}

const handleViewProgress = async () => {
    console.log("VIEW PROGRESS CLICKED")
  setProgressLoading(true)
  setProgressError('')

  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      `${API_BASE_URL}/api/courses/progress/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    console.log("PROGRESS RESPONSE:", response.status, data)

    if (response.ok) {
      setProgress(data)
    } else {
      setProgressError(
        data.detail || 'Unable to load progress'
      )
    }
  } catch (error) {
    setProgressError(
      'Unable to connect to the server.'
    )
  } finally {
    setProgressLoading(false)
  }
}

const handleLoadProgress = async () => {
  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      `${API_BASE_URL}/api/courses/progress/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      const completed = data
        .filter((progress) => progress.is_completed)
        .map((progress) => progress.lesson)

      setCompletedLessons(completed)
    }
  } catch (error) {
    console.error('Unable to load lesson progress')
  }
}

const handleViewLessons = async (course) => {
  setSelectedCourse(course)
  setLessonsLoading(true)
  setLessonsError('')

  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      `${API_BASE_URL}/api/courses/lessons/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      const courseLessons = data.filter(
        (lesson) => lesson.course === course.id
      )

      setLessons(courseLessons)
    } else {
      setLessonsError(
        data.detail || 'Unable to load lessons'
      )
    }
  } catch (error) {
    console.error(error)

    setLessonsError(
      'Unable to connect to the server.'
    )
  } finally {
    setLessonsLoading(false)
  }
}




useEffect(() => {
  if (loggedIn) {
    handleLoadProgress()
  }
}, [loggedIn])


const handleCompleteLesson = async (lessonId) => {
  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      `${API_BASE_URL}/api/courses/progress/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson: lessonId,
          is_completed: true,
        }),
      }
    )

    const data = await response.json()

    if (response.ok) {
      setCompletedLessons((previous) => [
        ...previous,
        lessonId,
      ])
    } else {
      alert(
        data.detail || 'Unable to mark lesson as completed'
      )
    }
  } catch (error) {
    alert('Unable to connect to the server.')
  }
}


const handleSendMessage = async (e) => {
  e.preventDefault()

  if (!chatInput.trim()) {
    return
  }

  const userMessage = chatInput.trim()

  setChatInput('')
  setChatError('')
  setChatLoading(true)

  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      `${API_BASE_URL}/api/chat/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          ...(conversationId && {
            conversation_id: conversationId,
          }),
        }),
      }
    )

    const data = await response.json()

    if (response.ok) {
      setConversationId(data.id)

      const messages = data.messages || []

      setChatMessages(messages)
    } else {
      setChatError(
        data.detail ||
        data.error ||
        'Unable to get AI response'
      )
    }
  } catch (error) {
    console.error(error)

    setChatError(
      'Unable to connect to the AI Tutor.'
    )
  } finally {
    setChatLoading(false)
  }
}



  const handleLogout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')

  setLoggedIn(false)
  setUsername('')
  setPassword('')
}

  if (loggedIn) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>AI Tutor</h1>
            <p>Welcome, {username}!</p>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="dashboard-content">

          <h2>Student Dashboard</h2>

          <p>
            Continue your learning journey with AI Tutor.
          </p>

          <div className="dashboard-cards">

            <div className="dashboard-card">
              <h3>📚 Courses</h3>
              <p>
                View your available courses and lessons.
              </p>
              <button onClick={handleViewCourses}>
  View Courses
</button>
            </div>

            {coursesLoading && (
  <p className="course-status">
    Loading courses...
  </p>
)}

{coursesError && (
  <p className="course-error">
    {coursesError}
  </p>
)}

{courses.length > 0 && (
  <div className="courses-section">

    <h2>Available Courses</h2>

    <div className="courses-list">

      {courses.map((course) => (
  <div
    className="course-item"
    key={course.id}
  >
    <h3>{course.title}</h3>

    <p>
      {course.description}
    </p>

    <button
      onClick={() => handleViewLessons(course)}
    >
      View Lessons
    </button>
  </div>
))}

    </div>

  </div>
)}


{selectedCourse && (
  <div className="lessons-section">

    <h2>
      Lessons - {selectedCourse.title}
    </h2>

    {lessonsLoading && (
      <p>Loading lessons...</p>
    )}

    {lessonsError && (
      <p className="course-error">
        {lessonsError}
      </p>
    )}

    {!lessonsLoading && lessons.length === 0 && (
      <p>
        No lessons available for this course.
      </p>
    )}

    <div className="lessons-list">

      {lessons.map((lesson) => (
  <div
    className="lesson-item"
    key={lesson.id}
  >

    <div>
      <span className="lesson-order">
        Lesson {lesson.order}
      </span>

      <h3>{lesson.title}</h3>

      <p>
        {lesson.content}
      </p>

      {completedLessons.includes(lesson.id) ? (
        <button disabled>
          ✓ Completed
        </button>
      ) : (
        <button
          onClick={() => handleCompleteLesson(lesson.id)}
        >
          Mark as Complete
        </button>
      )}

    </div>

  </div>
))}

    </div>

  </div>
)}



            <div className="dashboard-card">
              <h3>📈 My Progress</h3>
              <p>
                Track your completed lessons and learning progress.
              </p>
              <button onClick={handleViewProgress}>
  View Progress
</button>
            </div>


            {progressLoading && (
  <div className="progress-section">
    <p>Loading progress...</p>
  </div>
)}

{progressError && (
  <div className="progress-section">
    <p className="course-error">
      {progressError}
    </p>
  </div>
)}

{!progressLoading && progress.length > 0 && (
  <div className="progress-section">

    <h2>My Learning Progress</h2>

    <p>
      Completed Lessons: {
        progress.filter(
          (item) => item.is_completed
        ).length
      }
    </p>

    <div className="progress-list">

      {progress.map((item) => (
        <div
          className="progress-item"
          key={item.id}
        >

          <h3>
            Lesson {item.lesson}
          </h3>

          <p>
            Status:{' '}
            {item.is_completed
              ? '✓ Completed'
              : 'Not Completed'}
          </p>

          {item.completed_at && (
            <p>
              Completed on:{' '}
              {new Date(
                item.completed_at
              ).toLocaleDateString()}
            </p>
          )}

        </div>
      ))}

    </div>

  </div>
)}

{!progressLoading && !progressError && progress.length === 0 && (
  <div className="progress-section">

    <h2>My Learning Progress</h2>

    <p>
      You have not completed any lessons yet.
    </p>

  </div>
)}

            <div className="dashboard-card">
  <h3>🤖 AI Tutor</h3>

  <p>
    Ask questions and learn with your AI Tutor.
  </p>

  <button
    onClick={() => {
      document
        .getElementById('ai-chat')
        ?.scrollIntoView({
          behavior: 'smooth',
        })
    }}
  >
    Start Chat
  </button>
</div>

<div
  id="ai-chat"
  className="chat-section"
>

  <h2>🤖 AI Tutor</h2>

  <div className="chat-box">

    {chatMessages.length === 0 && (
      <div className="chat-welcome">
        <h3>Welcome to AI Tutor!</h3>

        <p>
          Ask me anything about your courses,
          lessons, or programming concepts.
        </p>
      </div>
    )}

    {chatMessages.map((chatMessage, index) => (
      <div
        key={index}
        className={`chat-message ${chatMessage.role}`}
      >
        <strong>
          {chatMessage.role === 'user'
            ? 'You'
            : 'AI Tutor'}
        </strong>

        <p>
          {chatMessage.message}
        </p>
      </div>
    ))}

    {chatLoading && (
      <div className="chat-message assistant">
        <strong>AI Tutor</strong>
        <p>Thinking...</p>
      </div>
    )}

  </div>

  {chatError && (
    <p className="chat-error">
      {chatError}
    </p>
  )}

  <form
    className="chat-input-area"
    onSubmit={handleSendMessage}
  >

    <input
      type="text"
      placeholder="Ask your AI Tutor..."
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      disabled={chatLoading}
    />

    <button
      type="submit"
      disabled={chatLoading || !chatInput.trim()}
    >
      {chatLoading ? 'Sending...' : 'Send'}
    </button>

  </form>

</div>

          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>AI Tutor</h1>

        <p className="login-subtitle">
          Welcome back! Please login to continue.
        </p>

        <form onSubmit={handleLogin}>

          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

      </div>

    </div>
  )
}

export default App