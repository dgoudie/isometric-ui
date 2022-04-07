import {
  IExercise,
  IExerciseExtended,
  IWorkout,
} from '@dgoudie/isometric-types';
import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import ActiveExerciseView from '../../components/ActiveExerciseView/ActiveExerciseView';
import EndWorkoutBottomSheet from '../../components/BottomSheet/components/EndWorkoutBottomSheet/EndWorkoutBottomSheet';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SwipeDeadZone from '../../components/SwipeDeadZone/SwipeDeadZone';
import { WorkoutContext } from '../../providers/Workout/Workout';
import WorkoutExercisesBottomSheet from '../../components/BottomSheet/components/WorkoutExercisesBottomSheet/WorkoutExercisesBottomSheet';
import classNames from 'classnames';
import { fetchFromApiAsReadableResource } from '../../utils/fetch-from-api';
import styles from './index.module.scss';

export type ActiveExercise = {
  index: number;
  scrollIntoView: boolean;
};

let initialExercisesResource =
  fetchFromApiAsReadableResource<IExerciseExtended[]>(`/api/exercises`);

export default function Workout() {
  useEffect(() => {
    document.title = `Workout | ISOMETRIC`;
  }, []);
  const { workout, endWorkout, discardWorkout } = useContext(WorkoutContext);

  const [exercisesResource, setExercisesResource] = useState(
    initialExercisesResource
  );

  const [_isPending, startTransaction] = useTransition();

  useEffect(() => {
    startTransaction(() => {
      const newExercisesResource =
        fetchFromApiAsReadableResource<IExerciseExtended[]>(`/api/exercises`);
      setExercisesResource(newExercisesResource);
      initialExercisesResource = newExercisesResource;
    });
  }, []);

  const [showEndWorkoutBottomSheet, setShowEndWorkoutBottomSheet] =
    useState(false);

  const [exerciseIndexInView, setExerciseIndexInView] = useState(0);

  const [activeExercise, setActiveExercise] = useState<ActiveExercise>({
    index: 0,
    scrollIntoView: false,
  });

  const onEndWorkoutResult = useCallback((result?: 'END' | 'DISCARD') => {
    if (result === 'END') {
      endWorkout();
    } else if (result === 'DISCARD') {
      discardWorkout();
    }
    setShowEndWorkoutBottomSheet(false);
  }, []);

  const focusedExerciseChanged = useCallback((exercise: ActiveExercise) => {
    startTransaction(() => {
      setActiveExercise(exercise);
      if (!exercise.scrollIntoView) {
        setExerciseIndexInView(exercise.index);
      }
    });
  }, []);

  const [showWorkoutExercisesBottomSheet, setShowWorkoutExercisesBottomSheet] =
    useState(false);

  const onExeciseSelected = useCallback((index?: number) => {
    if (typeof index !== 'undefined') {
      setActiveExercise({ index, scrollIntoView: true });
    }
    setShowWorkoutExercisesBottomSheet(false);
  }, []);

  if (!workout) {
    return <RouteLoader />;
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button
          type='button'
          onClick={() => setShowEndWorkoutBottomSheet(true)}
        >
          <i className='fa-solid fa-chevron-left'></i>
          End Workout
        </button>

        <div className={styles.headerExerciseNumber}>
          {exerciseIndexInView + 1} / {workout.exercises.length}
        </div>
        <button
          type='button'
          onClick={() => setShowWorkoutExercisesBottomSheet(true)}
        >
          <i className='fa-solid fa-list-check'></i>
          Exercises
        </button>
      </header>
      <Suspense fallback={<RouteLoader />}>
        <ActiveExerciseView
          exercises={workout.exercises}
          exercisesResource={exercisesResource}
          focusedExercise={activeExercise}
          focusedExerciseChanged={focusedExerciseChanged}
        />
      </Suspense>
      <div className={styles.paginator}>
        {workout.exercises.map((exercise, index) => (
          <div
            key={index}
            className={classNames(
              exerciseIndexInView === index && styles.active
            )}
          />
        ))}
      </div>
      <SwipeDeadZone
        className={classNames(styles.deadZone, styles.deadZoneStart)}
      />
      <SwipeDeadZone
        className={classNames(styles.deadZone, styles.deadZoneEnd)}
      />
      {showEndWorkoutBottomSheet && (
        <EndWorkoutBottomSheet onResult={onEndWorkoutResult} />
      )}
      {showWorkoutExercisesBottomSheet && (
        <WorkoutExercisesBottomSheet
          exercises={workout.exercises}
          onResult={onExeciseSelected}
        />
      )}
    </div>
  );
}

function workoutToExerciseIdSet(workout: IWorkout | null) {
  let exerciseIdSet = new Set<string>();
  if (!workout) {
    return exerciseIdSet;
  }
  workout.exercises.forEach((exercise) =>
    exerciseIdSet.add(exercise.exercise._id)
  );
  return exerciseIdSet;
}
