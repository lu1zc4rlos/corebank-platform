package com.corebank.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.corebank.api.dto.AccountResponseDTO;
import com.corebank.api.dto.UserResponseDTO;
import com.corebank.api.model.entity.User;
import com.corebank.api.service.AccountService;
import com.corebank.api.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

    private final UserService userService;
    private final AccountService accountService;

    public UserController(UserService userService, AccountService accountService) {
        this.userService = userService;
        this.accountService = accountService;
    }

    // Perfil do usuário logado + suas contas
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(Authentication authentication) {
        String email = authentication.getName();

        User user = userService.findByEmail(email);
        List<AccountResponseDTO> accounts = accountService.findByOwner(email)
                .stream()
                .map(AccountResponseDTO::from)
                .toList();

        return ResponseEntity.ok(UserResponseDTO.from(user, accounts));
    }
}