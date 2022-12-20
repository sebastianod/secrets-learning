# secrets-learning
Learning to have secrets on projects such as api keys and secret keys.
I started with database level encryption using the mongoose-encryption package and learning
how to hide environment variables from app.js, storing secret keys in a .env file, using the
dotenv package.

Note that the mongoose-encryption package is not robust enough for all data, and some other
choices may be better suited for an app with sensitive data.
