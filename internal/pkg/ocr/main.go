package ocr

import (
	"context"
	"fmt"
	"io"

	vision "cloud.google.com/go/vision/apiv1"
)

type Client interface {
	Do(ctx context.Context, image io.Reader) (*Result, error)
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

func (c *client) Do(ctx context.Context, image io.Reader) (*Result, error) {
	img, err := vision.NewImageFromReader(image)
	if err != nil {
		return nil, err
	}

	res, err := c.service.DetectDocumentText(ctx, img, nil)
	if err != nil {
		return nil, err
	}

	fmt.Println(res)

	return nil, nil
}

type Result struct {
}
