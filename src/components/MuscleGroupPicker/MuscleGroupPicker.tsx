import {
    ExerciseMuscleGroup,
    ExerciseMuscleGroups,
} from '@dgoudie/isometric-types';
import { useCallback, useRef } from 'react';

import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import styles from './MuscleGroupPicker.module.scss';

interface Props {
    value?: ExerciseMuscleGroup;
    valueChanged?: (value?: ExerciseMuscleGroup) => void;
    disabled?: boolean;
    required?: boolean;
}
export default function MuscleGroupPicker({
    value,
    valueChanged,
    required = false,
}: Props) {
    const details = useRef<HTMLDetailsElement>(null);

    const onClick = useCallback(
        (group: ExerciseMuscleGroup | undefined) => {
            details.current && (details.current.open = false);
            valueChanged && valueChanged(group);
        },
        [details, valueChanged]
    );

    return (
        <details ref={details} className={styles.root}>
            <summary>
                <MuscleGroupTag muscleGroup={value} />
            </summary>
            <div className={styles.body}>
                {!required && (
                    <button
                        className={styles.undefinedButton}
                        type='button'
                        onClick={() => onClick(undefined)}
                    >
                        <MuscleGroupTag />
                    </button>
                )}
                {ExerciseMuscleGroups.map((group) => (
                    <button type='button' onClick={() => onClick(group)}>
                        <MuscleGroupTag muscleGroup={group} />
                    </button>
                ))}
            </div>
        </details>
    );
}
