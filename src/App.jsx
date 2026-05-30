import   { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIAssistant from './components/AIAssistant'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OnboardingForm from './pages/OnboardingForm'
import StudentDashboard from './pages/StudentDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import CourseMarketplace from './pages/CourseMarketplace'
import CourseDetail from './pages/CourseDetail'
import Payment from './pages/Payment'
import Playground from './pages/Playground'
import SimulationLab from './pages/SimulationLab'
import Contact from './pages/Contact'
import  Quiz from './pages/Quiz'
import EmployeeDetails from './pages/EmployeeDetails'
import CourseAssignment from './pages/CourseAssignment' 
import ModuleQuiz from './pages/ModuleQuiz'
import Certificate from './pages/Certificate'
import LearningRoadmap from './pages/LearningRoadmap'
import EmployeeManagement from './pages/EmployeeManagement'
import CourseFeedback from './pages/CourseFeedback'
import { CurrencyProvider } from './contexts/CurrencyContext' 

function App() {
  const [user, setUser] = useState(() => {
  try {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error("Failed to parse currentUser from localStorage", err);
    return null;
  }
});

  useEffect(() => {
    const handleWelxPointsUpdate = (event) => {
      setUser(prevUser => ({ ...prevUser }))
    }

    window.addEventListener('welxPointsUpdated', handleWelxPointsUpdate)
    return () => window.removeEventListener('welxPointsUpdated', handleWelxPointsUpdate)
  }, [])

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />
    
    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} />
      case 'employee':
        return <EmployeeDashboard user={user} />
      case 'employer':
        return <EmployerDashboard user={user} />
      default:
        return <Navigate to="/login" />
    }
  }

   return (
    <CurrencyProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar user={user} setUser={setUser} />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<Signup setUser={setUser} />} />
              <Route path="/onboarding" element={<OnboardingForm user={user} setUser={setUser} />} />
              <Route path="/dashboard" element={getDashboard()} />
              <Route path="/courses" element={<CourseMarketplace />} />
              <Route path="/course/:courseId" element={<CourseDetail user={user} />} />
              <Route path="/payment" element={<Payment user={user} />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/simulation" element={<SimulationLab user={user} />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/quiz/:courseId" element={<Quiz user={user} />} />
              <Route path="/module-quiz/:courseId/:moduleId" element={<ModuleQuiz user={user} />} />
              <Route path="/course-feedback/:courseId" element={<CourseFeedback user={user} />} />
              <Route path="/certificate/:courseId" element={<Certificate user={user} />} />
              <Route path="/learning-roadmap" element={<LearningRoadmap user={user} />} />
                     <Route path="/employee-management" element={<EmployeeManagement user={user} />} />
        <Route path="/employee/:employeeId" element={<EmployeeDetails />} />
        <Route path="/assign-courses/:employeeId" element={<CourseAssignment />} /> 
            </Routes>
          </main>
          <Footer />
          <AIAssistant />
        </div>
      </Router>
    </CurrencyProvider>
  ) 
}

export default App
 

 
