# This stage installs our modules
FROM node:16
WORKDIR /app
COPY package.json package-lock.json ./
COPY ./build .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python3

RUN npm ci --production


RUN npm prune --production


# Then we copy over the modules from above onto a `slim` image
# FROM mhart/alpine-node:slim-12

# If possible, run your container using `docker run --init`
# Otherwise, you can use `tini`:
# RUN apk add --no-cache tini
# ENTRYPOINT ["/sbin/tini", "--"]

# WORKDIR /app
# COPY ./build .
CMD ["npm", "start"]