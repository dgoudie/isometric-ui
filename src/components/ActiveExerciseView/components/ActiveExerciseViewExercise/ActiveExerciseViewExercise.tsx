import {
    IExercise,
    IWorkoutExercise,
    IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import { useCallback, useEffect, useState } from 'react';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import SwipeDeadZone from '../../../SwipeDeadZone/SwipeDeadZone';
import styles from './ActiveExerciseViewExercise.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
    exercise: IWorkoutExercise;
    data: IExercise;
    onSelected: () => void;
    exerciseUpdated: (exercise: IWorkoutExercise) => void;
    exerciseCompleted: () => void;
}

export default function ActiveExerciseViewExercise({
    exercise,
    data,
    onSelected,
    exerciseUpdated,
    exerciseCompleted,
}: Props) {
    const firstNotComplete = exercise.sets.findIndex((set) => !set.complete);
    const { ref, inView } = useInView({
        threshold: 0.6,
    });
    useEffect(() => {
        !!inView && onSelected();
    }, [inView, onSelected]);

    const setUpdated = useCallback(
        (index: number, newSetData: IWorkoutExerciseSet) => {
            let ex: IWorkoutExercise = {
                ...exercise,
                sets: exercise.sets.map((set, j) =>
                    index === j ? newSetData : set
                ),
            };
            exerciseUpdated(ex);
            let allSetsPreviouslyCompleted = exercise.sets.every(
                (set) => set.complete
            );
            let allSetsNowCompleted = ex.sets.every((set) => set.complete);
            if (!allSetsPreviouslyCompleted && allSetsNowCompleted) {
                exerciseCompleted();
            }
        },
        [exercise, exerciseUpdated, exerciseCompleted]
    );

    return (
        <section ref={ref} className={styles.section}>
            <div className={styles.header}>{data.name}</div>
            <div className={styles.groups}>
                {[
                    data.primaryMuscleGroup,
                    ...(data.secondaryMuscleGroups ?? []),
                ].map((group) => (
                    <MuscleGroupTag key={group} muscleGroup={group} />
                ))}
            </div>
            <div className={styles.sets}>
                {exercise.sets.map((set, index) => (
                    <ActiveExerciseViewExerciseSet
                        key={index}
                        set={set}
                        data={data}
                        exerciseSelected={inView}
                        setSelected={firstNotComplete === index}
                        setUpdated={(set) => setUpdated(index, set)}
                    />
                ))}
            </div>
        </section>
    );
}
