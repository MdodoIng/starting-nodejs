import slugify from "slugify";
import Ajv from "ajv";

const ajv = new Ajv();

// Define the schema for post data
const postSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      pattern: "^(?=.*[a-zA-Z]).+$",
    },
    content: { type: "string", minLength: 1 },
  },
  required: ["title", "content"],
  additionalProperties: false,
}

const validatePost = ajv.compile(postSchema);

export function getNewPost(request, reply) {
  return reply.view("new", { title: "Create a new post" });
}

export function createPost(request, reply) {
  const { title, content } = request.body;

  // Validate the input
  const valid = validatePost({ title, content });
  if (!valid) {
    return reply.status(400).send({
      error: "Invalid input",
      details: validatePost.errors,
    });
  }

  const slug = slugify(title, { lower: true, strict: true });
  const { db } = request.server;
  const insertStatement = db.prepare(
    "INSERT INTO posts (title, slug, content) VALUES (?, ?, ?)",
  );
  insertStatement.run(title, slug, content);

  return reply.redirect("/");
}
