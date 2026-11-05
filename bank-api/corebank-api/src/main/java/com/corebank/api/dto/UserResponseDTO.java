package com.corebank.api.dto;

import com.corebank.api.model.entity.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        String cpf,
        LocalDate birthDate,
        String phone,
        LocalDateTime createdAt,
        List<AccountResponseDTO> accounts
) {
    public static UserResponseDTO from(User user, List<AccountResponseDTO> accounts) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.getBirthDate(),
                user.getPhone(),
                user.getCreatedAt(),
                accounts
        );
    }
}