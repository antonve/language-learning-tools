package persistedcache

import (
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
)

type PersistedCache interface {
	Get(key string) (value []byte, ok bool)
	Put(key string, value []byte) error
}

type persistedCache struct {
	path   string
	lookup map[string][]byte
}

func New(cachePath string) (PersistedCache, error) {
	c := &persistedCache{
		path:   cachePath,
		lookup: map[string][]byte{},
	}

	err := filepath.WalkDir(cachePath, func(path string, d fs.DirEntry, _ error) error {
		if d.IsDir() {
			return nil
		}

		content, err := c.getFileContents(path)
		if err != nil {
			return err
		}

		c.lookup[d.Name()] = content
		return nil
	})

	delete(c.lookup, ".gitkeep")

	return c, err
}

func (c *persistedCache) getFileContents(path string) ([]byte, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	return ioutil.ReadAll(f)
}

func (c *persistedCache) Get(key string) ([]byte, bool) {
	val, ok := c.lookup[key]
	return val, ok
}

func (c *persistedCache) Put(key string, value []byte) error {
	if err := os.WriteFile(c.path+key, value, 0644); err != nil {
		return err
	}

	c.lookup[key] = value

	return nil
}
