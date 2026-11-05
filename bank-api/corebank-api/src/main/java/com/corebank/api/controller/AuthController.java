package com.corebank.api.controller;

import java.time.LocalDate;
import java.time.Period;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.corebank.api.dto.AuthRequestDTO;
import com.corebank.api.dto.AuthResponseDTO;
import com.corebank.api.dto.RegisterRequestDTO;
import com.corebank.api.model.entity.User;
import com.corebank.api.repository.UserRepository;
import com.corebank.api.security.JwtService;
import com.corebank.api.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int MINIMUM_AGE = 18;

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService,
                          JwtService jwtService,
                          UserService userService,
                          UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> authenticate(@Valid @RequestBody AuthRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwtToken = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(AuthResponseDTO.builder().token(jwtToken).build());
    }

    @PostMapping("/cadastrar-se")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        final String email = request.email().trim();
        final String cpf = request.cpf().replaceAll("\\D", ""); // remove a máscara: 11 dígitos

        // Maioridade
        if (Period.between(request.birthDate(), LocalDate.now()).getYears() < MINIMUM_AGE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "É necessário ter pelo menos " + MINIMUM_AGE + " anos para abrir uma conta");
        }

        // Unicidade
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        if (userRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(email)
                .cpf(cpf)
                .birthDate(request.birthDate())
                .phone(request.phone())
                .password(request.password()) // o UserService faz o hash (BCrypt) antes de salvar
                .build();

        // Salva o usuário e abre a conta bancária
        userService.registerUser(user);

        // Já devolve o token para o usuário entrar logado após o cadastro
        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwtToken = jwtService.generateToken(userDetails);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponseDTO.builder().token(jwtToken).build());
    }
}