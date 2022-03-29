import { IExercise, IWorkoutExercise } from '@dgoudie/isometric-types';
import React, {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import { ReadableResource } from '../../utils/fetch-from-api';
import RouteLoader from '../RouteLoader/RouteLoader';
import SwipeDeadZone from '../SwipeDeadZone/SwipeDeadZone';
import styles from './ActiveExerciseView.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
    exercises: IWorkoutExercise[];
    exercisesResponse: ReadableResource<IExercise[]>;
    focusedIndex?: number;
    focusedIndexChanged?: (index: number) => void;
}

export default function ActiveExerciseView({
    exercises,
    exercisesResponse,
    focusedIndex = 0,
    focusedIndexChanged = () => undefined,
}: Props) {
    const exerciseMap: Map<string, IExercise> = useMemo(
        () =>
            new Map<string, IExercise>(
                exercisesResponse
                    .read()
                    .map(({ _id, ...ex }) => [_id, { _id, ...ex }])
            ),
        [exercises]
    );

    const [rootChildren, setRootChildren] = useState<HTMLCollection>();

    const rootRef = useRef<HTMLDivElement>(null);

    const touchStart = useCallback((event: TouchEvent) => {
        if (event.target === event.currentTarget) {
            event.preventDefault();
        }
    }, []);

    useEffect(() => {
        rootRef.current?.addEventListener('touchstart', touchStart);
        setRootChildren(rootRef.current?.children);
        return () => {
            rootRef.current?.removeEventListener('touchstart', touchStart);
        };
    }, [rootRef]);

    useEffect(() => {
        rootChildren &&
            rootChildren[focusedIndex]?.scrollIntoView({
                behavior: 'smooth',
            });
    }, [rootChildren, focusedIndex]);

    return (
        <div className={styles.root} ref={rootRef}>
            {exercises.map((exercise, index) => (
                <Exercise
                    key={exercise.exerciseId}
                    data={exerciseMap.get(exercise.exerciseId)!}
                    exercise={exercise}
                    selected={() => focusedIndexChanged(index)}
                />
            ))}
        </div>
    );
}

interface ExerciseProps {
    exercise: IWorkoutExercise;
    data: IExercise;
    selected: () => void;
}

function Exercise({
    exercise,
    data,
    selected = () => undefined,
}: ExerciseProps) {
    const { ref, inView } = useInView({
        threshold: 0.6,
    });
    useEffect(() => {
        !!inView && selected();
    }, [inView, selected]);
    return (
        <section ref={ref}>
            <SwipeDeadZone className={styles.deadZone} />
            <div className='body'>
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
