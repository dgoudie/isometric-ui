import './App.scss';

import { Navigate, Route, Routes } from 'react-router-dom';
import React, { FC } from 'react';

import Exercise from './pages/exercise';
import Exercises from './pages/exercises';
import History from './pages/history';
import Home from './pages/home';
import ServiceWorkerUpdater from './components/ServiceWorkerUpdater/ServiceWorkerUpdater';
import Settings from './pages/settings';
import WorkoutPlan from './pages/workout-plan';

const App: FC = () => (
    <>
        <Routes>
            <Route path='home' element={<Home />} />
            <Route path='exercises' element={<Exercises />} />
            <Route path='exercises/:exerciseName' element={<Exercise />} />
            <Route path='history' element={<History />} />
            <Route path='settings' element={<Settings />} />
            <Route path='workout-plan' element={<WorkoutPlan />} />
            <Route path='*' element={<Navigate replace to='/home' />} />
        </Routes>
        <ServiceWorkerUpdater />
    </>
);

export default App;
