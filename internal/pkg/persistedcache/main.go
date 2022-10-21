package persistedcache

type PersistedCache interface {
	Get(key string) string
	Put(key, value string)
}

type persistedCache struct {
}

func New() PersistedCache {
	return &persistedCache{}
}

func (c *persistedCache) Get(key string) string { return "" }

func (c *persistedCache) Put(key, value string) {}
