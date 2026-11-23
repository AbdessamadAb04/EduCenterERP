package com.educentererp.module.idempotency;

import com.educentererp.common.IdempotencyHash;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyKeyRepository repository;
    private final ObjectMapper objectMapper;

    public <T> Optional<T> replay(String key, Object payload, Class<T> type) {
        if (key == null || key.isBlank()) {
            return Optional.empty();
        }
        return repository.findByIdempotencyKey(key).map(entry -> {
            if (!hash(payload).equals(entry.getRequestHash())) {
                throw new IllegalStateException("Idempotency key already used with a different payload");
            }
            try {
                return objectMapper.readValue(entry.getResponseBody(), type);
            } catch (JsonProcessingException ex) {
                throw new IllegalStateException("Unable to read idempotent response", ex);
            }
        });
    }

    public void store(String key, Object payload, Object response) {
        if (key == null || key.isBlank() || repository.findByIdempotencyKey(key).isPresent()) {
            return;
        }
        try {
            repository.save(new IdempotencyKey(
                    null,
                    key,
                    hash(payload),
                    objectMapper.writeValueAsString(response),
                    LocalDateTime.now()
            ));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Unable to store idempotent response", ex);
        }
    }

    private String hash(Object payload) {
        try {
            return IdempotencyHash.sha256(objectMapper.writeValueAsString(payload));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Unable to hash idempotent payload", ex);
        }
    }
}
