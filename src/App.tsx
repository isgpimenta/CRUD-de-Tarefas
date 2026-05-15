import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tasks from "./pages/Tasks";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Tasks />} />
      </Routes>
    </Router>
  );
}
