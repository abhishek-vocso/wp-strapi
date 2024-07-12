"use strict";

module.exports = {
    async find(ctx) {
        try{
            return await strapi.plugin("site").service("site").find(ctx.query);
        }catch (err) {
            ctx.trow(500, err);
        }
    },
    async delete(ctx) {
        try {
          ctx.body = await strapi
            .plugin("site")
            .service("site")
            .delete(ctx.params.id);
        } catch (err) {
          ctx.throw(500, err);
        }
      },
    }