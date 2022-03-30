import {
    IExercise,
    IWorkoutExercise,
    IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import React, { useCallback, useContext, useEffect, useRef } from 'react';

import { WorkoutContext } from '../../../../providers/Workout/Workout';
import classNames from 'classnames';
import styles from './ActiveExerciseViewExerciseSet.module.scss';

interface Props {
    set: IWorkoutExerciseSet;
    data: IExercise;
    selected: boolean;
    highlighted: boolean;
    setUpdated: (set: IWorkoutExerciseSet) => void;
}
export default function ActiveExerciseViewExerciseSet(props: Props) {
    const completeToggled = useCallback(() => {
        props.setUpdated({ ...props.set, complete: !props.set.complete });
    }, [props.set, props.setUpdated]);

    let children = <DefaultSet {...props} completeToggled={completeToggled} />;
    if (props.data.exerciseType === 'timed') {
        children = <TimedSet {...props} completeToggled={completeToggled} />;
    } else if (props.data.exerciseType === 'rep_based') {
        children = <RepBasedSet {...props} completeToggled={completeToggled} />;
    }
    return (
        <div
            className={classNames(
                styles.root,
                props.selected && styles.selected,
                props.highlighted && styles.highlighted,
                props.set.complete && styles.completed
            )}
        >
            {children}
        </div>
    );
}

interface SetProps extends Props {
    completeToggled: () => void;
}

function DefaultSet({ set, data, selected, completeToggled }: SetProps) {
    const resistanceInput = useRef<HTMLInputElement>(null);
    const repCountInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!selected) {
            resistanceInput.current?.blur();
            repCountInput.current?.blur();
        }
    }, [resistanceInput, repCountInput, selected]);

    return (
        <div className={classNames(styles.set, styles.setTypeDefault)}>
            <div className={styles.setInput}>
                <div className={styles.setInputWrapper}>
                    <input
                        ref={resistanceInput}
                        type='number'
                        placeholder='0'
                        inputMode='numeric'
                    />
                </div>

                <span className={styles.setInput}>lbs</span>
            </div>
            <div className={styles.setInput}>
                <div className={styles.setInputWrapper}>
                    <input
                        ref={repCountInput}
                        type='number'
                        inputMode='numeric'
                        placeholder={`${data.minimumRecommendedRepetitions}-${data.maximumRecommendedRepetitions}`}
                    />
                </div>
                <span className={styles.setInput}>reps</span>
            </div>
            <button
                type='button'
                onClick={completeToggled}
                className={styles.setCompletedButton}
            >
                <i className='fa-solid fa-check'></i>
            </button>
        </div>
    );
}

function TimedSet({}: SetProps) {
    return <div></div>;
}

function RepBasedSet({}: SetProps) {
    return <div></div>;
}
