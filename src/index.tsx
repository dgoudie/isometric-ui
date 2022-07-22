import './index.css';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import AfterExerciseTimerProvider from './providers/AfterExerciseTimer/AfterExerciseTimer';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import SettingsProvider from './providers/Settings/Settings';
import SnackbarProvider from './providers/Snackbar/Snackbar';
import WorkoutProvider from './providers/Workout/Workout';
import reportWebVitals from './reportWebVitals';

//@ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <SettingsProvider>
      <SnackbarProvider>
        <WorkoutProvider>
          <AfterExerciseTimerProvider>
            <App />
          </AfterExerciseTimerProvider>
        </WorkoutProvider>
      </SnackbarProvider>
    </SettingsProvider>
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// export const swRegistration = serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
