import {
    IExercise,
    IWorkoutExercise,
    IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';

import React from 'react';
import classNames from 'classnames';
import styles from './ActiveExerciseViewExerciseSet.module.scss';

interface Props {
    set: IWorkoutExerciseSet;
    data: IExercise;
    selected: boolean;
    highlighted: boolean;
}
export default function ActiveExerciseViewExerciseSet({
    set,
    data,
    selected,
    highlighted,
}: Props) {
    return (
        <div
            className={classNames(
                styles.root,
                selected && styles.selected,
                highlighted && styles.highlighted
            )}
        >
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(data)}
            </pre>
        </div>
    );
}
