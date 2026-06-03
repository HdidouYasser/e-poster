package com.eposter.backend.auth;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record LoginResponse(String token, String username, String role) {}

    public record RegisterRequest(
        @NotBlank String email,
        @NotBlank String password,
        String firstName,
        String lastName
    ) {}
}
