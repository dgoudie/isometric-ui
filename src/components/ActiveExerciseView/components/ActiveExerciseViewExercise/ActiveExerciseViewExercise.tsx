import { IExercise, IWorkoutExercise } from '@dgoudie/isometric-types';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import SwipeDeadZone from '../../../SwipeDeadZone/SwipeDeadZone';
import styles from './ActiveExerciseViewExercise.module.scss';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface Props {
    exercise: IWorkoutExercise;
    data: IExercise;
    onSelected: () => void;
}

export default function ActiveExerciseViewExercise({
    exercise,
    data,
    onSelected = () => undefined,
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
                        set={set}
                        data={data}
                        selected={inView}
                        highlighted={firstNotComplete === index}
                    />
                ))}
            </div>
        </section>
    );
}
