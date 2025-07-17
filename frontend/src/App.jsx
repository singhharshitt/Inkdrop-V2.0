import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext'; 
import Library from './pages/Library';
import UserDashbord from './pages/UserDashbord';
import ScrollToTop from './components/ScrollToTop';
import AdminDashboard from './pages/dashbordAdmin';
import Upload from './pages/Upload';
import Discover from './pages/Discover';
import PrivateRoute from './components/PrivateRoute';
import ProfileSettings from './pages/profileSetting';

function App() {
  return (
    <AuthProvider>
      
    <Router>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/authPage" element={<AuthPage />} />
        <Route path="/about" element={<PrivateRoute><AboutUs /></PrivateRoute>} />
        <Route path="/contact" element={<PrivateRoute><ContactUs /></PrivateRoute>} />
        <Route path="/library" element={<PrivateRoute><Library /></PrivateRoute>} />
        <Route path="/userdashbord" element={<PrivateRoute><UserDashbord /></PrivateRoute>} />
        <Route path="/dashboardAdmin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path= "/upload" element={<PrivateRoute><Upload/></PrivateRoute>}/>
        <Route path='/discover' element={<PrivateRoute><Discover/></PrivateRoute>}/>
        <Route path='/dashboard/profile' element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
        {/* Add more pages like this */}
      </Routes>
      
    </Router>
      
    </AuthProvider>
  );
}

export default App;
