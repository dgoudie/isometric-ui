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
                <label htmlFor='name'>Name</label>
                <IsolatedInput
                    defaultValue={response?.data.name}
                    id='name'
                    name='name'
                />
            </div>
        </AppBarWithAppHeaderLayout>
    );
};

export default ExerciseDetail;
