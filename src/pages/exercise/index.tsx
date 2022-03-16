import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { IExercise } from '@dgoudie/isometric-types';
import IsolatedInput from '../../components/IsolatedInput/IsolatedInput';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';
import { useParams } from 'react-router-dom';

const ExerciseDetail = () => {
    const { exerciseName } = useParams();

    const [response, error, loading] = useFetchFromApi<IExercise>(
        `/api/exercise/${exerciseName}`,
        null,
        null,
        false
    );

    return (
        <AppBarWithAppHeaderLayout
            pageTitle={exerciseName!}
            showLoading={loading}
        >
            <div className={styles.root}>
                <label htmlFor='exercise-name'>Name</label>
                <IsolatedInput
                    defaultValue={response?.data.name}
                    id='exercise-name'
                    name='exercise-name'
                />
                <label htmlFor='exercise-break-time'>
                    Break Time Between Sets (In Seconds)
                </label>
                <IsolatedInput
                    defaultValue={response?.data.breakTimeInSeconds.toString()}
                    type='number'
                    id='exercise-break-time'
                    name='exercise-break-time'
                />
            </div>
        </AppBarWithAppHeaderLayout>
    );
};

export default ExerciseDetail;
