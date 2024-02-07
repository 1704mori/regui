#!/bin/sh

# Generate the actual nginx.conf from the template
envsubst '${LISTEN_PORT},${REGISTRY_PORT}' < /etc/nginx/nginx.conf.tmpl > /etc/nginx/nginx.conf

# Now start nginx with the specified CMD from the Dockerfile
exec "$@"

