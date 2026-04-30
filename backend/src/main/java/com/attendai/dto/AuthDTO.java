package com.attendai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTO {

    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 4) private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") private String password;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private UserInfo user;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public UserInfo getUser() { return user; }
        public void setUser(UserInfo user) { this.user = user; }

        public static class UserInfo {
            private Long id; private String name; private String email; private String role;
            public Long getId() { return id; } public void setId(Long id) { this.id = id; }
            public String getName() { return name; } public void setName(String n) { this.name = n; }
            public String getEmail() { return email; } public void setEmail(String e) { this.email = e; }
            public String getRole() { return role; } public void setRole(String r) { this.role = r; }
        }
    }
}
