import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Dashboard from './components/Dashboard';
import Hero from './components/Hero';
import About from './components/About';
import Team from './components/Team';

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar isChatbotOpen={isChatbotOpen} />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route 
            path="/dashboard" 
            element={<Dashboard onChatbotStateChange={setIsChatbotOpen} />} 
          />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;