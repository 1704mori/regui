#!/bin/sh

envsubst '${LISTEN_PORT},${REGISTRY_PORT}' < /etc/nginx/nginx.conf.tmpl > /etc/nginx/nginx.conf

DIRECTORY="/usr/share/nginx/html/assets/"

if [ -d "$DIRECTORY" ]; then
  for file in ${DIRECTORY}*.js; do
    # Find all unique placeholders of the form __VAR_NAME__ and capture them
    placeholders=$(grep -oE '__[A-Za-z_]+__' "$file" | sort | uniq)

    for placeholder in $placeholders; do
      # Remove the leading and trailing '__'
      var_name=$(echo "$placeholder" | sed 's/^__\(.*\)__$/\1/')
      
      # Get the value of the environment variable, falling back to an empty string if not set
      var_value=$(printenv "$var_name" || echo '')

      # Use sed to replace the placeholder with the environment variable's value, if it exists
      if [ ! -z "$var_value" ]; then
        sed -i "s|${placeholder}|${var_value}|g" "$file"
      else
        echo "Warning: Environment variable for ${var_name} not set. Placeholder not replaced."
      fi
    done
  done
  echo "Placeholder replacement complete."
else
  echo "Directory does not exist: ${DIRECTORY}"
fi


exec "$@"

