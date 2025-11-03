import jwt from "jsonwebtoken";

export function generateToken(payload: object, secret: string, option: jwt.SignOptions) {
  return jwt.sign(payload, secret, option);
}
