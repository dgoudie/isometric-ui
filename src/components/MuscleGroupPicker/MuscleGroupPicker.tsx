import {
  ExerciseMuscleGroup,
  ExerciseMuscleGroups,
} from '@dgoudie/isometric-types';

import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import React from 'react';
import classNames from 'classnames';
import styles from './MuscleGroupPicker.module.scss';
import { useCallback } from 'react';
import { useDetails } from '@primer/react';

interface Props {
  className?: string;
  value?: ExerciseMuscleGroup;
  valueChanged?: (value?: ExerciseMuscleGroup) => void;
  disabled?: boolean;
  required?: boolean;
  align?: 'right' | 'left' | 'middle';
}
export default function MuscleGroupPicker({
  className,
  value,
  valueChanged,
  required = false,
  disabled,
  align = 'middle',
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

  const onDetailsClick = useCallback<React.MouseEventHandler>(
    (event) => {
      if (!!disabled) {
        event.preventDefault();
      }
    },
    [disabled]
  );

  return (
    <details
      {...getDetailsProps()}
      onClick={onDetailsClick}
      className={classNames(className, styles.root, styles[align])}
    >
      <summary>
        <MuscleGroupTag muscleGroup={value} />
        {!disabled && !required && !!value && (
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
          <button key={group} type='button' onClick={() => onClick(group)}>
            <MuscleGroupTag muscleGroup={group} />
          </button>
        ))}
      </div>
    </details>
  );
}
