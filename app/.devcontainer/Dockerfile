# References:
# - https://github.com/nodejs/docker-node/blob/main/20/bookworm/Dockerfile
# - https://github.com/devcontainers/images

FROM node:20.12.1-bookworm

# Give the node user passwordless sudo. This is required to change the ownership of the node_modules folder (see devcontainer.json).
RUN apt-get update \
	&& apt-get install --yes sudo \
	&& echo "node ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/node
