import jwt from 'jsonwebtoken';
import { getContextJWTToken } from '../../../utils/getContextJWTToken';
import { findUser } from './findUser';
import type { AppQraphQLContext } from '../../../../types/AppQraphQLContext';

export const getContextUser = async (context: AppQraphQLContext) => {
    let token = getContextJWTToken(context);
    console.log('token', token);
    try {
        const decoded: any = jwt.verify(token || '', process.env.JWT_SECRET);
        const user = await findUser({ id: decoded.userId });

        return user;
    }
    catch (err) {
        return null;
    }
};

