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
    --name registry_ui \
    -p 9001:9001 \
    -e LISTEN_PORT=9001 \
    -e REGISTRY_PORT=5000 \
    1704mori/regui:latest
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.