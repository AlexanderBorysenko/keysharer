import jwt from 'jsonwebtoken';
import { getContextJWTToken } from '../../../utils/getContextJWTToken';
import { findUser } from './findUser';
import type { AppQraphQLContext } from '../../../../types/AppQraphQLContext';
import type { Context } from 'graphql-ws';
import type { Extra } from 'graphql-ws/lib/use/bun';

export const getContextUser = async (context: AppQraphQLContext | Context<Record<string, unknown> | undefined, Extra & Partial<Record<PropertyKey, never>>>) => {
    let token = getContextJWTToken(context);
    try {
        const decoded: any = jwt.verify(token || '', process.env.JWT_SECRET);
        const user = await findUser({ id: decoded.userId });

        return user;
    }
    catch (err) {
        return null;
    }
};

// Decode the user without verifying the token
export const unsafeGetContextUser = async (context: AppQraphQLContext | Context<Record<string, unknown> | undefined, Extra & Partial<Record<PropertyKey, never>>>) => {
    let token = getContextJWTToken(context);
    try {
        const decoded: any = jwt.decode(token || '');
        const user = await findUser({ id: decoded.userId });

        return user;
    }
    catch (err) {
        return null;
    }
};
