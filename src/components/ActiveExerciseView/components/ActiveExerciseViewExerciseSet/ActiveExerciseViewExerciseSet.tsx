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
export default function ActiveExerciseViewExerciseSet(props: Props) {
    let children = <DefaultSet {...props} />;
    if (props.data.exerciseType === 'timed') {
        children = <TimedSet {...props} />;
    } else if (props.data.exerciseType === 'rep_based') {
        children = <RepBasedSet {...props} />;
    }
    return (
        <div
            className={classNames(
                styles.root,
                props.selected && styles.selected,
                props.highlighted && styles.highlighted
            )}
        >
            {children}
        </div>
    );
}

function DefaultSet({}: Props) {
    return (
        <div className={styles.defaultSet}>
            <div>0 lbs</div>
            <div></div>
        </div>
    );
}

function TimedSet({}: Props) {
    return <div></div>;
}

function RepBasedSet({}: Props) {
    return <div></div>;
}
