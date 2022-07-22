import { IExercise, IExerciseExtended } from '@dgoudie/isometric-types';
import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';
import {
  emptyReadableResource,
  fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';

import ActiveExerciseView from '../../components/ActiveExerciseView/ActiveExerciseView';
import EndWorkoutBottomSheet from '../../components/BottomSheet/components/EndWorkoutBottomSheet/EndWorkoutBottomSheet';
import ExercisePickerBottomSheet from '../../components/BottomSheet/components/ExercisePickerBottomSheet/ExercisePickerBottomSheet';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import { SnackbarContext } from '../../providers/Snackbar/Snackbar';
import SwipeDeadZone from '../../components/SwipeDeadZone/SwipeDeadZone';
import { WorkoutContext } from '../../providers/Workout/Workout';
import WorkoutExercisesBottomSheet from '../../components/BottomSheet/components/WorkoutExercisesBottomSheet/WorkoutExercisesBottomSheet';
import classNames from 'classnames';
import styles from './index.module.scss';

let initialExercisesResponse = emptyReadableResource();

export type ActiveExercise = {
  index: number;
  scrollIntoView: boolean;
};

export default function Workout() {
  const [exercisesResponse, setExercisesResponse] = useState(
    initialExercisesResponse
  );

  const [_isPending, startTransaction] = useTransition();

  useEffect(() => {
    startTransaction(() => {
      const updatedExercisesResponse =
        fetchFromApiAsReadableResource<IExerciseExtended[]>(`/api/exercises`);
      setExercisesResponse(updatedExercisesResponse);
      initialExercisesResponse = updatedExercisesResponse;
    });
  }, []);

  useEffect(() => {
    document.title = `Workout | ISOMETRIC`;
  }, []);
  const { workout, endWorkout, discardWorkout, addExercise } =
    useContext(WorkoutContext);

  const { openSnackbar } = useContext(SnackbarContext);

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

  const [showAddExerciseBottomSheet, setShowAddExerciseBottomSheet] =
    useState(false);

  const onExeciseSelected = useCallback((index?: number | 'add') => {
    if (typeof index === 'number') {
      setActiveExercise({ index, scrollIntoView: true });
    } else if (index === 'add') {
      setShowAddExerciseBottomSheet(true);
    }
    setShowWorkoutExercisesBottomSheet(false);
  }, []);

  const onExeciseAdded = useCallback(
    (exerciseId: string | undefined) => {
      if (typeof exerciseId !== 'undefined') {
        addExercise(exerciseId, exerciseIndexInView + 1);
        openSnackbar('Exercise Added.');
      }
      setShowAddExerciseBottomSheet(false);
    },
    [exerciseIndexInView]
  );

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
      <Suspense fallback={<RouteLoader className={styles.loader} />}>
        <ActiveExerciseView
          exercises={workout.exercises}
          exercisesResource={exercisesResponse}
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
      {showAddExerciseBottomSheet && (
        <ExercisePickerBottomSheet onResult={onExeciseAdded} />
      )}
    </div>
  );
}
