import React from 'react';
import { Link } from 'react-router-dom';
import {Button} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './global.css'
import styles from './Home.module.css';

const Home = () => {
  return (
      <>
          <div className={styles.App}>
              <header>
                  <h1>Leak Test </h1>
                  <Link to="/home"  style={{ textDecoration: 'none' }}>
                  <HomeIcon style={{fontSize: 50, top: 6}}/>
                  </Link>
              </header>
              <div className={styles.divCta}>
                  <p className={styles.centeredText}>Discover the features of our leak tester <br/> and start testing your system now.</p>
                  <div>
                    <Link to="/"  style={{ textDecoration: 'none' }}>
                      <Button style={{
                          fontSize: 30,                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'
                      }}>Log In Here</Button>
                      </Link>
                      <Link to="/playground"   style={{ textDecoration: 'none' }}>
                      <Button style={{
                          fontSize: 30,                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'
                      }}>Playground</Button>
                      </Link>
                      <Button style={{
                          fontSize: 30,
                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'
                      }}>Sign Up Here</Button>
                  </div>
              </div>
          </div>
      </>
  )
}

export default Home;