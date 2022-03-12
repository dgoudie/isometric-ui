import './App.scss';

import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import Exercise from './pages/exercise';
import Exercises from './pages/exercises';
import Home from './pages/home';
import Settings from './pages/settings';
import Workouts from './pages/workouts';

const App: FC = () => (
    <Routes>
        <Route path='home' element={<Home />} />
        <Route path='exercises' element={<Exercises />} />
        <Route path='exercises/:exerciseName' element={<Exercise />} />
        <Route path='workouts' element={<Workouts />} />
        <Route path='settings' element={<Settings />} />
    </Routes>
);

export default App;
