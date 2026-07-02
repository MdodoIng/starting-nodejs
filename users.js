// In-memory for now — swap for a real DB later.
export const users = [];
export let nextId = 1;

export function findByUsername(username) {
  return users.find((u) => u.username === username);
}

export function findById(id) {
  return users.find((u) => u.id === id);
}

export function createUser(username, passwordHash) {
  const user = { id: nextId++, username, passwordHash };
  users.push(user);
  return user;
}
