import app from "../serverless.js";

export default function handler(req, res) {
  return app(req, res);
}
