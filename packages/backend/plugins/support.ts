import { fastifyPlugin } from 'fastify-plugin';

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

declare module 'fastify' {
  interface FastifyInstance {
    someSupport(): string
  }
}

export default fastifyPlugin(async function (fastify, opts) {
  fastify.decorate('someSupport', function () {
    return 'hugs'
  })
})
