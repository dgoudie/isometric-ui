import {
    ExerciseMuscleGroup,
    ExerciseMuscleGroups,
} from '@dgoudie/isometric-types';
import chroma, { contrast } from 'chroma-js';

import classNames from 'classnames';
import styles from './MuscleGroupTag.module.scss';
import { useMemo } from 'react';

const colorScale = chroma
    .scale([
        '#DE3163',
        '#FF7F50',
        '#FFBF00',
        '#DFFF00',
        '#9FE2BF',
        '#40E0D0',
        '#6495ED',
        '#CCCCFF',
    ])
    .mode('lch')
    .colors(ExerciseMuscleGroups.length);

interface Props {
    muscleGroup: ExerciseMuscleGroup;
    className?: string;
}

export default function MuscleGroupTag({ muscleGroup, className }: Props) {
    const backgroundColor = useMemo(
        () => colorScale[ExerciseMuscleGroups.indexOf(muscleGroup)],
        [muscleGroup]
    );
    let color = 'black';
    if (contrast(backgroundColor, color) < 7) {
        color = 'white';
    }
    return (
        <div
            className={classNames(className, styles.item)}
            style={{ backgroundColor, color }}
        >
            {muscleGroup.toUpperCase()}
        </div>
    );
}
