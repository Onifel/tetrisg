import React from 'react';
import Board from './components/Board';
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from './hooks/useTetris';
import { Toaster } from 'react-hot-toast';
import tetrisLogo from './assets/logoTetris.png'


function App() {
  const { board, startGame, pauseGame, resumeGame, stopGame, paused, isPlaying, score, upcomingBlocks} = useTetris();

  return (
    <div className="app">
      <img src={tetrisLogo} className='logo'/>
      <div className='app-control'>
        <div className="board-and-controls">
          <Board currentBoard={board} />
          <div className="controls">
            <div className='score'>
              <h2>Score: </h2>
              <span>{score}</span>
            </div>
          
            {isPlaying ? (
              <React.Fragment>
                 {paused ? (
                <button onClick={resumeGame}>Resume</button>
              ) : (
                <button onClick={pauseGame}>Pause</button>
              )}
              <div className='upcoming'>
                <UpcomingBlocks upcomingBlocks={upcomingBlocks} />
              </div>
                
              </React.Fragment>
            
            ) : (
              <button onClick={startGame}>New Game</button>
            )}
          </div>
        </div>
        <div className='stopBtn'>
          <button onClick={stopGame}>Stop</button>
        </div>   
        <Toaster 
          position ='top-center'
          toastOptions={{
            duration: 5000,
            style:{
              marginTop:'300px',
              width:'400px',
              height:'250px',
              background:'rgba(28, 22, 67, 0.9)',
              color: '#56e5e5',
              fontSize:'50px',
              fontWeight: 'bold',
              fontFamily:'Arial',
              boxShadow: '0px 0px 25px 0px rgba(0,0,0,0.7), inset 0px 0px 5px 5px rgba(255,255,255,0.3)'
            } 
          }}
        />
      </div>
    </div>
  );
}

export default App;
