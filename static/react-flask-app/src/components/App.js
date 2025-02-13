import React from 'react';
import {Route, Routes} from "react-router-dom";
import Playground from "./Playground";
import Home from "./Home";
import Login from './Login';
import Signup from "./Signup";


function App()  {

  return (
      <>
          <div>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Playground" element={<Playground />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Signup" element={<Signup />} />
              <Route path="/Home" element={<Home />} />
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
          </div>
      </>
  );
}

export default App;
