import React, {useEffect, useRef} from 'react';
import HomeIcon from '@mui/icons-material/Home'
import './global.css'
import homeStyles from './Home.module.css'
import playgroundStyles from './Playground.module.css'
import {Link} from "react-router-dom";

function Playground() {

  const containerRef = useRef(null);
  const boxRef = useRef(null);

  const isClicked = useRef(false);

  const coords = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0
  });

  useEffect(() => {
    if (!boxRef.current || !containerRef.current) return;

    const box = boxRef.current;
    const container = containerRef.current;

    const onMouseDown = (e) => {
      isClicked.current = true;
      coords.current.startX = e.clientX;
      coords.current.startY = e.clientY;
    }

    const onMouseUp = (e) => {
      isClicked.current = false;
      coords.current.lastX = box.offsetLeft;
      coords.current.lastY = box.offsetTop;
    }

    const onMouseMove = (e) => {
      if (!isClicked.current) return;

      const nextX = e.clientX - coords.current.startX + coords.current.lastX;
      const nextY = e.clientY - coords.current.startY + coords.current.lastY;

      box.style.top = `${nextY}px`;
      box.style.left = `${nextX}px`;
    }

    box.addEventListener('mousedown', onMouseDown);
    box.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseUp);

    return () => {
      box.removeEventListener('mousedown', onMouseDown);
      box.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseUp);
    };
  }, [])

  return (
      <>
        <div className={homeStyles.App}>
          <header>
            <h1>PlayGround</h1>
            <Link to="/" style={{textDecoration: 'none'}}>
              <HomeIcon style={{fontSize: 50, top: 6}}/>
            </Link>
          </header>
          <div className={playgroundStyles.playgroundDiv}>
            <div ref={containerRef} className={playgroundStyles.container}>
              <div ref={boxRef} className={playgroundStyles.box}></div>
            </div>
          </div>
          <div className={playgroundStyles.fileui}>
            <h1>Test</h1>
          </div>
          <div className={playgroundStyles.toolbar}></div>
        </div>
      </>
  );
}

export default Playground;