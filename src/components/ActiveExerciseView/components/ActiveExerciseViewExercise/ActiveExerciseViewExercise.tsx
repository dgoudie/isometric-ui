import {
    IExercise,
    IWorkoutExercise,
    IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import { useEffect, useState } from 'react';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import SwipeDeadZone from '../../../SwipeDeadZone/SwipeDeadZone';
import styles from './ActiveExerciseViewExercise.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
    exercise: IWorkoutExercise;
    data: IExercise;
    onSelected: () => void;
    setUpdated: (setIndex: number, set: IWorkoutExerciseSet) => void;
}

export default function ActiveExerciseViewExercise({
    exercise,
    data,
    onSelected,
    setUpdated,
}: Props) {
    const firstNotComplete = exercise.sets.findIndex((set) => !set.complete);
    const { ref, inView } = useInView({
        threshold: 0.6,
    });
    useEffect(() => {
        !!inView && onSelected();
    }, [inView, onSelected]);
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
                        selected={inView}
                        highlighted={firstNotComplete === index}
                        setUpdated={(set) => setUpdated(index, set)}
                    />
                ))}
            </div>
        </section>
    );
}
