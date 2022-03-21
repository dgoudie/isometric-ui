import React, { useState } from 'react';

import BottomSheet from '../BottomSheet/BottomSheet';
import { ExerciseMuscleGroup } from '@dgoudie/isometric-types';
import ExerciseSearch from '../ExerciseSearch/ExerciseSearch';
import styles from './ExercisePickerBottomSheet.module.scss';
import useDebounce from '../../utils/use-debouce';

interface Props {
    onResult: (result: string | undefined) => void;
}

export default function ExercisePickerBottomSheet({ onResult }: Props) {
    const [search, setSearch] = useState<string>();
    const [muscleGroup, setMuscleGroup] = useState<ExerciseMuscleGroup>();

    const searchDebounced = useDebounce(search, 500);

    return (
        <BottomSheet onResult={onResult} title='Select an Exercise'>
            {(onResult) => (
                <div className={styles.root}>
                    <ExerciseSearch
                        search={searchDebounced}
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
