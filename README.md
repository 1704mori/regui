# regui

Regui is a web-based application designed to help users view and delete private Docker images by interacting with the Docker Registry's API.

## Environment Variables
The application can be configured using the following environment variables:
- `LISTEN_PORT`: Specifies the port on which the application will run.
- `REGISTRY_PORT`: Specifies the Docker Registry's API port.

## Getting Started

### Running the Application
To run the application, use the following `docker run` command, specifying the `LISTEN_PORT` and `REGISTRY_PORT` according to your setup:

```bash
docker run -d \
    --name regui \
    -p 9002:9002 \
    -e LISTEN_PORT=9002 \
    -e REGISTRY_PORT=9001 \
    -e REGISTRY_CREDENTIALS=user:pass \
    --network my_network \
    1704mori/regui:latest
```

## Notes
The regui's container must be in the same network as the Docker Registry's container in order to access the Docker Registry's API.
Also, the `REGISTRY_CREDENTIALS` environment variable is optional and should be used if the Docker Registry requires authentication.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.