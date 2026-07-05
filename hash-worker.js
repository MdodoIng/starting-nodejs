import bcrypt from "bcrypt";
export default function ({ password }) {
  return bcrypt.hashSync(password, 12);
}
