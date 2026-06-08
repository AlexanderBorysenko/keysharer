import { createSchema } from 'graphql-yoga';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import type { AppQraphQLContext } from '../../types/AppQraphQLContext';

export const schema = createSchema<AppQraphQLContext>({
    typeDefs: typeDefs,
    resolvers: resolvers,
});
