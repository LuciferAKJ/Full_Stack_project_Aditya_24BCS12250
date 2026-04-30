package com.attendai.service;

import com.attendai.dto.AuthDTO;
import com.attendai.entity.User;
import com.attendai.repository.UserRepository;
import com.attendai.security.JwtUtil;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        UserDetails details = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(details);
        return buildResponse(user, token);
    }

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.TEACHER)
                .build();
        userRepository.save(user);
        UserDetails details = userDetailsService.loadUserByUsername(user.getEmail());
        return buildResponse(user, jwtUtil.generateToken(details));
    }

    private AuthDTO.AuthResponse buildResponse(User user, String token) {
        AuthDTO.AuthResponse.UserInfo info = new AuthDTO.AuthResponse.UserInfo();
        info.setId(user.getId());
        info.setName(user.getName());
        info.setEmail(user.getEmail());
        info.setRole(user.getRole().name());
        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setToken(token);
        response.setUser(info);
        return response;
    }
}
