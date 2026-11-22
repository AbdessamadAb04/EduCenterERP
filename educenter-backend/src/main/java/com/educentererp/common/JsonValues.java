package com.educentererp.common;

import java.time.LocalDate;
import java.util.Map;

public final class JsonValues {

    private JsonValues() {
    }

    public static boolean has(Map<String, Object> body, String key) {
        return body.containsKey(key) && body.get(key) != null;
    }

    public static String string(Map<String, Object> body, String key) {
        Object value = body.get(key);
        return value == null ? null : value.toString();
    }

    public static Long id(Map<String, Object> body, String key) {
        String value = string(body, key);
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid value for " + key + ": " + value);
        }
    }

    public static Integer integer(Map<String, Object> body, String key) {
        String value = string(body, key);
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid value for " + key + ": " + value);
        }
    }

    public static Double number(Map<String, Object> body, String key) {
        String value = string(body, key);
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.valueOf(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid value for " + key + ": " + value);
        }
    }

    public static LocalDate date(Map<String, Object> body, String key) {
        String value = string(body, key);
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid date for " + key + ": " + value);
        }
    }

    public static String idString(Long id) {
        return id == null ? null : String.valueOf(id);
    }

    public static String dateString(LocalDate date) {
        return date == null ? null : date.toString();
    }
}
