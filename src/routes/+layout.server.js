// src/routes/+layout.server.js
export async function load({ locals }) {
  return {
    session: locals.session
  };
}