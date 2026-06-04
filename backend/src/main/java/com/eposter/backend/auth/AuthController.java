package com.eposter.backend.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthDtos.LoginResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.LoginResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * Google OAuth2 login — accepts the Google ID token from the frontend
     * (obtained via @react-oauth/google), verifies it, and returns an application JWT.
     */
    @PostMapping("/google")
    public AuthDtos.LoginResponse loginWithGoogle(@Valid @RequestBody AuthDtos.GoogleLoginRequest request) {
        return authService.loginWithGoogle(request.credential());
    }

    @GetMapping("/me")
    public String me() {
        return "authenticated";
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public java.util.Map<String, String> invalidCredentials(IllegalArgumentException ex) {
        return java.util.Map.of("message", ex.getMessage());
    }
}
