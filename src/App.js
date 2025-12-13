import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import HomePage from './pages/HomePage';
import CreateExam from './pages/CreateExam';
import TakeExam from './pages/TakeExam';
import './styles/App.css';

function App() {
    return (
        <LanguageProvider>
            <Router basename="/study-app">
                <div className="App">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/create" element={<CreateExam />} />
                        <Route path="/take" element={<TakeExam />} />
                    </Routes>
                </div>
            </Router>
        </LanguageProvider>
    );
}

export default App;
