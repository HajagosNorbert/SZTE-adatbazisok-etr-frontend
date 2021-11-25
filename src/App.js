import Users from './components/Users';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/felhasznalok" element={<Users />} />
        <Route path="/kurzusok" element={<button />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
