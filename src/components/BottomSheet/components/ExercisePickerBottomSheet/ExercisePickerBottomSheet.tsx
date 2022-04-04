import React, { useState } from 'react';

import BottomSheet from '../../BottomSheet';
import { ExerciseMuscleGroup } from '@dgoudie/isometric-types';
import ExerciseSearch from '../../../ExerciseSearch/ExerciseSearch';
import styles from './ExercisePickerBottomSheet.module.scss';

interface Props {
  search?: string;
  muscleGroup?: ExerciseMuscleGroup;
  onResult: (result: string | undefined) => void;
}

export default function ExercisePickerBottomSheet({
  onResult,
  search: initialSearch,
  muscleGroup: initialMuscleGroup,
}: Props) {
  const [search, setSearch] = useState<string | undefined>(initialSearch);
  const [muscleGroup, setMuscleGroup] = useState<
    ExerciseMuscleGroup | undefined
  >(initialMuscleGroup);

  return (
    <BottomSheet onResult={onResult} title='Select an Exercise'>
      {(onResult) => (
        <div className={styles.root}>
          <ExerciseSearch
            className={styles.exerciseSearch}
            search={search}
            searchChanged={setSearch}
            muscleGroup={muscleGroup}
            muscleGroupChanged={setMuscleGroup}
            onSelect={onResult}
          />
        </div>
      )}
    </BottomSheet>
  );
}
