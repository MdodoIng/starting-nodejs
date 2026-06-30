import { getRoot } from "../controllers/root.controller.js";
import {
  getNewPost,
  createPost,
} from "../controllers/createPost.controller.js";
import { getPost } from "../controllers/getPost.controller.js";
import { editPost, getEditPost } from "../controllers/editPost.controller.js";
import { deletePost } from "../controllers/deletePost.controller.js";
import errorHandler from "../middleware/error.js";

export default async function routes(fastify, options) {
  fastify.get("/", getRoot);
  fastify.register(
    async function (postRoutes) {
      postRoutes.get("/new", getNewPost);
      postRoutes.post("/", createPost);
      postRoutes.get("/:slug", getPost);
      postRoutes.get("/:slug/edit", getEditPost);
      postRoutes.post("/:slug/edit", editPost);
      postRoutes.post("/:slug/delete", deletePost);
    },
    { prefix: "/post" },
  );
  fastify.setErrorHandler(errorHandler);
}
