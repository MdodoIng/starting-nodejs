export function deletePost(request, reply) {
  const { slug } = request.params;
  const { db } = request.server;

  const deleteStatement = db.prepare("DELETE FROM posts WHERE slug = ?");
  deleteStatement.run(slug);

  return reply.redirect("/");
}