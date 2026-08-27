import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Login from './pages/Login'; 
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <div className="min-h-screen bg-[#f5f1ea] text-[#1b3b2c]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;