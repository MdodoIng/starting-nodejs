export function getPost(request, reply) {
  const { slug } = request.params;
  const { db } = request.server;
  const post = db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug);

  if (!post) {
    return reply.status(404).send({ error: "Post not found" });
  }

  return reply.view("post", { title: post.title, post });
}
