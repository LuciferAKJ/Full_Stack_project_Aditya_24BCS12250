package com.attendai.controller;

import com.attendai.dto.SessionDTO;
import com.attendai.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    public SessionController(SessionService sessionService) { this.sessionService = sessionService; }

    @GetMapping
    public ResponseEntity<List<SessionDTO.Response>> getAll(@RequestParam(required = false) String className) {
        return ResponseEntity.ok(sessionService.getAllSessions(className));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }

    @PostMapping
    public ResponseEntity<SessionDTO.Response> create(
            @Valid @RequestBody SessionDTO.CreateRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(sessionService.createSession(request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
