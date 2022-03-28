import React, { useCallback, useContext, useEffect, useState } from 'react';

import EndWorkoutBottomSheet from '../../components/BottomSheet/components/EndWorkoutBottomSheet/EndWorkoutBottomSheet';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import { WorkoutContext } from '../../providers/Workout/Workout';
import styles from './index.module.scss';

export default function Workout() {
    useEffect(() => {
        document.title = `Workout | ISOMETRIC`;
    }, []);
    const { workout, endWorkout, discardWorkout } = useContext(WorkoutContext);

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

    const [activeExercise, setActiveExercise] = useState(0);

    if (!workout) {
        return <RouteLoader />;
    }

    return (
        <>
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
            {showEndWorkoutBottomSheet && (
                <EndWorkoutBottomSheet onResult={onEndWorkoutResult} />
            )}
        </>
    );
}
