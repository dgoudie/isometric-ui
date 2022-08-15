import './App.scss';

import { Navigate, Route, Routes } from 'react-router-dom';
import React, { Component, Suspense } from 'react';

import ErrorView from './components/ErrorView/ErrorView';
import RouteLoader from './components/RouteLoader/RouteLoader';

const Settings = React.lazy(() => import('./pages/settings'));
const WorkoutPlan = React.lazy(() => import('./pages/workout-plan'));
const History = React.lazy(() => import('./pages/history'));
const Home = React.lazy(() => import('./pages/home'));
const Exercises = React.lazy(() => import('./pages/exercises'));
const Exercise = React.lazy(() => import('./pages/exercise'));
const ExerciseEdit = React.lazy(() => import('./pages/exercise-edit'));
const Workout = React.lazy(() => import('./pages/workout'));

type RouteWrapperProps = React.PropsWithChildren<{}>;
type RouteWrapperState = { error?: Error };

class RouteWrapper extends Component<RouteWrapperProps, RouteWrapperState> {
  constructor(props: RouteWrapperProps) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: Error): Partial<RouteWrapperState> {
    return { error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.log(JSON.stringify(error));
  }
  render() {
    if (!!this.state.error) {
      return <ErrorView error={this.state.error} />;
    }
    return (
      <Suspense fallback={<RouteLoader />}>{this.props.children}</Suspense>
    );
  }
}

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path='home'
          element={
            <RouteWrapper>
              <Home />
            </RouteWrapper>
          }
        />
        <Route
          path='exercises'
          element={
            <RouteWrapper>
              <Exercises />
            </RouteWrapper>
          }
        />
        <Route
          path='exercises/:exerciseName/edit'
          element={
            <RouteWrapper>
              <ExerciseEdit />
            </RouteWrapper>
          }
        />
        <Route
          path='exercises/:exerciseName'
          element={
            <RouteWrapper>
              <Exercise />
            </RouteWrapper>
          }
        />
        <Route
          path='history'
          element={
            <RouteWrapper>
              <History />
            </RouteWrapper>
          }
        />
        <Route
          path='settings'
          element={
            <RouteWrapper>
              <Settings />
            </RouteWrapper>
          }
        />
        <Route
          path='workout-plan'
          element={
            <RouteWrapper>
              <WorkoutPlan />
            </RouteWrapper>
          }
        />
        <Route
          path='workout'
          element={
            <RouteWrapper>
              <Workout />
            </RouteWrapper>
          }
        />
        <Route path='*' element={<Navigate replace to='/home' />} />
      </Routes>
      {/* <ServiceWorkerUpdater /> */}
    </>
  );
}
