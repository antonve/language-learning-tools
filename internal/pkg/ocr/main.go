package ocr

import (
	"context"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/vision/v1"
)

type Client interface {
	Do(image string) (*Result, error)
}

type client struct {
	service *vision.Service
}

func New() (*client, error) {
	ctx := context.Background()

	googleClient, err := google.DefaultClient(ctx, vision.CloudPlatformScope)
	if err != nil {
		return nil, err
	}

	service, err := vision.New(googleClient)
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
