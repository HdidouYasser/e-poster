package com.eposter.backend.auth;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    /** Extended to carry profile fields so the frontend can hydrate the store in one shot */
    public record LoginResponse(
            String token,
            String username,
            String role,
            String firstName,
            String lastName,
            String avatarUrl
    ) {}

    public record RegisterRequest(
        @NotBlank String email,
        @NotBlank String password,
        String firstName,
        String lastName
    ) {}

    /** Payload sent by the frontend after Google Identity Services returns a credential (ID token) */
    public record GoogleLoginRequest(@NotBlank String credential) {}
}
