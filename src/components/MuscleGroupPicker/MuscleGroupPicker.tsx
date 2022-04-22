import {
  ExerciseMuscleGroup,
  ExerciseMuscleGroups,
} from '@dgoudie/isometric-types';

import React from 'react';
import classNames from 'classnames';
import styles from './MuscleGroupPicker.module.scss';

interface Props {
  className?: string;
  value?: ExerciseMuscleGroup;
  valueChanged?: (value?: ExerciseMuscleGroup) => void;
  disabled?: boolean;
  required?: boolean;
}
export default function MuscleGroupPicker({
  className,
  value,
  valueChanged,
  required = false,
  disabled,
}: Props) {
  return (
    <select
      required={required}
      disabled={disabled}
      className={classNames(styles.root, className)}
      value={value}
      onChange={(e) =>
        valueChanged &&
        valueChanged((e.target.value as ExerciseMuscleGroup) ?? undefined)
      }
    >
      <option value={''}>N/A</option>
      {ExerciseMuscleGroups.map((group) => (
        <option key={group}>{group}</option>
      ))}
    </select>
  );
}
