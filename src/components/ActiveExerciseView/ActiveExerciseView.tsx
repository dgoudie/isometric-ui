import React, { useCallback, useEffect, useRef, useState } from 'react';

import { IWorkoutExercise } from '@dgoudie/isometric-types';
import styles from './ActiveExerciseView.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
    exercises: IWorkoutExercise[];
    focusedIndex?: number;
    focusedIndexChanged?: (index: number) => void;
}

export default function ActiveExerciseView({
    exercises,
    focusedIndex = 0,
    focusedIndexChanged = () => undefined,
}: Props) {
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
                    exercise={exercise}
                    selected={() => focusedIndexChanged(index)}
                />
            ))}
        </div>
    );
}

interface ExerciseProps {
    exercise: IWorkoutExercise;
    selected: () => void;
}

function Exercise({ exercise, selected = () => undefined }: ExerciseProps) {
    const { ref, inView } = useInView({
        threshold: 0.6,
    });
    useEffect(() => {
        !!inView && selected();
    }, [inView, selected]);
    return <section ref={ref}>{JSON.stringify(exercise, null, 4)}</section>;
}
