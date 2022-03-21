import {
    ExerciseMuscleGroup,
    ExerciseMuscleGroups,
} from '@dgoudie/isometric-types';
import { useEffect, useState } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import ExerciseSearch from '../../components/ExerciseSearch/ExerciseSearch';
import styles from './index.module.scss';
import useDebounce from '../../utils/use-debouce';
import { useSearchParams } from 'react-router-dom';

const Exercises = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const q = searchParams.get('q');
    const muscleGroup = searchParams.get('muscleGroup');
    const muscleGroupDecoded = !!muscleGroup
        ? (muscleGroup as ExerciseMuscleGroup)
        : undefined;

    const [searchTerm, setSearchTerm] = useState(q ?? undefined);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (
            !!muscleGroupDecoded &&
            !ExerciseMuscleGroups.includes(muscleGroupDecoded)
        ) {
            searchParams.delete('muscleGroup');
            setSearchParams(searchParams);
        }
    }, [muscleGroupDecoded, searchParams, setSearchParams]);

    useEffect(() => {
        if (!!debouncedSearchTerm) {
            searchParams.set('q', debouncedSearchTerm);
        } else {
            searchParams.delete('q');
        }
        setSearchParams(searchParams);
    }, [debouncedSearchTerm, searchParams, setSearchParams]);

    return (
        <AppBarWithAppHeaderLayout pageTitle={'Exercises'}>
            <div className={styles.root}>
                <ExerciseSearch
                    search={searchTerm}
                    searchChanged={setSearchTerm}
                    muscleGroup={muscleGroupDecoded}
                    muscleGroupChanged={(group) => {
                        if (!group) {
                            searchParams.delete('muscleGroup');
                        } else {
                            searchParams.set('muscleGroup', group);
                        }
                        setSearchParams(searchParams);
                    }}
                />
            </div>
        </AppBarWithAppHeaderLayout>
    );
};

export default Exercises;
