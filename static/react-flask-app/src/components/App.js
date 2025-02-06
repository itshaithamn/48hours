import React from 'react';
import {Route, Routes} from "react-router-dom";
import Playground from "./Playground";
import Home from "./Home";
import Login from './Login';


function App()  {

  return (
      <>
          <div>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
          </div>
      </>
  );
}

export default App;
//
//HELLOW