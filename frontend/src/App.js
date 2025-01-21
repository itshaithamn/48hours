import logo from './logo.svg';
import React, { useState } from 'react';
import { Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './App.css';

function App()  {
  const [isOpen, setIsOpen] = useState(false); // State to toggle the sidebar

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle the state when hamburger is clicked
  };
  return (
    <div className="App">
      <header>
      <h1>Leak Test </h1>
     
      <HomeIcon style={{fontSize:50}} />
    </header>
    <div className="centered-text">
    <p>Discover the features of our leak tester <br /> and start testing your system now.</p>
 
      <Button className="login-button"style={{fontSize:30, color:'white', backgroundColor:'#282c34', borderRadius:'15px', margin:'2rem'}}>Log in here</Button>
      <Button 
          className="signup-button" 
          style={{
            fontSize: 30,
            color: 'white', 
            backgroundColor: '#282c34', 
            borderRadius: '15px',
          }}
        >
          Sign up here
        </Button>
    </div>
 
        
    </div>
  );
}

export default App; 