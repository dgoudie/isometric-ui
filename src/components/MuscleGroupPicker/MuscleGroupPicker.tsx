import {
    ExerciseMuscleGroup,
    ExerciseMuscleGroups,
} from '@dgoudie/isometric-types';

import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import styles from './MuscleGroupPicker.module.scss';
import { useCallback } from 'react';
import { useDetails } from '@primer/react';

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
    const { getDetailsProps, setOpen } = useDetails({
        closeOnOutsideClick: true,
    });

    const onClick = useCallback(
        (group: ExerciseMuscleGroup | undefined) => {
            setOpen(false);
            valueChanged && valueChanged(group);
        },
        [setOpen, valueChanged]
    );

    return (
        <details {...getDetailsProps()} className={styles.root}>
            <summary>
                <MuscleGroupTag muscleGroup={value} />
                {!required && !!value && (
                    <button
                        className={styles.clear}
                        type='button'
                        onClick={() => onClick(undefined)}
                    >
                        <i className='fa-solid fa-xmark'></i>
                    </button>
                )}
            </summary>
            <div className={styles.body}>
                {ExerciseMuscleGroups.map((group) => (
                    <button
                        key={group}
                        type='button'
                        onClick={() => onClick(group)}
                    >
                        <MuscleGroupTag muscleGroup={group} />
                    </button>
                ))}
            </div>
        </details>
    );
}
