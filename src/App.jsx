import React,{useState} from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Home from "./Home";
import Header from "./Header";
import Footer from "./Footer";
import About from "./About";
import Contact from "./Contact";

export default function App(){
  const [user, setUser] = useState(null);

  return(
    <BrowserRouter>
    <Header user={user}/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/contact" element={<Contact/>}/>
    </Routes>
    <Footer />
    </BrowserRouter>
  );
}