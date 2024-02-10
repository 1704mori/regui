IMAGE_NAME = regui
TAG = latest
DOCKER_USER = 1704mori

all: build

build:
	docker buildx build -f docker/Dockerfile --progress=plain -t $(IMAGE_NAME):$(TAG) .

tag:
	docker tag $(IMAGE_NAME):$(TAG) $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)

login:
	docker login

push:
	docker push $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)

clean:
	docker rmi $(DOCKER_USER)/$(IMAGE_NAME):$(TAG) $(IMAGE_NAME):$(TAG)

.PHONY: all build tag login push clean
