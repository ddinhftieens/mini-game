import React from 'react';
import ReactDOM from 'react-dom/client';
// import { App } from './App';
import './styles/index.css';
// import ChimChichBong from './ChimChichBong';
import HeadTiltQuiz from './components/camera/HeadTiltQuiz';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <App /> */}
    {/* <ChimChichBong /> */}
    <HeadTiltQuiz />
  </React.StrictMode>
);
