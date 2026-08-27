package jamie;

import java.util.concurrent.ConcurrentHashMap;
import java.time.*;

record CacheElement<T>(T data, Instant time) {};

// TODO: maybe self allocate so all types can be used with the cache
public class Cache<T> {
    ConcurrentHashMap<String, CacheElement<T>> cache = new ConcurrentHashMap<>();

    public void addToCache(String path, T data) {
        Instant now = Instant.now();

        CacheElement<T> cacheElement = new CacheElement<>(data, now);
        this.cache.put(path, cacheElement);
    }

    public T getFromCache(String path) {
        Instant now = Instant.now();
        CacheElement<T> cache = this.cache.get(path);

        if (cache != null && Duration.between(cache.time(), now).toMinutes() < 15) {
            return cache.data();
        } else {
            this.cache.remove(path);
            return null;
        }
    }
}
