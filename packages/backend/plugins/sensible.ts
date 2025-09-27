import {fastifyPlugin} from 'fastify-plugin';
import {fastifySensible} from '@fastify/sensible';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fastifyPlugin(async function (fastify, opts) {
  fastify.register(fastifySensible, {});
})
