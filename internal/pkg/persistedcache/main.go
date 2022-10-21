package persistedcache

import (
	"bytes"
	"crypto/sha256"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
)

type PersistedCache interface {
	Get(key string) string
	Put(key, value string)
}

type persistedCache struct {
	path   string
	lookup map[string]string
}

func New(cachePath string) (PersistedCache, error) {
	c := &persistedCache{
		path:   cachePath,
		lookup: map[string]string{},
	}

	err := filepath.WalkDir(cachePath, func(path string, d fs.DirEntry, err error) error {
		if d.IsDir() {
			return nil
		}

		content, err := c.getFileContents(path)
		if err != nil {
			return err
		}

		c.lookup[d.Name()] = string(content)
		return nil
	})

	delete(c.lookup, ".gitkeep")

	return c, err
}

func (c *persistedCache) getFileContents(path string) ([]byte, error) {
	f, err := os.Open(path)
	defer f.Close()
	if err != nil {
		return nil, err
	}

	return ioutil.ReadAll(f)
}

func (c *persistedCache) hash(content []byte) (string, error) {
	r := bytes.NewReader(content)
	hash := sha256.New()
	if _, err := io.Copy(hash, r); err != nil {
		return "", err
	}

	sum := hash.Sum(nil)

	return fmt.Sprintf("%x", sum), nil
}

func (c *persistedCache) Get(key string) string { return "" }

func (c *persistedCache) Put(key, value string) {}
