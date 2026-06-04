import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/Home";
import ListingDetail from "./components/ListingDetail";
import { SearchResults } from "./components/SearchResults";
import { Profile } from "./components/Profile";
import PostAnnonce from "./components/PostAnnonce";
import MesAnnonces from "./components/MesAnnonces";
import { AboutPage } from "./components/AboutPage";
import { SamsaraPage } from './components/SamsaraPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="size-full bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/publish" element={<PostAnnonce />} />
          <Route path="/poster" element={<PostAnnonce />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mes-annonces" element={<MesAnnonces />} />
          <Route path="/a-propos" element={<AboutPage />} />
<Route path="/samsara" element={<SamsaraPage />} /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
}