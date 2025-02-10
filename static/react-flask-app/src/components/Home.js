import React from 'react';
import { Link } from 'react-router-dom';
import {Button} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './global.css'
import homeStyles from './Home.module.css';

const Home = () => {
  return (
      <>
          <div className={homeStyles.App}>
              <header>
                  <h1>Leak Test </h1>
                  <Link to="/Home"  style={{ textDecoration: 'none' }}>
                    <HomeIcon style={{fontSize: 50, top: 6}}/>
                  </Link>
              </header>
              <div className={homeStyles.divCta}>
                  <p className={homeStyles.centeredText}>Discover the features of our leak tester <br/> and start testing your system now.</p>
                  <div>
                    <Link to="/Login"  style={{ textDecoration: 'none' }}>
                      <Button style={{
                          fontSize: 30,                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'
                      }}>Log In Here</Button>
                      </Link>
                      <Link to="/Playground"   style={{ textDecoration: 'none' }}>
                      <Button style={{
                          fontSize: 30,                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'
                      }}>Playground</Button>
                      </Link>
                      <Link to="/Signup"   style={{ textDecoration: 'none' }}>
                          <Button style={{
                          fontSize: 30,
                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'}}>
                              Sign Up Here
                          </Button>
                      </Link>
                  </div>
              </div>
          </div>
      </>
  )
}

export default Home;