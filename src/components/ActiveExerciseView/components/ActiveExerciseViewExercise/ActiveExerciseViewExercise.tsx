import { IExercise, IWorkoutExercise } from '@dgoudie/isometric-types';

import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import SwipeDeadZone from '../../../SwipeDeadZone/SwipeDeadZone';
import styles from './ActiveExerciseViewExercise.module.scss';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface Props {
    exercise: IWorkoutExercise;
    data: IExercise;
    selected: () => void;
}

export default function ActiveExerciseViewExercise({
    exercise,
    data,
    selected = () => undefined,
}: Props) {
    const { ref, inView } = useInView({
        threshold: 0.6,
    });
    useEffect(() => {
        !!inView && selected();
    }, [inView, selected]);
    return (
        <section ref={ref} className={styles.section}>
            <SwipeDeadZone className={styles.deadZone} />
            <div className={styles.body}>
                <div className={styles.header}>{data.name}</div>
                <div className={styles.groups}>
                    {[
                        data.primaryMuscleGroup,
                        ...(data.secondaryMuscleGroups ?? []),
                    ].map((group) => (
                        <MuscleGroupTag key={group} muscleGroup={group} />
                    ))}
                </div>
            </div>
            <SwipeDeadZone className={styles.deadZone} />
        </section>
    );
}
