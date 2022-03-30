import { IExercise, IWorkoutExercise } from '@dgoudie/isometric-types';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import ActiveExerciseViewExercise from './components/ActiveExerciseViewExercise/ActiveExerciseViewExercise';
import { ReadableResource } from '../../utils/fetch-from-api';
import classNames from 'classnames';
import styles from './ActiveExerciseView.module.scss';

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
        <div className={classNames(styles.root, 'fade-in')} ref={rootRef}>
            {exercises.map((exercise, index) => (
                <ActiveExerciseViewExercise
                    key={exercise.exerciseId}
                    data={exerciseMap.get(exercise.exerciseId)!}
                    exercise={exercise}
                    selected={() => focusedIndexChanged(index)}
                />
            ))}
        </div>
    );
}
