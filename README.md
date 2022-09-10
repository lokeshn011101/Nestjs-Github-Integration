<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

A starter repo for GitHub integration with NestJS

## Installation

```bash
$ npm install
```

## Running the app

1. Go to `Settings`.
2. Go to the `Developer settings` pane on the right.
3. Click the `OAuth Apps` pane.
4. Click `New OAuth App`.
5. Enter `http://localhost:3000/` in the Homepage URL.
6. Enter `http://localhost:3000/callback` in the Authorization callback URL.
7. Click Register application.
8. After cloning this project locally, create a file `keys.json` in the root directory.
9. Add
   `{ "CLIENT_ID": <client id of the created oauth app>, "CLIENT_SECRET": <client secret of the created oauth app> }`
10. For running the application:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
