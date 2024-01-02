import { init } from './actions/init';
import { create } from './actions/create';
import { up } from './actions/up';
import { status } from './actions/status';
import { down } from './actions/down';

export const initAction = async () => {
    return init();
};

export const createAction = async (description: string) => {
    return create(description);
};

export const upAction = async (profile = 'default', migrationLogTable = 'MIGRATION_LOG_DB') => {
    return up(profile, migrationLogTable);
};

export const downAction = async (profile = 'default', downShift = 1, migrationLogTable = 'MIGRATION_LOG_DB') => {
    return down(profile, downShift, migrationLogTable);
};

export const statusAction = async (profile = 'default', migrationLogTable = 'MIGRATION_LOG_DB') => {
    return status(profile, migrationLogTable);
};
