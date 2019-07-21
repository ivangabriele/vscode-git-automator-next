FROM igabriele/node-vscode:10

WORKDIR /app

COPY scripts scripts
COPY src src
COPY test test
COPY jest.config.js jest.config.js
COPY package.json package.json
COPY rollup.config.dev.js rollup.config.dev.js
COPY rollup.config.js rollup.config.js
COPY tsconfig.json tsconfig.json
COPY tsconfig.test.json tsconfig.test.json
COPY tslint.json tslint.json
COPY yarn.lock yarn.lock

RUN yarn --frozen-lockfile

ENTRYPOINT [ "./scripts/docker/test.sh" ]
