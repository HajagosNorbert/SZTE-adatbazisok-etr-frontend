import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Users from './components/Users/Users';
import Navigation from './components/Navigation/Navigation';
import Courses from './components/Courses/Courses';


function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Users />} />
          <Route path="/felhasznalok" element={<Users />} />
          <Route path="/kurzusok" element={<Courses />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
