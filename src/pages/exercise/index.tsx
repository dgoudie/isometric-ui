import * as Yup from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Navigate, useParams } from 'react-router-dom';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import Button from '../../components/Button/Button';
import { IExercise } from '@dgoudie/isometric-types';
import Loader from '../../components/Loader/Loader';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import classNames from 'classnames';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const ExerciseSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    breakTimeInSeconds: Yup.number()
        .integer('Break time must be a number')
        .positive('Break time must be more than zero')
        .max(300, 'Break time must be less than 5 minutes')
        .required('Break Time is required'),
});

const ExerciseDetail = () => {
    const { exerciseName } = useParams();

    const [response, error, loading] = useFetchFromApi<IExercise>(
        `/api/exercise/${exerciseName}`,
        null,
        null,
        false
    );

    if (!!loading) {
        return <RouteLoader />;
    }

    if (!!error) {
        return <Navigate to={'/error'} />;
    }

    return (
        <AppBarWithAppHeaderLayout pageTitle={exerciseName!}>
            <div className={styles.root}>
                <Formik
                    initialValues={response!.data}
                    validationSchema={ExerciseSchema}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >
                    {(formik) => {
                        const { isValid, isSubmitting, resetForm } = formik;
                        return (
                            <Form>
                                <label htmlFor='name'>Name</label>
                                <Field
                                    autoFocus
                                    id='name'
                                    name='name'
                                    className={classNames(
                                        'standard-form-input',
                                        styles.input
                                    )}
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage
                                    name='name'
                                    component='span'
                                    className={styles.errorMessage}
                                />
                                <label htmlFor='breakTimeInSeconds'>
                                    Break Time Between Sets (In Seconds)
                                </label>
                                <Field
                                    type='number'
                                    id='breakTimeInSeconds'
                                    name='breakTimeInSeconds'
                                    className={classNames(
                                        'standard-form-input',
                                        styles.input
                                    )}
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage
                                    name='breakTimeInSeconds'
                                    component='span'
                                    className={styles.errorMessage}
                                />

                                <div className={styles.buttonBar}>
                                    <Button
                                        type='button'
                                        onClick={() => resetForm()}
                                        disabled={isSubmitting}
                                    >
                                        <i className='fa-solid fa-rotate-left'></i>
                                        Reset
                                    </Button>
                                    <Button
                                        primary
                                        type='submit'
                                        disabled={!isValid || isSubmitting}
                                    >
                                        <i className='fa-solid fa-floppy-disk'></i>
                                        Save
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </AppBarWithAppHeaderLayout>
    );
};

export default ExerciseDetail;
