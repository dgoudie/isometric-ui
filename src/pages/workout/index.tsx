import React, {
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useState,
    useTransition,
} from 'react';

import ActiveExerciseView from '../../components/ActiveExerciseView/ActiveExerciseView';
import EndWorkoutBottomSheet from '../../components/BottomSheet/components/EndWorkoutBottomSheet/EndWorkoutBottomSheet';
import { IExercise } from '@dgoudie/isometric-types';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SwipeDeadZone from '../../components/SwipeDeadZone/SwipeDeadZone';
import { WorkoutContext } from '../../providers/Workout/Workout';
import classNames from 'classnames';
import { fetchFromApiAsReadableResource } from '../../utils/fetch-from-api';
import styles from './index.module.scss';

let initialExercisesResponse =
    fetchFromApiAsReadableResource<IExercise[]>(`/api/exercises`);

export default function Workout() {
    const [exercisesResponse, setExercisesResponse] = useState(
        initialExercisesResponse
    );

    const [_isPending, startTransaction] = useTransition();

    useEffect(() => {
        startTransaction(() => {
            const updatedExercisesResponse =
                fetchFromApiAsReadableResource<IExercise[]>(`/api/exercises`);
            setExercisesResponse(updatedExercisesResponse);
            initialExercisesResponse = updatedExercisesResponse;
        });
    }, []);

    useEffect(() => {
        document.title = `Workout | ISOMETRIC`;
    }, []);
    const { workout, endWorkout, discardWorkout, persistSet } =
        useContext(WorkoutContext);

    const [showEndWorkoutBottomSheet, setShowEndWorkoutBottomSheet] =
        useState(false);

    const onEndWorkoutResult = useCallback((result?: 'END' | 'DISCARD') => {
        if (result === 'END') {
            endWorkout();
        } else if (result === 'DISCARD') {
            discardWorkout();
        }
        setShowEndWorkoutBottomSheet(false);
    }, []);

    const [initialActiveExercise, setInitialActiveExercise] = useState(0);
    const [activeExercise, setActiveExercise] = useState(0);

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
                    {activeExercise + 1} / {workout.exercises.length}
                </div>
                <button
                    type='button'
                    onClick={() => setShowEndWorkoutBottomSheet(true)}
                >
                    <i className='fa-solid fa-list-check'></i>
                    Exercises
                </button>
            </header>
            <Suspense fallback={<RouteLoader />}>
                <ActiveExerciseView
                    exercises={workout.exercises}
                    exercisesResponse={exercisesResponse}
                    focusedIndex={initialActiveExercise}
                    focusedIndexChanged={setActiveExercise}
                    setUpdated={persistSet}
                />
            </Suspense>
            <div className={styles.paginator}>
                {workout.exercises.map((exercise, index) => (
                    <div
                        key={exercise.exerciseId}
                        className={classNames(
                            activeExercise === index && styles.active
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
        </div>
    );
}
