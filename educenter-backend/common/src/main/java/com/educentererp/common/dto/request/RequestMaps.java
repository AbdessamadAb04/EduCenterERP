package com.educentererp.common.dto.request;

import java.util.Map;

public final class RequestMaps {

    private RequestMaps() {
    }

    public static void put(Map<String, Object> values, String key, Object value) {
        if (value != null) {
            values.put(key, value);
        }
    }
}
