package ocr

import (
	"context"

	vision "cloud.google.com/go/vision/apiv1"
)

type Client interface {
	Do(image string) (*Result, error)
}

type client struct {
	service *vision.ImageAnnotatorClient
}

func New() (*client, error) {
	ctx := context.Background()

	service, err := vision.NewImageAnnotatorClient(ctx)
	if err != nil {
		return nil, err
	}

	return &client{service: service}, nil
}

func (c *client) Do(image string) (*Result, error) {
	return nil, nil
}

type Result struct {
}
