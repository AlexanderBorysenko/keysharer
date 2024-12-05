import { type YogaInitialContext } from 'graphql-yoga';
import type { User } from '../src/models/user/user.types';

export type AppQraphQLContext = YogaInitialContext & {
  user: User | null;
};